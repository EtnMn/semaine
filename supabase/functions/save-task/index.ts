import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders } from "jsr:@supabase/supabase-js/cors";
import { errorResponse, serverErrorResponse } from "../error-response.ts";
import { parseRequestBody } from "../validation.ts";

const TASK_PERIODICITIES = ["unique", "daily", "weekly", "monthly", "yearly"];
const TASK_DIFFICULTIES = ["easy", "medium", "hard"];

function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return errorResponse(405, "Method not allowed", corsHeaders);
  }

  if (req.headers.get("Content-Type") !== "application/json") {
    return errorResponse(400, "Content-Type must be application/json", corsHeaders);
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
    const body = await parseRequestBody(req);
    if (body instanceof Response) {
      return body;
    }

    if (!!body.id && (typeof body.id !== "string" || body.id.length !== 36)) {
      return errorResponse(400, "Invalid task id", corsHeaders);
    }

    if (typeof body.name !== "string" || !body.name.trim() || body.name.length > 255) {
      return errorResponse(400, "Invalid or missing task name", corsHeaders);
    }

    if (typeof body.description !== "string" || body.description.length > 1000) {
      return errorResponse(400, "Invalid task description", corsHeaders);
    }

    if (typeof body.periodicity !== "string" || !TASK_PERIODICITIES.includes(body.periodicity)) {
      return errorResponse(400, "Invalid or missing periodicity", corsHeaders);
    }

    if (typeof body.difficulty !== "string" || !TASK_DIFFICULTIES.includes(body.difficulty)) {
      return errorResponse(400, "Invalid difficulty", corsHeaders);
    }

    if (typeof body.duration !== "number") {
      return errorResponse(400, "Invalid task duration", corsHeaders);
    }

    if (Array.isArray(body?.tags) && body.tags.length > 10) {
      return errorResponse(400, "Too many tags", corsHeaders);
    }

    const tags: string[] = Array.isArray(body?.tags) ? body.tags : [];
    const started = !!body?.started;

    // Admin client with service_role key — bypasses RLS for tasks and chores writes
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const taskPayload = {
      name: body.name,
      description: body.description,
      periodicity: body.periodicity,
      difficulty: body.difficulty,
      duration: body.duration,
      tags,
      started,
    };

    const { data: task, error: taskError } = body.id
      ? await supabaseAdmin
          .from("tasks")
          .update(taskPayload)
          .eq("id", body.id)
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
    if (!task.started && body.id) {
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
