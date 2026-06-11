import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@17.7.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, x-client-info, apikey, x-region",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: "Missing Authorization header" }),
      { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SB_SERVICE_KEY") ?? "",
  );

  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);

  if (userError || !user) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }

  const { price_id } = await req.json();
  if (!price_id) {
    return new Response(
      JSON.stringify({ error: "price_id is required" }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "");

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      client_reference_id: user.id,
      payment_intent_data: {
        metadata: { user_id: user.id },
      },
      line_items: [{ price: price_id, quantity: 1 }],
      success_url: `${Deno.env.get("PUBLIC_APP_URL") ?? "http://localhost:5173"}/premium/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${Deno.env.get("PUBLIC_APP_URL") ?? "http://localhost:5173"}/premium/cancel`,
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }
});
