import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// ─── CORS ─────────────────────────────────────────────────────────────────────
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, x-client-info, apikey, x-region",
};

// ─── Groq models ──────────────────────────────────────────────────────────────
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const EVALUATOR_MODEL  = "llama-3.3-70b-versatile";
const SUPERVISOR_MODEL = "llama-3.3-70b-versatile";
const FINALIZER_MODEL  = "llama-3.3-70b-versatile";
const GENERATOR_MODEL  = "llama-3.1-8b-instant";

// ─── AI stage types that have evaluation_criteria ────────────────────────────
const AI_STAGE_TYPES = new Set([
  "hr_interview", "technical_interview",
  "assessment", "assessment_test", "coding_test",
]);

// ─── Types ───────────────────────────────────────────────────────────────────
interface EvaluationCriterion {
  competency: string;
  weight: number;
  required: boolean;
  min_questions: number;
  concepts: string[];
}

interface StageState {
  competency_coverage: Record<string, {
    questions_asked: number;
    scores: number[];
    avg_score: number;
    concepts_tested: string[];
  }>;
  weakness_flags: string[];
  follow_up_budget: number;
  questions_completed: number;
}

// ─── Shared Groq caller ───────────────────────────────────────────────────────
async function callGroq(
  model: string,
  systemMsg: string,
  userMsg: string,
): Promise<Record<string, unknown>> {
  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${Deno.env.get("GROQ_API_KEY") ?? ""}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
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
  const match = content.match(/\{[\s\S]*\}/);
  if (match) content = match[0];

  // Strip leading + from score_impact and TS union type annotations
  let sanitized = content.replace(/:\s*\+(\d+)/g, ": $1");
  sanitized = sanitized.replace(/\s*\|\s*(null|"[^"]*"|'[^']*')\s*/g, "");

  return JSON.parse(sanitized) as Record<string, unknown>;
}

// ─── Question type guide builder ─────────────────────────────────────────────
function buildQuestionTypeGuide(stageType: string): string {
  if (stageType === "hr_interview") {
    return `FORMAT CONSTRAINTS — HR INTERVIEW:
- DEFAULT to "video" for all behavioral, motivational, situational, and self-reflection questions
- Use "text" ONLY for written exercises
- Use "multiple_choice" ONLY for policy/compliance knowledge checks
- NEVER use "code" in HR interviews
- The "multiple_choice" can either be scored 0 or 100 nothing between`;
  }
  if (stageType === "technical_interview") {
    return `FORMAT CONSTRAINTS — TECHNICAL INTERVIEW:
- Use "video" for: system design walkthroughs, architecture decisions, past project deep-dives
- Use "text" for: short written explanations (under 3 sentences)
- Use "code" for: algorithm implementation, fix-the-bug tasks, write-a-function tasks, UI component implementation
  * If UI/frontend/React: set code_type to "visuals"
  * If algorithms/backend/data structures: set code_type to "problem_solving"
- Use "multiple_choice" for: specific API knowledge, language syntax checks
- The "multiple_choice" can either be scored 0 or 100 nothing between
- BIAS toward "video" and "code". Avoid "text" unless neither fits.`;
  }
  return `FORMAT CONSTRAINTS — ASSESSMENT:
- NEVER use "video"
- Use "multiple_choice", "code", or "text" as appropriate
- The "multiple_choice" can either be scored 0 or 100 nothing between`;
}

// ─── Main handler ─────────────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const { applicationStageId, previousAnswer } = (await req.json()) as {
      applicationStageId: string;
      previousAnswer?: { questionId: string; answerText: string; timeTaken?: number } | null;
    };

    if (!applicationStageId) {
      return new Response(
        JSON.stringify({ error: "applicationStageId is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SB_SERVICE_KEY") ?? "",
    );

    // ── 1. Fetch stage context ─────────────────────────────────────────────────
    const { data: stageData, error: stageError } = await supabase
      .from("application_stages")
      .select(`
        id, status, stage_state,
        recruitment_stages!inner (
          id, name, description, stage_type, pass_score, evaluation_criteria, order_index, num_questions
        ),
        applications!inner (
          id, cv_score, answers, job_id,
          job_postings!inner (
            title, seniority_level, description, skills, requirements
          )
        )
      `)
      .eq("id", applicationStageId)
      .single();

    if (stageError || !stageData) {
      return new Response(
        JSON.stringify({ error: "Stage not found", details: stageError }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    const stage = stageData.recruitment_stages as {
      id: string; name: string; description: string; stage_type: string;
      pass_score: number | null; evaluation_criteria: EvaluationCriterion[] | null;
      order_index: number; num_questions: number | null;
    };
    const application = stageData.applications as {
      id: string; cv_score: number | null; answers: Record<string, unknown> | null; job_id: string;
      job_postings: { title: string; seniority_level: string; skills: string[]; requirements: string[]; };
    };
    const job = application.job_postings;

    const maxQuestions: number = stage.num_questions ?? 8;

    // Evaluation criteria — graceful fallback to "General" if null/empty
    const evaluationCriteria: EvaluationCriterion[] = (stage.evaluation_criteria && stage.evaluation_criteria.length > 0)
      ? stage.evaluation_criteria
      : [{ competency: "General", weight: 100, required: true, min_questions: 1, concepts: [] }];

    // Parse existing stage_state
    const rawState = (stageData.stage_state ?? {}) as Partial<StageState>;
    let stageState: StageState = {
      competency_coverage: rawState.competency_coverage ?? {},
      weakness_flags: rawState.weakness_flags ?? [],
      follow_up_budget: rawState.follow_up_budget ?? 1,
      questions_completed: rawState.questions_completed ?? 0,
    };

    // ── 2. Save incoming answer FIRST ──────────────────────────────────────────
    if (previousAnswer?.questionId && previousAnswer?.answerText) {
      await supabase.from("application_answers").upsert(
        { question_id: previousAnswer.questionId, answer_text: previousAnswer.answerText },
        { onConflict: "question_id" },
      );
    }

    // ── 3. Fetch question history + dedup ──────────────────────────────────────
    const { data: rawHistory } = await supabase
      .from("application_questions")
      .select(`
        id, question_text, question_type, order_index, generation_context,
        application_answers ( answer_text, score, feedback )
      `)
      .eq("application_stage_id", applicationStageId)
      .order("order_index", { ascending: true });

    const pickAnswer = (raw: unknown) => {
      if (!raw) return { answer_text: null, score: null };
      if (Array.isArray(raw)) {
        const first = (raw as Record<string, unknown>[])[0] ?? {};
        return { answer_text: (first.answer_text as string) ?? null, score: (first.score as number) ?? null };
      }
      const obj = raw as Record<string, unknown>;
      return { answer_text: (obj.answer_text as string) ?? null, score: (obj.score as number) ?? null };
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const history = (rawHistory ?? []).map((q: any) => {
      const { answer_text, score } = pickAnswer(q.application_answers);
      return {
        id: q.id as string,
        question_text: q.question_text as string,
        question_type: q.question_type as string,
        order_index: q.order_index as number,
        generation_context: q.generation_context,
        answer_text,
        score,
      };
    });

    type HistoryRow = {
      id: string; question_text: string; question_type: string;
      order_index: number; generation_context: unknown;
      answer_text: string | null; score: number | null;
    };

    const slotMap = new Map<number, HistoryRow>();
    for (const q of history) {
      const existing = slotMap.get(q.order_index);
      if (!existing) {
        slotMap.set(q.order_index, q);
      } else {
        const qScore  = q.answer_text != null ? (q.score != null ? 2 : 1) : 0;
        const exScore = existing.answer_text != null ? (existing.score != null ? 2 : 1) : 0;
        if (qScore > exScore) slotMap.set(q.order_index, q);
      }
    }
    const deduped = Array.from(slotMap.values()).sort((a, b) => a.order_index - b.order_index);

    const answeredInDB = deduped.filter((q) => q.answer_text != null).length;
    const nextQuestionNumber = answeredInDB + 1;
    const isSessionOver = answeredInDB >= maxQuestions;

    // Type distribution for Generator
    const usedTypes = deduped.map(q => q.question_type);
    const typeCounts = usedTypes.reduce((acc, t) => {
      acc[t] = (acc[t] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const typeConstraint = `
  QUESTION TYPE DISTRIBUTION (so far): ${JSON.stringify(typeCounts)}
  RULE: Do not use the same type more than ${Math.ceil(maxQuestions / 3)} times in one session.
  If "text" has been used ${typeCounts["text"] >= 2 ? "2+ times" : "already"}, pick a different type.`;

    // Previous question text
    let previousQuestionText: string | null = null;
    if (previousAnswer?.questionId) {
      const prevQ = history.find((q) => q.id === previousAnswer.questionId);
      previousQuestionText = prevQ?.question_text ?? null;
    }

    // ── DEBUG ──────────────────────────────────────────────────────────────────
    console.log("=== generate-question-v2 DEBUG ===");
    console.log("applicationStageId:", applicationStageId);
    console.log("previousAnswer:", previousAnswer ?? "(none — first question)");
    console.log("raw rows in DB:", history.length, "| deduped slots:", deduped.length);
    console.log("answeredInDB:", answeredInDB, "| nextQuestionNumber:", nextQuestionNumber, "| maxQuestions:", maxQuestions);
    console.log("isSessionOver:", isSessionOver);
    console.log("stage_state:", JSON.stringify(stageState));
    deduped.forEach((q, i) => {
      console.log(
        `  Q${i + 1} [order_index=${q.order_index}] id=${q.id}`,
        `| type=${q.question_type}`,
        `| answered=${q.answer_text != null}`,
        `| score=${q.score ?? "—"}`,
        `| text="${q.question_text?.slice(0, 80)}${q.question_text?.length > 80 ? "…" : ""}"`,
      );
    });
    console.log("==================================");

    // ── 4. Agent 1: Evaluator ─────────────────────────────────────────────────
    let latestEvaluation: Record<string, unknown> | null = null;

    if (previousAnswer?.questionId && previousAnswer?.answerText) {
      try {
        const systemMsg = "You are a strict technical interviewer. Always respond with valid JSON only. Never include markdown or extra text.";
        const userMsg = `You are evaluating a candidate's interview answer.

  Job: ${job.title} (${job.seniority_level})
  Stage: ${stage.name} (${stage.stage_type})
  Question asked: "${previousQuestionText ?? "(unknown)"}"
  Candidate answer: "${previousAnswer.answerText.slice(0, 2000)}"
  Seniority benchmark: ${job.seniority_level}

  Evaluation criteria for this stage:
  ${JSON.stringify(evaluationCriteria)}

  Evaluate strictly. Return JSON only:
  {
    "score": <0-100>,
    "competency": "<which competency from evaluation_criteria this maps to>",
    "concept_tested": "<specific concept tested>",
    "feedback": "<2-3 sentence internal assessment>",
    "strengths": ["..."],
    "weaknesses": ["..."],
    "detailed_points": [{ "point": "...", "score_impact": <integer>, "type": "strength" | "weakness" }]
  }

  STRICT EVALUATION RULES:
  1. DO NOT penalize the candidate for missing features (like media queries, error handling, etc.) UNLESS the question explicitly asked for them. Evaluate ONLY based on the constraints provided in the question.
  2. If the question type is "multiple_choice", the score MUST be exactly 0 (if wrong) or exactly 100 (if correct). No partial credit.`;

        latestEvaluation = await callGroq(EVALUATOR_MODEL, systemMsg, userMsg);
        console.log("Evaluator result:", JSON.stringify(latestEvaluation));

        const evScore = (latestEvaluation.score as number) ?? 0;
        const competency = (latestEvaluation.competency as string) || "General";
        const conceptTested = (latestEvaluation.concept_tested as string) || "";

        // Update application_answers with score
        await supabase.from("application_answers").upsert(
          {
            question_id: previousAnswer.questionId,
            answer_text: previousAnswer.answerText,
            score: evScore,
            feedback: latestEvaluation.feedback as string ?? "",
            strengths: (latestEvaluation.strengths as string[]) || [],
            weaknesses: (latestEvaluation.weaknesses as string[]) || [],
          },
          { onConflict: "question_id" },
        );

        // Update stage_state competency coverage
        const cover = stageState.competency_coverage[competency] ?? {
          questions_asked: 0, scores: [], avg_score: 0, concepts_tested: [],
        };
        cover.questions_asked += 1;
        cover.scores.push(evScore);
        cover.avg_score = Math.round(cover.scores.reduce((a, b) => a + b, 0) / cover.scores.length);
        if (conceptTested && !cover.concepts_tested.includes(conceptTested)) {
          cover.concepts_tested.push(conceptTested);
        }
        stageState.competency_coverage[competency] = cover;

        if (evScore < 60 && conceptTested) {
          if (!stageState.weakness_flags.includes(conceptTested)) {
            stageState.weakness_flags.push(conceptTested);
          }
        }
        stageState.questions_completed = answeredInDB;

        await supabase
          .from("application_stages")
          .update({ stage_state: stageState })
          .eq("id", applicationStageId);

      } catch (evalErr) {
        console.error("Evaluator agent failed:", evalErr);
        // Fallback: skip score update, continue with null latestEvaluation
      }
    }

    // ── Hard gate: session over → jump to Finalizer ───────────────────────────
    if (isSessionOver) {
      return await runFinalizer({
        supabase, stageState, evaluationCriteria, deduped,
        stage, job, applicationStageId, latestEvaluation, corsHeaders,
      });
    }

    // ── 5. Agent 2: Supervisor ────────────────────────────────────────────────
    let supervisorAction: { action: string; target_competency: string; target_concept: string; question_type: string; reasoning: string };

    try {
      const systemMsg = "You are an interview supervisor. Always respond with valid JSON only.";
      const userMsg = `You are managing a ${stage.stage_type} interview.

  Job: ${job.title} (${job.seniority_level})
  Stage: ${stage.name}
  Max questions: ${maxQuestions} (can go up to ${maxQuestions + 2} with follow-ups)
  Questions completed: ${stageState.questions_completed}
  Follow-up budget remaining: ${stageState.follow_up_budget}

  Evaluation criteria:
  ${JSON.stringify(evaluationCriteria)}

  Current competency coverage:
  ${JSON.stringify(stageState.competency_coverage)}

  Weakness flags: ${JSON.stringify(stageState.weakness_flags)}
  Latest evaluation: ${latestEvaluation ? JSON.stringify(latestEvaluation) : "null (first question or evaluator failed)"}

  Decision rules:
  - If all required competencies have met min_questions AND questions_completed >= ${maxQuestions} → action: "finish"
  - If latest score < 55 AND follow_up_budget > 0 → action: "follow_up" (ask same concept from a COMPLETELY DIFFERENT ANGLE — do NOT repeat the question)
  - If a required competency has 0 questions asked → action: "continue" targeting that competency
  - Otherwise → action: "continue" targeting the required competency with lowest coverage weighted by its weight

  Return JSON only:
  {
    "action": "continue" | "follow_up" | "finish",
    "target_competency": "<competency name>",
    "target_concept": "<specific concept to test>",
    "question_type": "video" | "text" | "multiple_choice" | "code",
    "reasoning": "<one sentence>"
  }`;

      supervisorAction = await callGroq(SUPERVISOR_MODEL, systemMsg, userMsg) as typeof supervisorAction;
      console.log("Supervisor decision:", JSON.stringify(supervisorAction));

      // Decrement follow_up_budget if follow_up chosen
      if (supervisorAction.action === "follow_up") {
        stageState.follow_up_budget = Math.max(0, stageState.follow_up_budget - 1);
        await supabase
          .from("application_stages")
          .update({ stage_state: stageState })
          .eq("id", applicationStageId);
      }
    } catch (supErr) {
      console.error("Supervisor agent failed:", supErr);
      // Fallback: find least-covered required competency
      const leastCovered = evaluationCriteria
        .filter(c => c.required)
        .sort((a, b) => {
          const aCov = stageState.competency_coverage[a.competency]?.questions_asked ?? 0;
          const bCov = stageState.competency_coverage[b.competency]?.questions_asked ?? 0;
          return aCov - bCov;
        })[0];

      supervisorAction = {
        action: "continue",
        target_competency: leastCovered?.competency ?? "General",
        target_concept: leastCovered?.concepts?.[0] ?? "general knowledge",
        question_type: stage.stage_type === "hr_interview" ? "video" : "code",
        reasoning: "Supervisor failed, falling back to least-covered required competency",
      };
    }

    // ── 6a. Finalizer (if supervisor says finish) ─────────────────────────────
    if (supervisorAction.action === "finish") {
      return await runFinalizer({
        supabase, stageState, evaluationCriteria, deduped,
        stage, job, applicationStageId, latestEvaluation, corsHeaders,
      });
    }

    // ── 6b. Agent 4: Generator ────────────────────────────────────────────────
    const previousQuestions = deduped
      .map((q, i) => `Q${i + 1} (${q.question_type}): "${q.question_text}"`)
      .join("\n");

    const codeQuestionsSoFar = deduped
      .filter(q => q.question_type === "code")
      .map((q, i) => `- Q${i + 1}: "${q.question_text}"`)
      .join("\n");

    const codeRepetitionGuard = codeQuestionsSoFar.length > 0
      ? `=== CODE QUESTIONS ALREADY ASKED ===
  ${codeQuestionsSoFar}
  STRICT RULE: The next code question MUST test a completely different concept/pattern than all above.`
      : "";

    const questionTypeGuide = buildQuestionTypeGuide(stage.stage_type);

    try {
      const systemMsg = "You are generating an interview question. Always respond with valid JSON only. Never include markdown or extra text.";
      const userMsg = `Generate the next interview question.

  Job: ${job.title} (${job.seniority_level})
  Stage type: ${stage.stage_type}
  Stage name: ${stage.name}
  Target competency: ${supervisorAction.target_competency}
  Target concept: ${supervisorAction.target_concept}
  Preferred question type: ${supervisorAction.question_type}
  Question number: ${nextQuestionNumber} of ~${maxQuestions}
  Action: ${supervisorAction.action === "follow_up" ? "FOLLOW-UP — same concept as previous but from a completely different angle" : "NEW question"}

  Previous questions asked (DO NOT repeat these concepts):
  ${previousQuestions || "None yet."}

  ${questionTypeGuide}
  ${codeRepetitionGuard}
  ${typeConstraint}

  Rules:
  - Be direct and neutral, zero hints
  - Never reference previous answers
  - The question must specifically test "${supervisorAction.target_concept}"
  - If type is "code": set code_type to "visuals" for UI/frontend, "problem_solving" for logic/algorithms
  - If type is "multiple_choice": provide exactly 4 options, only one correct

  Return JSON only:
  {
    "text": "<question text>",
    "type": "video" | "text" | "multiple_choice" | "code",
    "code_type": "visuals" | "problem_solving" | null,
    "options": ["A","B","C","D"] | null,
    "language": "javascript" | "python" | null,
    "max_time": <integer seconds (e.g. 60, 120, 180, 300)>
  }`;

      const generated = await callGroq(GENERATOR_MODEL, systemMsg, userMsg);
      console.log("Generator result:", JSON.stringify(generated));

      // Duplicate question guard
      const existingAtIndex = deduped.find((q) => q.order_index === nextQuestionNumber);
      if (existingAtIndex && existingAtIndex.answer_text == null) {
        return new Response(
          JSON.stringify({
            question: {
              id: existingAtIndex.id,
              text: existingAtIndex.question_text,
              type: existingAtIndex.question_type,
              options: (existingAtIndex.generation_context as Record<string, unknown>)?.options ?? null,
              language: (existingAtIndex.generation_context as Record<string, unknown>)?.language ?? null,
              codeType: (existingAtIndex.generation_context as Record<string, unknown>)?.code_type ?? null,
              maxTime: (existingAtIndex.generation_context as Record<string, unknown>)?.max_time ?? null,
              orderIndex: existingAtIndex.order_index,
            },
            answerEvaluation: latestEvaluation,
            isFinal: false,
            stageSummary: null,
          }),
          { headers: { "Content-Type": "application/json", ...corsHeaders } },
        );
      }

      const { data: newQuestion, error: insertError } = await supabase
        .from("application_questions")
        .insert({
          application_stage_id: applicationStageId,
          question_text: generated.text as string,
          question_type: generated.type as string,
          generated_by_ai: true,
          generation_context: {
            options: generated.options ?? null,
            language: generated.language ?? null,
            code_type: generated.code_type ?? null,
            max_time: generated.max_time ?? null,
            target_competency: supervisorAction.target_competency,
            target_concept: supervisorAction.target_concept,
          },
          order_index: nextQuestionNumber,
          generation_version: 2,
        })
        .select()
        .single();

      if (insertError || !newQuestion) {
        return new Response(
          JSON.stringify({ error: "Failed to save question", details: insertError }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
        );
      }

      return new Response(
        JSON.stringify({
          question: {
            id: newQuestion.id,
            text: generated.text as string,
            type: generated.type as string,
            options: (generated.options as string[]) ?? null,
            language: generated.language as string ?? null,
            codeType: generated.code_type as string ?? null,
            maxTime: generated.max_time as number ?? null,
            orderIndex: nextQuestionNumber,
          },
          answerEvaluation: latestEvaluation,
          isFinal: false,
          stageSummary: null,
        }),
        { headers: { "Content-Type": "application/json", ...corsHeaders } },
      );

    } catch (genErr) {
      console.error("Generator agent failed:", genErr);
      return new Response(
        JSON.stringify({ error: `Generator failed: ${genErr instanceof Error ? genErr.message : String(genErr)}` }),
        { status: 502, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }
});

// ─── Finalizer helper ─────────────────────────────────────────────────────────
async function runFinalizer(params: {
  supabase: ReturnType<typeof createClient>;
  stageState: StageState;
  evaluationCriteria: EvaluationCriterion[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deduped: any[];
  stage: { id: string; name: string; stage_type: string; pass_score: number | null; num_questions: number | null; description: string };
  job: { title: string; seniority_level: string };
  applicationStageId: string;
  latestEvaluation: Record<string, unknown> | null;
  corsHeaders: Record<string, string>;
}): Promise<Response> {
  const { supabase, stageState, evaluationCriteria, deduped, stage, job, applicationStageId, latestEvaluation, corsHeaders } = params;

  let summary: Record<string, unknown>;

  try {
    const historyText = deduped.map((q, i) => {
      const ans = q.answer_text ? q.answer_text.slice(0, 300) : "[No answer]";
      return `Q${i + 1} (${q.question_type}): "${q.question_text}"\nA${i + 1}: "${ans}" | Score: ${q.score ?? "?"}/100`;
    }).join("\n\n");

    const systemMsg = "You are finalizing an interview. Always respond with valid JSON only. Never include markdown or extra text.";
    const userMsg = `You are finalizing a ${stage.stage_type} interview for ${job.title} (${job.seniority_level}).

Evaluation criteria with weights:
${JSON.stringify(evaluationCriteria)}

Competency coverage and scores:
${JSON.stringify(stageState.competency_coverage)}

Full question/answer history:
${historyText}

Compute the overall score as a weighted average:
- For each competency: avg of its scores × (weight / 100)
- Sum across all competencies

Return JSON only:
{
  "overall_score": <0-100, weighted>,
  "recommendation": "proceed" | "review" | "reject",
  "reasoning": "<3-4 sentence assessment>",
  "strengths": ["..."],
  "weaknesses": ["..."]
}`;

    summary = await callGroq(FINALIZER_MODEL, systemMsg, userMsg);
    console.log("Finalizer result:", JSON.stringify(summary));

  } catch (finErr) {
    console.error("Finalizer agent failed, using fallback:", finErr);

    // Fallback: weighted avg from stage_state
    let overallScore = 0;
    let totalWeight = 0;
    for (const criterion of evaluationCriteria) {
      const cov = stageState.competency_coverage[criterion.competency];
      if (cov && cov.avg_score != null) {
        overallScore += cov.avg_score * (criterion.weight / 100);
        totalWeight += criterion.weight;
      }
    }
    if (totalWeight === 0) {
      // Plain average fallback
      const scored = deduped.filter(q => q.score != null);
      overallScore = scored.length > 0
        ? Math.round(scored.reduce((s, q) => s + (q.score ?? 0), 0) / scored.length)
        : 0;
    } else {
      overallScore = Math.round(overallScore);
    }

    summary = {
      overall_score: overallScore,
      recommendation: "review",
      reasoning: "Session finalized automatically. AI summary generation failed; score computed from weighted competency averages.",
      strengths: [],
      weaknesses: [],
    };
  }

  const passScore = stage.pass_score ?? 55;
  const overallScore = summary.overall_score as number;
  const stagePassed = overallScore >= passScore;

  await supabase.from("application_stage_evaluations").upsert(
    {
      application_stage_id: applicationStageId,
      ai_score: overallScore,
      recommendation: summary.recommendation as string,
      reasoning: summary.reasoning as string,
      strengths: (summary.strengths as string[]) || [],
      weaknesses: (summary.weaknesses as string[]) || [],
      confidence: 0.8,
    },
    { onConflict: "application_stage_id" },
  );

  await supabase
    .from("application_stages")
    .update({
      status: stagePassed ? "passed" : "failed",
      score: overallScore,
      completed_at: new Date().toISOString(),
    })
    .eq("id", applicationStageId);

  return new Response(
    JSON.stringify({
      question: null,
      answerEvaluation: latestEvaluation,
      isFinal: true,
      stageSummary: summary,
    }),
    { headers: { "Content-Type": "application/json", ...corsHeaders } },
  );
}
