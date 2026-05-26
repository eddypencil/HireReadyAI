import { supabase } from "./supabase";

// Fetch all companies
export const fetchAllCompanies = async () => {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
};

// Fetch a single company with its memberships (including profiles) and job postings
export const fetchCompanyById = async (companyId) => {
  const { data, error } = await supabase
    .from("companies")
    .select(`
      *,
      company_memberships(
        *,
        profiles(*)
      ),
      job_postings(*)
    `)
    .eq("id", companyId)
    .single();
  if (error) throw error;
  return data;
};

// Create a new company
export const createCompany = async (companyData) => {
  const { data, error } = await supabase
    .from("companies")
    .insert([companyData])
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Update an existing company
export const updateCompany = async (companyId, updates) => {
  const { data, error } = await supabase
    .from("companies")
    .update(updates)
    .eq("id", companyId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Delete a company
export const deleteCompany = async (companyId) => {
  const { error } = await supabase
    .from("companies")
    .delete()
    .eq("id", companyId);
  if (error) throw error;
};
