import { supabase } from "@/shared/services/supabase";

/**
 * Find the current interview stage for an application using current_stage_id.
 * Only returns interview-type stages (excludes automated stages like cv_review, shortlist, offer).
 * Creates the application_stages record on first access if it doesn't exist yet.
 */
export const fetchActiveInterviewStage = async (applicationId) => {
  const INTERVIEW_STAGE_TYPES = [
    "assessment_test",
    "coding_test",
    "video_interview",
    "technical_interview",
    "hr_interview",
    "manager_interview",
    "ai_screening",
  ];

  // 1. Get current_stage_id from the application
  const { data: app, error: appError } = await supabase
    .from("applications")
    .select("current_stage_id")
    .eq("id", applicationId)
    .single();

  if (appError) throw appError;
  if (!app?.current_stage_id) return null;

  // 2. Check if the stage is an interview type
  const { data: recStage, error: recError } = await supabase
    .from("recruitment_stages")
    .select("id, stage_type")
    .eq("id", app.current_stage_id)
    .single();

  if (recError) throw recError;
  if (!recStage || !INTERVIEW_STAGE_TYPES.includes(recStage.stage_type)) return null;

  // 3. Find or create the application_stages record
  const { data: existing, error: findError } = await supabase
    .from("application_stages")
    .select(`
      id,
      recruitment_stages!inner (
        id, name, description, stage_type, pass_score, evaluation_criteria, order_index
      )
    `)
    .eq("application_id", applicationId)
    .eq("stage_id", app.current_stage_id)
    .maybeSingle();

  if (findError) throw findError;
  if (existing) return existing;

  // 4. Create the record on first access
  const { data: created, error: createError } = await supabase
    .from("application_stages")
    .upsert(
      { application_id: applicationId, stage_id: app.current_stage_id },
      { onConflict: "application_id,stage_id" },
    )
    .select(`
      id,
      recruitment_stages!inner (
        id, name, description, stage_type, pass_score, evaluation_criteria, order_index
      )
    `)
    .single();

  if (createError) throw createError;
  return created;
};

/**
 * Fetch existing questions (with answers) for a stage, ordered.
 * Used to resume an in-progress session.
 */
export const fetchStageQuestions = async (applicationStageId) => {
  const { data, error } = await supabase
    .from("application_questions")
    .select(`
      id, question_text, question_type, order_index, generation_context,
      application_answers ( answer_text, score, feedback )
    `)
    .eq("application_stage_id", applicationStageId)
    .order("order_index", { ascending: true });

  if (error) throw error;
  return data ?? [];
};

/**
 * Call the generate-question edge function.
 * - Pass previousAnswer=null to get the very first question.
 * - Pass previousAnswer={questionId, answerText} to evaluate + get next question.
 *
 * Returns:
 * {
 *   question: { id, text, type, options, language, orderIndex } | null,
 *   answerEvaluation: { score, feedback, strengths, improvements } | null,
 *   isFinal: boolean,
 *   stageSummary: { overall_score, recommendation, reasoning } | null
 * }
 */
export const generateNextQuestion = async (applicationStageId, previousAnswer = null) => {
  // Use raw fetch instead of supabase.functions.invoke so we can always read
  // the response body — invoke throws a generic "non-2xx" error and loses the
  // actual error message returned by the edge function.
  const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey  = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  const res = await fetch(`${supabaseUrl}/functions/v1/generate-question-v2`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${supabaseKey}`,
      "apikey": supabaseKey,
    },
    body: JSON.stringify({ applicationStageId, previousAnswer }),
  });

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error(`Edge function returned non-JSON (status ${res.status})`);
  }

  if (!res.ok) {
    // Surface the actual error from the edge function body
    const detail = data?.error ?? data?.message ?? JSON.stringify(data);
    console.error(`generate-question HTTP ${res.status}:`, detail);
    throw new Error(`Interview AI error (${res.status}): ${detail}`);
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data;
};
