import { useCallback, useEffect, useState } from "react";
import {
  fetchInterviewStageByApplicationId,
  fetchQuestionsByApplicationStageId,
} from "../services/interview_database_service";

/**
 * Loads the interview application_stage and its questions for a given application.
 *
 * Returns:
 *  - applicationStage: the application_stages row (with nested recruitment_stages)
 *  - questions: array of { id, text, orderIndex, generationContext, answer }
 *  - loading / error / reload
 */
export default function useInterviewQuestions(applicationId) {
  const [applicationStage, setApplicationStage] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!applicationId) return;
    setLoading(true);
    setError(null);
    try {
      // 1. Find the interview application_stage
      const stage = await fetchInterviewStageByApplicationId(applicationId);
      setApplicationStage(stage);

      // 2. Load questions for that stage
      if (stage?.id) {
        const qs = await fetchQuestionsByApplicationStageId(stage.id);
        setQuestions(
          qs.map((q) => ({
            id: q.id,
            text: q.question_text,
            orderIndex: q.order_index,
            questionType: q.question_type,
            generationContext: q.generation_context ?? {},
            // Convenience: the nested answer row (may be null before answered)
            answer: q.application_answers?.[0] ?? null,
          }))
        );
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    applicationStage,
    questions,
    loading,
    error,
    reload: load,
  };
}
