import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders } from "jsr:@supabase/supabase-js/cors";

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
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify the caller has admin role (tasks insert/update is no longer gated by RLS,
    // this check is the only authorization gate for task writes)
    const { data: profile, error: profileError } = await supabaseUser
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || profile?.role !== "admin") {
      return new Response(JSON.stringify({ error: "Forbidden: admin role required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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
      return new Response(JSON.stringify({ error: "Task name is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!TASK_PERIODICITIES.includes(periodicity)) {
      return new Response(JSON.stringify({ error: "Invalid periodicity" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!TASK_DIFFICULTIES.includes(difficulty)) {
      return new Response(JSON.stringify({ error: "Invalid difficulty" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (typeof duration !== "number" || duration < 0) {
      return new Response(JSON.stringify({ error: "Invalid duration" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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

    if (taskError || !task) {
      return new Response(JSON.stringify({ error: taskError?.message ?? "Task not found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If started is true, create/upsert the chore after the task is created
    if (task.started) {
      const { error: choreError } = await supabaseAdmin
        .from("chores")
        .upsert(
          { task_id: task.id, date: todayDate() },
          { onConflict: "task_id", ignoreDuplicates: true },
        );

      if (choreError) {
        return new Response(JSON.stringify({ error: choreError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // If started is false, delete associated chores
    if (!task.started && id) {
      const { error: choreError } = await supabaseAdmin
        .from("chores")
        .delete()
        .eq("task_id", task.id);

      if (choreError) {
        return new Response(JSON.stringify({ error: choreError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify(task), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
