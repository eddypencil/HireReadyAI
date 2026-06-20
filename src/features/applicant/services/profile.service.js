import { supabase } from "@/shared/services/supabase";
import { getProfile } from "@/features/auth/services/auth.service";

export const fetchApplicantProfile = async (userId) => {
  return getProfile(userId);
};

export const updateApplicantProfile = async (userId, data) => {
  const { error } = await supabase
    .from("profiles")
    .update(data)
    .eq("id", userId);
  if (error) throw error;
};
