import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, x-client-info, apikey, x-region",
};

const HF_CHAT_URL = "https://router.huggingface.co/v1/chat/completions";
const HF_MODEL = "Qwen/Qwen2.5-7B-Instruct";

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function formatApplicationQA(
  supabase: ReturnType<typeof createClient>,
  applicationAnswers: Record<string, unknown>
): Promise<string> {
  const questionsAnswers = (applicationAnswers as any)?.questions || {};
  const questionIds = Object.keys(questionsAnswers);

  if (questionIds.length === 0) {
    return "\n\nApplication Q&A: This job has no application questions. Do not penalize for missing answers.";
  }

  try {
    // Fetch question texts from questions table
    const { data: questions, error: qError } = await supabase
      .from("questions")
      .select("id, question")
      .in("id", questionIds);
    console.log(questions);

    if (qError || !questions || questions.length === 0) {
      // Fallback to showing IDs with answers
      const fallbackQA = Object.entries(questionsAnswers)
        .map(([id, answer]) => `Q (ID: ${id}): ${answer || "(no answer provided)"}`)
        .join("\n\n");
      return `\n\nApplication Q&A submitted by the candidate:\n${fallbackQA}`;
    }

    // Build formatted Q&A with question text + answers
    const qaList = questions
      .map(q => {
        const answer = questionsAnswers[q.id];
        const answerText = answer === null || answer === undefined || answer === "" 
          ? "(no answer provided)" 
          : String(answer);
        return `Q: ${q.text}\nA: ${answerText}`;
      })
      .join("\n\n");

    return `\n\nApplication Q&A submitted by the candidate:\n${qaList}`;
  } catch (err) {
    console.warn("Failed to fetch questions:", err);
    // Fallback
    return `\n\nApplication Q&A submitted by the candidate:\n${JSON.stringify(questionsAnswers, null, 2)}`;
  }
}

function buildPrompt(params: {
  jobTitle: string;
  jobDescription: string;
  jobSkills: string[];
  jobRequirements: string[];
  cvText: string;
  formattedQA: string;
}): string {
  const { jobTitle, jobDescription, jobSkills, jobRequirements, cvText, formattedQA } = params;
  console.log(formattedQA)
  return `You are a strict technical recruiter. Your job is to protect the hiring team's time by filtering out weak candidates. You must be critical and honest, not generous.

JOB POSTING:
Title: ${jobTitle}
Description: ${jobDescription}
Required Skills: ${jobSkills?.join(", ") || "Not specified"}
Requirements: ${jobRequirements?.join("; ") || "Not specified"}${formattedQA}

CANDIDATE CV TEXT:
${cvText}

---

STRICT SCORING RULES — READ CAREFULLY BEFORE SCORING:

1. BASELINE: Start at 50. Only award points for clearly demonstrated evidence. Do not assume or infer skills not explicitly stated.

2. UNANSWERED QUESTIONS PENALTY (only applies if the job has application questions):
   - If any question is blank, unanswered, or evasive: deduct 10 points per question.
   - If ALL questions are unanswered: cap cv_score at 45 regardless of CV quality.
   - If the job has NO application questions: skip this rule entirely. Do not penalize.

3. IRRELEVANT CV PENALTY:
   - If the candidate's experience is in a different field than the job: score 20–35.
   - If fewer than 40% of required skills are present in the CV: score below 50.
   - If the CV appears generic or not tailored to this role: deduct 5–10 points.

4. MISSING REQUIREMENTS PENALTY:
   - Each hard requirement (from jobRequirements) that is clearly absent: deduct 8 points.
   - Each required skill (from jobSkills) that is absent: deduct 5 points.

5. SCORE ANCHORS — use these to calibrate:
   - 85–100: Nearly perfect match. All required skills present, requirements met, questions answered thoroughly.
   - 70–84: Strong match with minor gaps. Most skills present, most questions answered.
   - 55–69: Partial match. Notable gaps, some unanswered questions or missing skills.
   - 40–54: Weak match. Multiple missing requirements or unanswered questions.
   - 0–39: Poor match. Irrelevant background, unanswered questions, or insufficient evidence.

6. RECOMMENDATION RULES (strict):
   - "proceed" → only if cv_score >= 70 AND all required skills are present AND no key questions unanswered.
   - "review" → cv_score 50–69 OR has potential but has gaps worth discussing.
   - "reject" → cv_score < 50 OR CV is irrelevant OR critical questions left unanswered.

7. GENERAL RULES:
   - Score only on evidence present in the CV and Q&A. Absence of evidence is evidence of absence.
   - Do not give benefit of the doubt for vague or generic statements.
   - Gaps must be specific and actionable — not filler.
   - Feedback must be honest enough that a hiring manager can act on it.

Return ONLY a valid JSON object with exactly these fields, no extra text, no markdown, no code blocks:
{
  "cv_score": <integer 0-100>,
  "feedback": "<3-5 sentence honest assessment for the hiring team, including any unanswered questions or red flags>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"],
  "gaps": ["<specific gap 1>", "<specific gap 2>", "<specific gap 3>"],
  "recommendation": "<one of: proceed | review | reject>",
  "dimension_scores": {
    "technical_skills": <integer 0-100>,
    "experience_match": <integer 0-100>,
    "education": <integer 0-100>,
    "soft_skills": <integer 0-100>
  }
}`;
}

