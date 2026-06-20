import { supabase } from "@/shared/services/supabase";
import { updateApplicationQuestion } from "./interview_database_service";

const BUCKET_NAME = "interview-recordings";

/**
 * Upload a recorded answer blob to storage, then store the recording metadata
 * inside application_questions.generation_context so the whisper edge function
 * can look it up by questionId (application_questions.id).
 *
 * generation_context shape:
 * {
 *   recording_url: string,
 *   storage_path: string,
 *   transcription_status: "pending" | "processing" | "completed" | "failed"
 * }
 *
 * @param {Blob}   blob               - The recorded video/audio blob
 * @param {string} applicationStageId - The application_stages.id (used as folder prefix)
 * @param {string} questionId         - The application_questions.id
 */
export const uploadRecording = async (blob, applicationStageId, questionId) => {
  const fileName = `${applicationStageId}/${questionId}_${Date.now()}.webm`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, blob, {
      contentType: "video/webm",
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);

  // Merge recording metadata into generation_context without overwriting other keys
  const { data: current } = await supabase
    .from("application_questions")
    .select("generation_context")
    .eq("id", questionId)
    .single();

  await updateApplicationQuestion(questionId, {
    generation_context: {
      ...(current?.generation_context || {}),
      recording_url: publicUrl,
      storage_path: fileName,
      transcription_status: "pending",
    },
  });

  // Also pre-create/upsert the application_answers row with the video URL
  // so the applicant view (ExpandableQuestion) can find it.
  await supabase
    .from("application_answers")
    .upsert(
      { 
        question_id: questionId, 
        recording_url: publicUrl,
        storage_path: fileName,
        transcription_status: "pending"
      },
      { onConflict: "question_id" }
    );

  return { publicUrl, fileName };
};

/**
 * Retry any questions in a stage that haven't finished transcription.
 * Checks generation_context->>'transcription_status' != 'completed'.
 *
 * @param {string} applicationStageId
 */
export const retryPendingTranscriptions = async (applicationStageId) => {
  const { data: questions, error } = await supabase
    .from("application_questions")
    .select("id, generation_context")
    .eq("application_stage_id", applicationStageId);

  if (error) throw error;
  if (!questions?.length) return [];

  const pending = questions.filter(
    (q) =>
      q.generation_context?.storage_path &&
      q.generation_context?.transcription_status !== "completed"
  );

  if (!pending.length) return [];

  const results = await Promise.allSettled(
    pending.map((q) =>
      supabase.functions.invoke("whisper-api", {
        body: {
          audioPath: q.generation_context.storage_path,
          questionId: q.id,
        },
      })
    )
  );

  return results;
};

/**
 * Delete a recording file from storage.
 * @param {string} filePath - The storage_path stored in generation_context
 */
export const deleteRecording = async (filePath) => {
  const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);
  if (error) throw error;
};
