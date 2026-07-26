import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders } from "jsr:@supabase/supabase-js/cors";
import { errorResponse, serverErrorResponse } from "../error-response.ts";

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

    // Verify the caller has admin role
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
    const email: string = body?.email ?? "";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return errorResponse(400, "Invalid email address", corsHeaders);
    }

    // Admin client with service_role key — never exposed to the browser
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email);

    if (inviteError) {
      // Auth admin errors (e.g. rate limits, existing user state) may reveal
      // account enumeration or internal Auth details, never forward them as-is.
      return serverErrorResponse(corsHeaders, inviteError, "invite-user: inviteUserByEmail");
    }

    return new Response(JSON.stringify({ message: `Invitation sent to ${email}` }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return serverErrorResponse(corsHeaders, err, "invite-user: unhandled");
  }
});
