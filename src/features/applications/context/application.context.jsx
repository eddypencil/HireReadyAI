//src\features\applications\context\application.context.jsx
import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { fetchApplicationsByApplicantId } from "../services/application.service";
import { supabase } from "@/shared/services/supabase";

const ApplicationContext = createContext(null);

export function ApplicationProvider({ children }) {
  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState(null);
  const currentUserIdRef = useRef(null);
  const knownAppIds = useRef(new Set());

  const getAllApplications = useCallback(async (applicantID) => {
    currentUserIdRef.current = applicantID;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchApplicationsByApplicantId(applicantID);
      setApplications(data);
      // Keep knownAppIds in sync
      knownAppIds.current = new Set((data || []).map((a) => a.id));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Realtime: keep the applications list live
  useEffect(() => {
    const channelRef = { current: null };

    const subscribe = (userId) => {
      if (!userId) return;
      if (channelRef.current) supabase.removeChannel(channelRef.current);

      channelRef.current = supabase
        .channel(`app-context-${userId}-${Date.now()}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "applications", filter: `candidate_profile_id=eq.${userId}` },
          (payload) => {
            if (payload.new?.id) knownAppIds.current.add(payload.new.id);
            getAllApplications(userId);
          }
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "applications", filter: `candidate_profile_id=eq.${userId}` },
          () => getAllApplications(userId)
        )
        .on(
          "postgres_changes",
          { event: "DELETE", schema: "public", table: "applications" },
          (payload) => {
            const deletedId = payload.old?.id;
            if (deletedId && knownAppIds.current.has(deletedId)) {
              knownAppIds.current.delete(deletedId);
              if (currentUserIdRef.current) getAllApplications(currentUserIdRef.current);
            }
          }
        )
        .subscribe();
    };

    // If a user ID is already set, subscribe immediately
    if (currentUserIdRef.current) subscribe(currentUserIdRef.current);

    // Watch for user ID changes via a polling interval (avoids prop-drilling)
    const interval = setInterval(() => {
      const uid = currentUserIdRef.current;
      if (uid && (!channelRef.current)) subscribe(uid);
    }, 2000);

    return () => {
      clearInterval(interval);
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [getAllApplications]);

  const updateApplicationStage = useCallback((appId, newStage) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, current_stage: newStage } : a))
    );
  }, []);

  return (
    <ApplicationContext.Provider value={{ loading, applications, error, getAllApplications, updateApplicationStage }}>
      {children}
    </ApplicationContext.Provider>
  );
}

export function useApplications() {
  const context = useContext(ApplicationContext);
  if (!context) {
    throw new Error("useApplications must be used within an ApplicationProvider");
  }
  return context;
}
