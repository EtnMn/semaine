import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders } from "jsr:@supabase/supabase-js/cors";

function computeNextDate(from: Date, periodicity: string): string {
  const next = new Date(from);
  switch (periodicity) {
    case "daily":
      next.setDate(next.getDate() + 1);
      break;
    case "weekly":
      next.setDate(next.getDate() + 7);
      break;
    case "monthly":
      next.setMonth(next.getMonth() + 1);
      break;
    case "yearly":
      next.setFullYear(next.getFullYear() + 1);
      break;
  }
  return next.toISOString().slice(0, 10);
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

    // Verify the caller is authenticated (any authenticated user can close a chore)
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

    // Parse and validate request body
    const body = await req.json();
    const choreId: string = body?.chore_id ?? "";
    if (!choreId) {
      return new Response(JSON.stringify({ error: "Missing chore id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Admin client with service_role key to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Fetch the chore to get task_id
    const { data: chore, error: choreError } = await supabaseAdmin
      .from("chores")
      .select("id, task_id")
      .eq("id", choreId)
      .single();

    if (choreError || !chore) {
      return new Response(JSON.stringify({ error: "Chore not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch the associated task to get periodicity
    const { data: task, error: taskError } = await supabaseAdmin
      .from("tasks")
      .select("id, periodicity")
      .eq("id", chore.task_id)
      .single();

    // Delete the chore regardless of whether task exists
    const { error: deleteError } = await supabaseAdmin.from("chores").delete().eq("id", choreId);

    if (deleteError) {
      return new Response(JSON.stringify({ error: deleteError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Only create next chore if task was found
    if (!taskError && task) {
      if (task.periodicity === "unique") {
        // Disable the task so it no longer generates chores
        const { error: updateError } = await supabaseAdmin
          .from("tasks")
          .update({ started: false })
          .eq("id", task.id);

        if (updateError) {
          return new Response(JSON.stringify({ error: updateError.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } else {
        // Insert the next occurrence based on today's date
        const nextDate = computeNextDate(new Date(), task.periodicity);
        const { error: insertError } = await supabaseAdmin
          .from("chores")
          .insert({ task_id: task.id, date: nextDate });

        if (insertError) {
          return new Response(JSON.stringify({ error: insertError.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }
    }

    return new Response(JSON.stringify({ message: "Chore closed successfully" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