// ─── Main handler ─────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  const { applicationId, cvText } = await req.json();
  if (!applicationId || !cvText) {
    return new Response(
      JSON.stringify({ error: "applicationId and cvText are required" }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SB_SERVICE_KEY") ?? "",
  );

  // ── 1. Fetch application ──────────────────────────────────────────────────
  const { data: application, error: appError } = await supabase
    .from("applications")
    .select("id, job_id, cv_file_url, answers")
    .eq("id", applicationId)
    .single();

  if (appError || !application) {
    return new Response(
      JSON.stringify({ error: "Application not found", details: appError }),
      { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  if (!application.cv_file_url) {
    return new Response(
      JSON.stringify({ error: "No CV file attached to this application" }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  // ── 2. Fetch job posting ──────────────────────────────────────────────────
  const { data: job, error: jobError } = await supabase
    .from("job_postings")
    .select("title, description, skills, requirements")
    .eq("id", application.job_id)
    .single();

  if (jobError || !job) {
    return new Response(
      JSON.stringify({ error: "Job not found", details: jobError }),
      { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  // ── 3. Find the CV Review application_stage ───────────────────────────────
  const { data: cvStageRow } = await supabase
    .from("application_stages")
    .select("id, recruitment_stages!inner(stage_type, order_index, min_score)")
    .eq("application_id", applicationId)
    .eq("recruitment_stages.stage_type", "cv_review")
    .maybeSingle();

  // Mark as in_progress (if not already)
  if (cvStageRow?.id) {
    await supabase
      .from("application_stages")
      .update({ status: "in_progress", started_at: new Date().toISOString() })
      .eq("id", cvStageRow.id);
  }

  try {
    if (cvText.length < 50) {
      throw new Error("CV appears to be empty or unreadable (insufficient text extracted)");
    }

    // ── 4. Format Q&A with question text ─────────────────────────────────────
    const formattedQA = await formatApplicationQA(supabase, application.answers ?? {});

    // ── 5. Call HuggingFace Qwen ────────────────────────────────────────────
    const prompt = buildPrompt({
      jobTitle: job.title,
      jobDescription: job.description,
      jobSkills: job.skills ?? [],
      jobRequirements: job.requirements ?? [],
      cvText,
      formattedQA,
    });

    const hfResponse = await fetch(HF_CHAT_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("HUGGINGFACE_API_KEY_CV") ?? ""}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: HF_MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are an expert technical recruiter. Always respond with valid JSON only. Never include markdown, code blocks, or any text outside the JSON object.",
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 1200,
        temperature: 0.3,
      }),
    });

    if (!hfResponse.ok) {
      const errBody = await hfResponse.json();
      throw new Error(`HuggingFace error: ${JSON.stringify(errBody)}`);
    }

    const hfData = await hfResponse.json();
    let content: string = hfData.choices[0].message.content.trim();

    // Strip any accidental markdown fences
    content = content.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) content = jsonMatch[0];

    let parsed: {
      cv_score: number;
      feedback: string;
      strengths: string[];
      weaknesses: string[];
      gaps: string[];
      recommendation: string;
      dimension_scores: Record<string, number>;
    };

    try {
      parsed = JSON.parse(content);
    } catch {
      throw new Error(`Failed to parse AI response as JSON: ${content}`);
    }

    const cvScore = Math.max(0, Math.min(100, Math.round(parsed.cv_score ?? 0)));

    // ── 6. Write results back to DB ─────────────────────────────────────────
    const feedbackJson = JSON.stringify({
      feedback: parsed.feedback,
      strengths: parsed.strengths,
      weaknesses: parsed.weaknesses,
      gaps: parsed.gaps,
      recommendation: parsed.recommendation,
      dimension_scores: parsed.dimension_scores,
    });

    const minScore = cvStageRow?.recruitment_stages?.min_score ?? 55;
    const stageStatus = cvScore >= minScore ? "passed" : "failed";

    // Update application_stages CV review row
    if (cvStageRow?.id) {
      await supabase
        .from("application_stages")
        .update({
          score: cvScore,
          ai_feedback: feedbackJson,
          status: stageStatus,
          completed_at: new Date().toISOString(),
        })
        .eq("id", cvStageRow.id);

      // Also upsert application_stage_evaluations
      await supabase.from("application_stage_evaluations").upsert(
        {
          application_stage_id: cvStageRow.id,
          ai_score: cvScore,
          confidence: (parsed.dimension_scores?.technical_skills ?? 70) / 100,
          reasoning: parsed.feedback,
          recommendation: parsed.recommendation,
          strengths: parsed.strengths || [],
          weaknesses: parsed.weaknesses || [],
        },
        { onConflict: "application_stage_id" }
      );
    }

    // Update applications.cv_score and set is_rejected if below threshold
    await supabase
      .from("applications")
      .update({ cv_score: cvScore, is_rejected: stageStatus === "failed" })
      .eq("id", applicationId);

    return new Response(
      JSON.stringify({
        cv_score: cvScore,
        feedback: parsed.feedback,
        strengths: parsed.strengths,
        weaknesses: parsed.weaknesses,
        gaps: parsed.gaps,
        recommendation: parsed.recommendation,
        dimension_scores: parsed.dimension_scores,
      }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("CV review failed:", msg);

    // Mark stage as failed
    if (cvStageRow?.id) {
      await supabase
        .from("application_stages")
        .update({
          ai_feedback: JSON.stringify({ error: msg }),
          status: "failed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", cvStageRow.id);
    }

    return new Response(
      JSON.stringify({ error: msg }),
      { status: 502, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
