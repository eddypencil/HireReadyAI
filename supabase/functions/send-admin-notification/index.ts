import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, x-client-info, apikey, x-region",
};

const GMAIL_USER = Deno.env.get("GMAIL_USER") ?? "";
const GMAIL_APP_PASSWORD = Deno.env.get("GMAIL_APP_PASSWORD") ?? "";
const FROM_NAME = Deno.env.get("RESEND_FROM_NAME") ?? "HireReadyAI";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  const { to, subject, body } = await req.json();

  if (!to || !subject || !body) {
    return new Response(
      JSON.stringify({ error: "to, subject, and body are required" }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    return new Response(
      JSON.stringify({ error: "GMAIL_USER / GMAIL_APP_PASSWORD not configured" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  try {
    const client = new SMTPClient({
      connection: {
        hostname: "smtp.gmail.com",
        port: 465,
        tls: true,
        auth: {
          username: GMAIL_USER,
          password: GMAIL_APP_PASSWORD,
        },
      },
    });

    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;background-color:#f4f7fc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f7fc;padding:40px 20px">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(1,73,124,0.12)">
          <tr>
            <td style="background:linear-gradient(135deg,#01497c 0%,#012a4a 100%);padding:32px 40px;text-align:center">
              <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:0;letter-spacing:-0.3px">HireReadyAI</h1>
              <p style="color:#89c2d9;font-size:14px;margin:8px 0 0 0">Platform Administration</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px;color:#1a2a3a;font-size:15px;line-height:1.7">
              ${body.replace(/\n/g, "<br>")}
            </td>
          </tr>
          <tr>
            <td style="background:#f0f5fb;padding:24px 40px;border-top:1px solid #d0e2f2">
              <p style="color:#5a7a9a;font-size:12px;margin:0;text-align:center">
                Powered by <strong style="color:#01497c">HireReadyAI</strong>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    await client.send({
      from: `${FROM_NAME} <${GMAIL_USER}>`,
      to: [to],
      subject,
      html: htmlBody,
    });

    await client.close();

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 502, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
