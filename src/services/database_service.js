import { supabase } from "./supabase";

export const postJob = async () => {
  const { data, error } = await supabase.from("job_postings").insert([
    {
      company_id: "company-uuid",
      created_by_profile_id: "profile-uuid",
      title: "Frontend Developer",
      seniority_level: "mid",
      description: "React developer needed",
    },
  ]);

  if (error) {
    console.log(error);
  } else {
    console.log(data);
  }
};
