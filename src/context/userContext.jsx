import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { getProfile, makeProfile, signIn, signUp, signOut } from "../services/auth_service";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to load profile for a given user id
  const fetchAndSetProfile = async (userId) => {
    try {
      const userProfile = await getProfile(userId);
      setProfile(userProfile);
    } catch (err) {
      console.error("Failed to load user profile:", err.message);
      setProfile(null);
    }
  };

  useEffect(() => {
    // 1. Check for initial session on mount
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await fetchAndSetProfile(session.user.id);
        }
      } catch (err) {
        console.error("Auth initialization error:", err.message);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // 2. Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setLoading(true);
        if (session?.user) {
          setUser(session.user);
          await fetchAndSetProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUpUser = async (email, password, userProfile) => {
    setLoading(true);
    try {
      const registeredUser = await signUp(email, password);
      // Wait for auth session to register, then create the profile
      await makeProfile(userProfile);
      return registeredUser;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const signInUser = async (email, password) => {
    setLoading(true);
    try {
      const loggedInUser = await signIn(email, password);
      await fetchAndSetProfile(loggedInUser.id);
      return loggedInUser;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const signOutUser = async () => {
    setLoading(true);
    try {
      await signOut();
      setUser(null);
      setProfile(null);
    } catch (err) {
      console.error("Sign out error:", err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        profile,
        loading,
        signUpUser,
        signInUser,
        signOutUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
