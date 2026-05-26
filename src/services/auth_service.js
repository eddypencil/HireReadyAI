import { supabase } from "./supabase";

export const signUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) {
    throw error;
  }
  return data.user;
};

export const makeProfile = async (userProfile) => {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId) throw new Error("No user found");
  
  const { data, error } = await supabase.from('profiles').insert([{
    id: userId,
    full_name: userProfile.fullName,
    role: userProfile.role,
    phone: userProfile.phone,
    is_active: userProfile.isActive
  }]);
  
  if (error) {
    throw error;
  }
  return data;
};

export const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) {
    throw error;
  }
  return data;
};

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    throw error;
  }
  return data.user;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
};

