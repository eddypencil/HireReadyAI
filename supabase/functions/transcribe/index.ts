import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const HF_API_URL =
  "https://api-inference.huggingface.co/models/openai/whisper-large-v3";
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;

async function transcribeWithRetry(audioBlob, apiKey, retries = MAX_RETRIES) {
  for (let attempt = 0; attempt < retries; attempt++) {
    const response = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/octet-stream",
      },
      body: audioBlob,
    });

    if (response.ok) {
      return response;
    }

    const body = await response.json();

    if (
      response.status === 503 &&
      body.error?.toLowerCase().includes("model is loading")
    ) {
      const wait = body.estimated_time
        ? Math.min(body.estimated_time * 1000, 30000)
        : RETRY_DELAY_MS;
      await new Promise((r) => setTimeout(r, wait));
      continue;
    }

    throw new Error(
      `Hugging Face API error (${response.status}): ${JSON.stringify(body)}`,
    );
  }

  throw new Error("Max retries exceeded — model failed to load");
}

function extractText(result) {
  if (typeof result.text === "string") return result.text.trim();
  if (Array.isArray(result) && result[0]?.text) return result[0].text.trim();
  return null;
}

function extractConfidence(result) {
  if (result.confidence !== undefined) return result.confidence;
  if (Array.isArray(result) && result[0]?.confidence !== undefined)
    return result[0].confidence;
  return null;
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const { audioPath } = await req.json();
  if (!audioPath) {
    return new Response(JSON.stringify({ error: "audioPath is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  const { data: audioBlob, error: downloadError } = await supabase.storage
    .from("interview-recordings")
    .download(audioPath);

  if (downloadError || !audioBlob) {
    return new Response(
      JSON.stringify({
        error: "Failed to download audio",
        details: downloadError,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  try {
    const hfResponse = await transcribeWithRetry(
      audioBlob,
      Deno.env.get("HF_API_KEY") ?? "",
    );
    const result = await hfResponse.json();

    const text = extractText(result);
    if (!text) {
      return new Response(
        JSON.stringify({
          error: "Unexpected response format from Hugging Face",
          raw: result,
        }),
        { status: 502, headers: { "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({
        text,
        whisper_confidence: extractConfidence(result),
      }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 502, headers: { "Content-Type": "application/json" } },
    );
  }
});
