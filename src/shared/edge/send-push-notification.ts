import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, x-client-info, apikey, x-region",
};

/**
 * send-push-notification
 *
 * Sends a push notification via the Expo Push Notification Service (EPNS).
 * This works for both Expo Go and production builds.
 *
 * Expected body:
 * {
 *   token: string,        // ExpoPushToken[xxxxxx]
 *   title: string,
 *   body: string,
 *   data?: Record<string, unknown>  // extra payload (optional)
 * }
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  let token: string, title: string, body: string, data: unknown;

  try {
    ({ token, title, body, data } = await req.json());
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body" }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }

  if (!token || !title || !body) {
    return new Response(
      JSON.stringify({ error: "token, title, and body are required" }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }

  // Validate Expo push token format
  if (!token.startsWith("ExponentPushToken[") && !token.startsWith("ExpoPushToken[")) {
    return new Response(
      JSON.stringify({ error: "Invalid Expo push token format" }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }

  try {
    const message = {
      to: token,
      sound: "default",
      title,
      body,
      data: data ?? {},
      priority: "high",
      channelId: "default",
    };

    const expoRes = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    const result = await expoRes.json();

    if (!expoRes.ok) {
      throw new Error(result?.errors?.[0]?.message ?? "Expo push API error");
    }

    // Check for per-ticket errors (Expo returns 200 even for some failures)
    const ticket = result?.data;
    if (ticket?.status === "error") {
      console.warn("Expo push ticket error:", ticket.message, ticket.details);
      // Don't throw — the request was valid, just log it
    }

    return new Response(JSON.stringify({ ok: true, ticket }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err) {
    console.error("send-push-notification error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }
});
