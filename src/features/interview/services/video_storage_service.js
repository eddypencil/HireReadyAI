import { supabase } from "@/shared/services/supabase";

const BUCKET_NAME = "interview-recordings";

export const uploadRecording = async (blob, interviewId, questionId) => {
  const fileName = `${interviewId}/${questionId}_${Date.now()}.webm`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, blob, {
      contentType: "video/webm",
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(fileName);

  const { error: updateError } = await supabase
    .from("interview_questions")
    .update({
      recording_url: publicUrl,
    })
    .eq("id", questionId);

  if (updateError) throw updateError;

  return { publicUrl, fileName };
};

export const updateTranscript = async (questionId, transcript, confidence = null) => {
  const updates = { transcript };
  if (confidence !== null) {
    updates.whisper_confidence = confidence;
  }

  const { error } = await supabase
    .from("interview_questions")
    .update(updates)
    .eq("id", questionId);

  if (error) throw error;
};

export const deleteRecording = async (filePath) => {
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath]);

  if (error) throw error;
};
