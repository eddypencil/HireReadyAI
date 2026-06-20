import { supabase } from "@/shared/services/supabase";

export const uploadFile = async (file, bucket = "avatars", folder = "") => {
  if (!file || !bucket) throw new Error("Missing file or bucket");

  const ext = file.name.split(".").pop();
  const filePath = folder
    ? `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    : `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
};

export const deleteFile = async (url, bucket) => {
  if (!url || !bucket) return;

  const filePath = url.split("/").pop();
  if (!filePath) return;

  const { error } = await supabase.storage
    .from(bucket)
    .remove([filePath]);

  if (error) console.error("Failed to delete file:", error);
};
