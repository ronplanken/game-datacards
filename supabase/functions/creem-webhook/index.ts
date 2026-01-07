/**
 * Supabase Edge Function: creem-webhook
 *
 * Handles Creem webhook events to sync subscription status.
 * Verifies webhook signature and updates user_profiles table.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, creem-signature",
};

/**
 * Verify Creem webhook signature using HMAC-SHA256
 */
async function verifySignature(payload: string, signature: string, secret: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signatureBytes = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
    const expectedSignature = Array.from(new Uint8Array(signatureBytes))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return signature === expectedSignature;
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const webhookSecret = Deno.env.get("CREEM_WEBHOOK_SECRET");
    if (!webhookSecret) {
      console.error("CREEM_WEBHOOK_SECRET not configured");
      return new Response(
        JSON.stringify({ error: "Webhook secret not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get raw body for signature verification
    const rawBody = await req.text();
    const signature = req.headers.get("creem-signature");

    if (!signature) {
      console.error("Missing creem-signature header");
      return new Response(
        JSON.stringify({ error: "Missing signature" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify signature
    const isValid = await verifySignature(rawBody, signature, webhookSecret);
    if (!isValid) {
      console.error("Invalid webhook signature");
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse webhook payload
    const event = JSON.parse(rawBody);
    console.log("Creem webhook event:", event.eventType);

    // Create Supabase admin client for database updates
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Extract common fields
    const { eventType, object } = event;
    const userId = object?.metadata?.userId;
    const customerId = object?.customer?.id;
    const subscriptionId = object?.subscription?.id || object?.id;

    if (!userId) {
      console.log("No userId in metadata, skipping");
      return new Response(
        JSON.stringify({ received: true, skipped: "no userId" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle different event types
    switch (eventType) {
      case "checkout.completed": {
        // Store customer and subscription IDs
        console.log(`Checkout completed for user ${userId}`);
        const { error } = await supabase
          .from("user_profiles")
          .update({
            creem_customer_id: customerId,
            creem_subscription_id: subscriptionId,
            subscription_tier: "paid",
            subscription_status: "active",
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);

        if (error) {
          console.error("Failed to update user profile:", error);
          throw error;
        }
        break;
      }

      case "subscription.active": {
        // Subscription is now active
        console.log(`Subscription active for user ${userId}`);
        const { error } = await supabase
          .from("user_profiles")
          .update({
            subscription_tier: "paid",
            subscription_status: "active",
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);

        if (error) {
          console.error("Failed to activate subscription:", error);
          throw error;
        }
        break;
      }

      case "subscription.paid": {
        // Payment received, extend subscription
        console.log(`Subscription paid for user ${userId}`);
        const expiresAt = object?.currentPeriodEnd
          ? new Date(object.currentPeriodEnd).toISOString()
          : null;

        const { error } = await supabase
          .from("user_profiles")
          .update({
            subscription_status: "active",
            subscription_expires_at: expiresAt,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);

        if (error) {
          console.error("Failed to update subscription payment:", error);
          throw error;
        }
        break;
      }

      case "subscription.canceled": {
        // Subscription cancelled
        console.log(`Subscription cancelled for user ${userId}`);
        const { error } = await supabase
          .from("user_profiles")
          .update({
            subscription_status: "cancelled",
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);

        if (error) {
          console.error("Failed to cancel subscription:", error);
          throw error;
        }
        break;
      }

      case "subscription.expired": {
        // Subscription expired - revert to free tier
        console.log(`Subscription expired for user ${userId}`);
        const { error } = await supabase
          .from("user_profiles")
          .update({
            subscription_tier: "free",
            subscription_status: "expired",
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);

        if (error) {
          console.error("Failed to expire subscription:", error);
          throw error;
        }
        break;
      }

      case "subscription.trialing": {
        // Subscription in trial
        console.log(`Subscription trialing for user ${userId}`);
        const { error } = await supabase
          .from("user_profiles")
          .update({
            subscription_tier: "paid",
            subscription_status: "trialing",
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);

        if (error) {
          console.error("Failed to set trial:", error);
          throw error;
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    return new Response(
      JSON.stringify({ received: true, eventType }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("creem-webhook error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
