import { supabase } from "@/shared/services/supabase";

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
  if (error) throw error;
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

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        prompt: 'select_account',
      },
    },
  });
  if (error) throw error;
  return data;
};

export const logOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};
 
export const resetPassword = async (email, redirectTo) => {
  const options = redirectTo ? { redirectTo } : undefined;
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, options);
  if (error) {
    throw error;
  }
  return data;
};

export const updatePassword = async (newPassword) => {
  const { data, error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) {
    throw error;
  }
  return data;
};