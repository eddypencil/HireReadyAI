import { supabase } from "./supabase";

// Fetch all jobs across all companies
export const fetchAllJobs = async () => {
  const { data, error } = await supabase
    .from("job_postings")
    .select(`
      *,
      companies (
        id,
        name,
        logo_url
      )
    `)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
};

// Create a job posting
export const createJob = async (jobData) => {
  const { data, error } = await supabase
    .from("job_postings")
    .insert([jobData])
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Update a job posting
export const updateJob = async (jobId, updates) => {
  const { data, error } = await supabase
    .from("job_postings")
    .update(updates)
    .eq("id", jobId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Delete a job posting
export const deleteJob = async (jobId) => {
  const { error } = await supabase
    .from("job_postings")
    .delete()
    .eq("id", jobId);
  if (error) throw error;
};
