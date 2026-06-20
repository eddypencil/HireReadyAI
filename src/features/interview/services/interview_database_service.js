import { supabase } from "@/shared/services/supabase";

// ─── Application Stage (Interview) ──────────────────────────────────────────

/**
 * Find the interview application_stage for a given application.
 * Matches any recruitment_stage whose stage_type = 'interview'.
 */
export const fetchInterviewStageByApplicationId = async (applicationId) => {
  const { data, error } = await supabase
    .from("application_stages")
    .select(`
      *,
      recruitment_stages!inner (
        id,
        name,
        stage_type,
        job_id,
        description
      ),
      applications (
        id,
        candidate_profile_id,
        composite_score
      )
    `)
    .eq("application_id", applicationId)
    .eq("recruitment_stages.stage_type", "interview")
    .maybeSingle();

  if (error) throw error;
  return data;
};

/**
 * Update status / score / timestamps on an application_stage row.
 */
export const updateApplicationStageStatus = async (applicationStageId, updates) => {
  const { data, error } = await supabase
    .from("application_stages")
    .update(updates)
    .eq("id", applicationStageId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ─── Application Questions ───────────────────────────────────────────────────

/**
 * Fetch all questions for a given application_stage, ordered by order_index.
 * Each question includes its answer (if any) via the nested application_answers join.
 */
export const fetchQuestionsByApplicationStageId = async (applicationStageId) => {
  const { data, error } = await supabase
    .from("application_questions")
    .select(`
      *,
      application_answers (
        id,
        answer_text,
        score,
        feedback,
        created_at
      )
    `)
    .eq("application_stage_id", applicationStageId)
    .order("order_index", { ascending: true });

  if (error) throw error;
  return data;
};

/**
 * Fetch a single question by id (with its answer).
 */
export const fetchApplicationQuestionById = async (questionId) => {
  const { data, error } = await supabase
    .from("application_questions")
    .select(`
      *,
      application_answers (*)
    `)
    .eq("id", questionId)
    .single();

  if (error) throw error;
  return data;
};

/**
 * Insert a single question for an application stage.
 */
export const createApplicationQuestion = async (questionData) => {
  const { data, error } = await supabase
    .from("application_questions")
    .insert([questionData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Insert multiple questions for an application stage in one request.
 */
export const bulkCreateApplicationQuestions = async (questionsData) => {
  const { data, error } = await supabase
    .from("application_questions")
    .insert(questionsData)
    .select();

  if (error) throw error;
  return data;
};

/**
 * Update fields on an application_question (e.g. generation_context for
 * recording_url / storage_path / transcription_status).
 */
export const updateApplicationQuestion = async (questionId, updates) => {
  const { data, error } = await supabase
    .from("application_questions")
    .update(updates)
    .eq("id", questionId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteApplicationQuestion = async (questionId) => {
  const { error } = await supabase
    .from("application_questions")
    .delete()
    .eq("id", questionId);

  if (error) throw error;
};

// ─── Application Answers ─────────────────────────────────────────────────────

/**
 * Upsert a candidate's answer (transcript text) for a question.
 * Uses the UNIQUE constraint on question_id.
 */
export const upsertApplicationAnswer = async (questionId, answerText, extra = {}) => {
  const { data, error } = await supabase
    .from("application_answers")
    .upsert(
      { question_id: questionId, answer_text: answerText, ...extra },
      { onConflict: "question_id" }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Fetch the answer for a specific question.
 */
export const fetchAnswerByQuestionId = async (questionId) => {
  const { data, error } = await supabase
    .from("application_answers")
    .select("*")
    .eq("question_id", questionId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

// ─── Application Stage Evaluations ───────────────────────────────────────────

/**
 * Upsert an AI evaluation result for a completed interview stage.
 * Uses the UNIQUE constraint on application_stage_id.
 */
export const upsertStageEvaluation = async (applicationStageId, evalData) => {
  const { data, error } = await supabase
    .from("application_stage_evaluations")
    .upsert(
      { application_stage_id: applicationStageId, ...evalData },
      { onConflict: "application_stage_id" }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Fetch the AI evaluation for an interview stage.
 */
export const fetchStageEvaluation = async (applicationStageId) => {
  const { data, error } = await supabase
    .from("application_stage_evaluations")
    .select("*")
    .eq("application_stage_id", applicationStageId)
    .maybeSingle();

  if (error) throw error;
  return data;
};