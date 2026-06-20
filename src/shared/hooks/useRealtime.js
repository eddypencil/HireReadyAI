import { useEffect, useRef } from "react";
import { supabase } from "@/shared/services/supabase";

/**
 * Realtime hook for applicants on the website.
 * Listens to status/stage changes on the applicant's own applications.
 *
 * @param {string} userId - User profile ID
 * @param {Function} setToast - Function to set active toast notifications
 */
export function useRealtimeApplicant(userId, setToast) {
  const knownAppIds = useRef(new Set());

  useEffect(() => {
    if (!userId) return;

    // Pre-load known application IDs so DELETE events (PK-only) can be matched
    supabase
      .from("applications")
      .select("id")
      .eq("candidate_profile_id", userId)
      .then(({ data }) => {
        if (data) knownAppIds.current = new Set(data.map((r) => r.id));
      });

    const channel = supabase
      .channel(`web-applicant-realtime-${userId}-${Date.now()}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "applications",
          filter: `candidate_profile_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.new?.id) knownAppIds.current.add(payload.new.id);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "applications",
          filter: `candidate_profile_id=eq.${userId}`,
        },
        (payload) => {
          console.log("[Realtime Web] Application UPDATE for applicant:", payload.new?.id);
          if (payload.new.current_stage_id !== payload.old.current_stage_id) {
            setToast({
              type: "success",
              message: "Your application status has been updated.",
              route: "/applicant",
            });
          }
        }
      )
      // DELETE — no filter; use knownAppIds to decide ownership
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "applications",
        },
        (payload) => {
          const deletedId = payload.old?.id;
          console.log("[Realtime Web] Application DELETE detected:", deletedId);
          if (deletedId && knownAppIds.current.has(deletedId)) {
            knownAppIds.current.delete(deletedId);
            setToast({
              type: "success",
              message: "An application has been withdrawn.",
              route: "/applicant",
            });
          }
        }
      )
      .subscribe();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [userId, setToast]);
}

/**
 * Realtime hook for recruiters on the website.
 * Listens to application events (inserts, updates, deletes) belonging to jobs of the recruiter's company.
 *
 * @param {string} companyId - Recruiter's company ID
 * @param {Function} setToast - Function to set active toast notifications
 */
export function useRealtimeRecruiter(companyId, setToast) {
  // Pre-fetch job IDs so the callback can be fully synchronous
  const companyJobIds = useRef(new Set());

  useEffect(() => {
    if (!companyId) return;

    // Load all job IDs for this company upfront
    supabase
      .from("job_postings")
      .select("id")
      .eq("company_id", companyId)
      .then(({ data }) => {
        if (data) companyJobIds.current = new Set(data.map((j) => j.id));
      });

    const channel = supabase
      .channel(`web-recruiter-realtime-${companyId}-${Date.now()}`)
      // Listen to all application changes — filter by known job IDs synchronously
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "applications",
        },
        (payload) => {
          const jobId = payload.new?.job_id;
          console.log("[Realtime Web] New application INSERT, job_id:", jobId, "known jobs:", [...companyJobIds.current]);
          if (jobId && companyJobIds.current.has(jobId)) {
            setToast({
              type: "success",
              message: "New application received.",
              route: "/companies/candidates",
            });
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "applications",
        },
        (payload) => {
          const jobId = payload.new?.job_id;
          if (jobId && companyJobIds.current.has(jobId)) {
            setToast({
              type: "success",
              message: "An application stage has been updated.",
              route: "/companies/candidates",
            });
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "applications",
        },
        (payload) => {
          const jobId = payload.old?.job_id;
          if (jobId && companyJobIds.current.has(jobId)) {
            setToast({
              type: "success",
              message: "An application has been removed.",
              route: "/companies/candidates",
            });
          }
        }
      )
      // Track new jobs added to this company so future applications to them are caught
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "job_postings",
          filter: `company_id=eq.${companyId}`,
        },
        (payload) => {
          if (payload.new?.id) companyJobIds.current.add(payload.new.id);
        }
      )
      .subscribe((status) => {
        console.log("[Realtime Web] Recruiter channel status:", status);
      });

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [companyId, setToast]);
}
