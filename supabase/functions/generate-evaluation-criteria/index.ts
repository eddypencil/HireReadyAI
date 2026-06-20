import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// ─── CORS ─────────────────────────────────────────────────────────────────────
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, x-client-info, apikey, x-region",
};

// ─── Groq model ───────────────────────────────────────────────────────────────
const GROQ_URL           = "https://api.groq.com/openai/v1/chat/completions";
const CRITERIA_MODEL     = "llama-3.3-70b-versatile";

// ─── Types ───────────────────────────────────────────────────────────────────
interface EvaluationCriterion {
  competency: string;
  weight: number;
  required: boolean;
  min_questions: number;
  concepts: string[];
}

// ─── Groq caller ─────────────────────────────────────────────────────────────
async function callGroq(systemMsg: string, userMsg: string): Promise<unknown> {
  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${Deno.env.get("GROQ_API_KEY") ?? ""}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: CRITERIA_MODEL,
      messages: [
        { role: "system", content: systemMsg },
        { role: "user", content: userMsg },
      ],
      max_tokens: 1000,
      temperature: 0.4,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`Groq error: ${JSON.stringify(err)}`);
  }

  const data = await response.json();
  let content: string = data.choices[0].message.content.trim();
  content = content.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();

  // The model might return the array wrapped in an object key
  // e.g. { "evaluation_criteria": [...] }  or  [...]
  const objMatch = content.match(/\{[\s\S]*\}/);
  if (objMatch) content = objMatch[0];

  return JSON.parse(content);
}

// ─── Main handler ─────────────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  const { recruitmentStageId } = (await req.json()) as { recruitmentStageId: string };

  if (!recruitmentStageId) {
    return new Response(
      JSON.stringify({ error: "recruitmentStageId is required" }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SB_SERVICE_KEY") ?? "",
  );

  // ── 1. Fetch stage + job via direct FK ────────────────────────────────────
  const { data: stageData, error: stageError } = await supabase
    .from("recruitment_stages")
    .select(`
      id, name, description, stage_type, num_questions, job_id,
      job_postings!inner(title, seniority_level, skills, requirements)
    `)
    .eq("id", recruitmentStageId)
    .single();

  if (stageError || !stageData) {
    return new Response(
      JSON.stringify({ error: "Stage not found", details: stageError }),
      { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }

  const job = stageData.job_postings as {
    title: string;
    seniority_level: string;
    skills: string[];
    requirements: string[];
  };

  const numQuestions = stageData.num_questions ?? 5;

  // ── 2. Generate criteria via Groq ─────────────────────────────────────────
  let criteria: EvaluationCriterion[];

  try {
    const systemMsg = "You are designing interview evaluation criteria. Always respond with valid JSON only. Never include markdown or extra text.";
    const userMsg = `You are designing interview evaluation criteria for a structured hiring process.

Job: ${job.title} (${job.seniority_level})
Required skills: ${(job.skills ?? []).join(", ")}
Requirements: ${(job.requirements ?? []).join("; ")}
Stage name: ${stageData.name}
Stage purpose: ${stageData.description ?? "Evaluate candidate fit for the role"}
Stage type: ${stageData.stage_type}
Number of questions: ${numQuestions}

Generate evaluation_criteria for this specific stage. Rules:
1. Max 4 competencies
2. Weights must sum to exactly 100
3. Competencies must reflect the actual skills and requirements above — be specific, not generic
4. Mark required: true for competencies core to the role
5. min_questions per competency must sum to <= ${numQuestions}
6. Concepts must be specific and directly testable in an interview question
7. For hr_interview stage_type: competencies should be behavioral (e.g. "Communication", "Cultural Fit")
8. For technical_interview: competencies should be technical skills from the job posting
9. For assessment/coding_test: competencies should match what the assessment is testing

Return a JSON object with a single key "evaluation_criteria" containing an array:
{
  "evaluation_criteria": [
    {
      "competency": "<name>",
      "weight": <integer, all weights sum to 100>,
      "required": <boolean>,
      "min_questions": <integer>,
      "concepts": ["<specific testable concept>"]
    }
  ]
}`;

    const parsed = await callGroq(systemMsg, userMsg) as Record<string, unknown>;

    // Handle both { evaluation_criteria: [...] } and direct array
    if (Array.isArray(parsed)) {
      criteria = parsed as EvaluationCriterion[];
    } else if (Array.isArray(parsed.evaluation_criteria)) {
      criteria = parsed.evaluation_criteria as EvaluationCriterion[];
    } else {
      throw new Error(`Unexpected AI response shape: ${JSON.stringify(parsed)}`);
    }

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({ error: `AI call failed: ${msg}` }),
      { status: 502, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }

  // ── 3. Validate ───────────────────────────────────────────────────────────
  const weightSum = criteria.reduce((s, c) => s + (c.weight ?? 0), 0);
  if (weightSum !== 100) {
    return new Response(
      JSON.stringify({ error: `Weights sum to ${weightSum}, must be exactly 100`, criteria }),
      { status: 422, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }

  const minQSum = criteria.reduce((s, c) => s + (c.min_questions ?? 0), 0);
  if (minQSum > numQuestions) {
    return new Response(
      JSON.stringify({ error: `min_questions sum (${minQSum}) exceeds num_questions (${numQuestions})`, criteria }),
      { status: 422, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }

  // ── 4. Save to DB ─────────────────────────────────────────────────────────
  const { error: updateError } = await supabase
    .from("recruitment_stages")
    .update({ evaluation_criteria: criteria })
    .eq("id", recruitmentStageId);

  if (updateError) {
    return new Response(
      JSON.stringify({ error: "Failed to save criteria", details: updateError }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }

  console.log("generate-evaluation-criteria: saved for stage", recruitmentStageId, JSON.stringify(criteria));

  return new Response(
    JSON.stringify({ evaluation_criteria: criteria }),
    { headers: { "Content-Type": "application/json", ...corsHeaders } },
  );
});
