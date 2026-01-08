/**
 * Supabase Edge Function: get-portal-url
 *
 * Generates a Creem customer portal URL for subscription management.
 * Allows users to update payment methods, cancel, or manage their subscription.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CREEM_API_URL = Deno.env.get("CREEM_TEST_MODE") === "true" ? "https://test-api.creem.io" : "https://api.creem.io";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-app-version",
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get user from Supabase auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authorization header required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user profile to find Creem customer ID
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("creem_customer_id")
      .eq("id", user.id)
      .single();

    if (profileError || !profile?.creem_customer_id) {
      return new Response(JSON.stringify({ error: "No subscription found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Request portal URL from Creem
    const creemApiKey = Deno.env.get("CREEM_API_KEY");
    if (!creemApiKey) {
      console.error("CREEM_API_KEY not configured");
      return new Response(JSON.stringify({ error: "Payment service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const portalResponse = await fetch(`${CREEM_API_URL}/v1/customers/billing`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": creemApiKey,
      },
      body: JSON.stringify({
        customer_id: profile.creem_customer_id,
      }),
    });

    if (!portalResponse.ok) {
      const errorData = await portalResponse.text();
      console.error("Creem portal error:", errorData);
      return new Response(JSON.stringify({ error: "Failed to get portal URL" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const portalData = await portalResponse.json();

    // Creem uses snake_case: customer_portal_link
    const portalUrl = portalData.customer_portal_link || portalData.customerPortalLink;

    return new Response(JSON.stringify({ portalUrl }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("get-portal-url error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
