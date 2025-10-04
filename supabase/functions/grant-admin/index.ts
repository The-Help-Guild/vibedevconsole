// Deno Edge Function: grant-admin
// Allows the first authenticated user to claim admin role. Safe bootstrap: if an admin already exists, deny.
// CORS enabled. Requires no input. Uses auth context to identify caller.

// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  try {
    const url = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: "Missing server configuration" }), { status: 500, headers: corsHeaders });
    }

    // Client with auth context (for requester identity)
    const supabaseClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: req.headers.get("Authorization")! } },
    });

    // Admin client to bypass RLS for checks and write
    const admin = createClient(url, serviceRoleKey);

    const { data: userData, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const userId = userData.user.id;

    // Check if any admin already exists
    const { data: adminCount, error: countError } = await admin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");

    if (countError) {
      return new Response(JSON.stringify({ error: countError.message }), { status: 500, headers: corsHeaders });
    }

    if ((adminCount as any) === null) {
      // head: true returns null data; use header count instead
    }

    const totalAdmins = (adminCount as any)?.length ?? Number((admin as any).headers?.get?.("content-range")?.split("/")[1]) || 0;

    if (totalAdmins > 0) {
      return new Response(JSON.stringify({ granted: false, reason: "Admin already exists" }), { status: 403, headers: corsHeaders });
    }

    // Grant admin to requester
    const { error: insertError } = await admin.from("user_roles").insert({ user_id: userId, role: "admin" });
    if (insertError) {
      return new Response(JSON.stringify({ error: insertError.message }), { status: 500, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ granted: true }), { status: 200, headers: corsHeaders });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "Unexpected error" }), { status: 500, headers: corsHeaders });
  }
});