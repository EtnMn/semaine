import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders } from "jsr:@supabase/supabase-js/cors";
import { errorResponse, serverErrorResponse } from "../error-response.ts";

const TASK_PERIODICITIES = ["unique", "daily", "weekly", "monthly", "yearly"];
const TASK_DIFFICULTIES = ["easy", "medium", "hard"];

function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return errorResponse(401, "Missing Authorization header", corsHeaders);
    }

    // Client scoped to the calling user (anon key + user JWT) — used to verify identity and role
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const {
      data: { user },
      error: userError,
    } = await supabaseUser.auth.getUser();

    if (userError || !user) {
      return errorResponse(401, "Unauthorized", corsHeaders);
    }

    // Verify the caller has admin role (tasks insert/update is no longer gated by RLS,
    // this check is the only authorization gate for task writes)
    const { data: profile, error: profileError } = await supabaseUser
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || profile?.role !== "admin") {
      return errorResponse(403, "Forbidden: admin role required", corsHeaders);
    }

    // Parse and validate request body
    const body = await req.json();
    const id: string | undefined = body?.id || undefined;
    const name: string = body?.name ?? "";
    const description: string = body?.description ?? "";
    const periodicity: string = body?.periodicity ?? "";
    const difficulty: string = body?.difficulty ?? "";
    const duration: number = body?.duration;
    const tags: string[] = Array.isArray(body?.tags) ? body.tags : [];
    const started = !!body?.started;

    if (!name.trim()) {
      return errorResponse(400, "Task name is required", corsHeaders);
    }

    if (!TASK_PERIODICITIES.includes(periodicity)) {
      return errorResponse(400, "Invalid periodicity", corsHeaders);
    }

    if (!TASK_DIFFICULTIES.includes(difficulty)) {
      return errorResponse(400, "Invalid difficulty", corsHeaders);
    }

    if (typeof duration !== "number" || duration < 0) {
      return errorResponse(400, "Invalid duration", corsHeaders);
    }

    // Admin client with service_role key — bypasses RLS for tasks and chores writes
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const taskPayload = { name, description, periodicity, difficulty, duration, tags, started };

    const { data: task, error: taskError } = id
      ? await supabaseAdmin
          .from("tasks")
          .update(taskPayload)
          .eq("id", id)
          .select("id, name, description, periodicity, difficulty, started, duration, tags")
          .single()
      : await supabaseAdmin
          .from("tasks")
          .insert(taskPayload)
          .select("id, name, description, periodicity, difficulty, started, duration, tags")
          .single();

    if (taskError) {
      return serverErrorResponse(corsHeaders, taskError, "save-task: upsert task");
    }

    if (!task) {
      return errorResponse(404, "Task not found", corsHeaders);
    }

    // If started is true, create the chore after the task is created
    if (task.started) {
      const { error: choreError } = await supabaseAdmin
        .from("chores")
        .insert({ task_id: task.id, date: todayDate() });

      // Ignore if chore already exists (constraint violation)
      if (choreError && choreError.code !== "23505") {
        return serverErrorResponse(corsHeaders, choreError, "save-task: insert chore");
      }
    }

    // If started is false, delete associated chores
    if (!task.started && id) {
      const { error: choreError } = await supabaseAdmin
        .from("chores")
        .delete()
        .eq("task_id", task.id);

      if (choreError) {
        return serverErrorResponse(corsHeaders, choreError, "save-task: delete chores");
      }
    }

    return new Response(JSON.stringify(task), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return serverErrorResponse(corsHeaders, err, "save-task: unhandled");
  }
});
