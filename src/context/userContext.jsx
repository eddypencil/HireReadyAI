import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import {
  getProfile,
  makeProfile,
  signIn,
  signUp,
  logOut,
  resetPassword,
  updatePassword,
} from "../services/auth_service";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to load profile for a given user id
  const fetchAndSetProfile = async (userId) => {
    try {
      const userProfile = await getProfile(userId);
      console.log(userProfile);
      setProfile(userProfile);
    } catch (err) {
      console.error("Failed to load user profile:", err.message);
      setProfile(null);
    }
  };

  useEffect(() => {
    console.log("Subscribing to onAuthStateChange...");
    setLoading(true);
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        setLoading(false);
        // Defer the profile fetch to the next event loop tick.
        // Calling other Supabase queries synchronously inside onAuthStateChange
        // causes a deadlock because the client holds an internal lock during the callback.
        setTimeout(() => {
          fetchAndSetProfile(session.user.id);
        }, 0);
      } else {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      console.log("Unsubscribing from onAuthStateChange");
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
    } finally {
      setLoading(false);
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
    } finally {
      setLoading(false);
    }
  };

  const signOutUser = async () => {
    setLoading(true);
    try {
      await logOut();
    } catch (err) {
      console.error("Sign out error:", err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetUserPassword = async (email, redirectTo) => {
    setLoading(true);
    try {
      await resetPassword(email);
    } catch (err) {
      setLoading(false);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateUserPassword = async (newPassword) => {
    setLoading(true);
    try {
      await updatePassword(newPassword);
    } catch (err) {
      setLoading(false);
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
        resetUserPassword,
        updateUserPassword,
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
