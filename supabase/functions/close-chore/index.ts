import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders } from "jsr:@supabase/supabase-js/cors";
import { errorResponse, serverErrorResponse } from "../error-response.ts";
import { parseRequestBody } from "../validation.ts";

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
      return errorResponse(401, "Unauthorized", corsHeaders);
    }

    // Parse and validate request body
    const body = await parseRequestBody(req);
    if (body instanceof Response) {
      return body;
    }

    if (typeof body.chore_id !== "string" || !body.chore_id.trim() || body.chore_id.length !== 36) {
      return errorResponse(400, "Invalid or missing chore id", corsHeaders);
    }

    // Admin client with service_role key to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Fetch the chore to get task_id and date
    const { data: chore, error: choreError } = await supabaseAdmin
      .from("chores")
      .select("id, task_id, date")
      .eq("id", body.chore_id)
      .single();

    if (choreError || !chore) {
      return errorResponse(404, "Chore not found", corsHeaders);
    }

    // Fetch the associated task to get periodicity
    const { data: task, error: taskError } = await supabaseAdmin
      .from("tasks")
      .select("id, periodicity, started")
      .eq("id", chore.task_id)
      .single();

    // Delete the chore regardless of whether task exists
    const { error: deleteError } = await supabaseAdmin
      .from("chores")
      .delete()
      .eq("id", body.chore_id);

    if (deleteError) {
      return serverErrorResponse(corsHeaders, deleteError, "close-chore: delete chore");
    }

    // Only create next chore if task was found
    if (!taskError && task && task.started) {
      if (task.periodicity === "unique") {
        // Disable the task so it no longer generates chores
        const { error: updateError } = await supabaseAdmin
          .from("tasks")
          .update({ started: false })
          .eq("id", task.id);

        if (updateError) {
          return serverErrorResponse(corsHeaders, updateError, "close-chore: disable task");
        }
      } else {
        // Insert the next occurrence based on the max of chore date and today's date
        const choreDate = new Date(chore.date);
        const baseDate = choreDate > new Date() ? choreDate : new Date();
        const nextDate = computeNextDate(baseDate, task.periodicity);
        const { error: insertError } = await supabaseAdmin
          .from("chores")
          .insert({ task_id: task.id, date: nextDate });

        if (insertError) {
          return serverErrorResponse(corsHeaders, insertError, "close-chore: insert next chore");
        }
      }
    }

    return new Response(JSON.stringify({ message: "Chore closed successfully" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return serverErrorResponse(corsHeaders, err, "close-chore: unhandled");
  }
});
