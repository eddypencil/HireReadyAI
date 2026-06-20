import { supabase } from "@/shared/services/supabase";

/**
 * Upload avatar + update profile_pic in DB
 */
export const uploadAndSaveAvatar = async (file, userId) => {
  if (!file || !userId) throw new Error("Missing file or userId");

  const filePath = `avatars/${userId}-${Date.now()}`;

  // 1. Upload to storage
  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (uploadError) throw uploadError;

  // 2. Get public URL
  const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

  const url = data.publicUrl;

  // 3. Save to profiles table
  const { error: dbError } = await supabase
    .from("profiles")
    .update({ profile_pic: url })
    .eq("id", userId);

  if (dbError) throw dbError;

  return url;
};
