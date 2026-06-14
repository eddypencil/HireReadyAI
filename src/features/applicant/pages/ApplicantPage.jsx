// src/features/applicant/pages/ApplicantPage.jsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useUser } from "@/features/auth/context/user.context";
import { useApplications } from "@/features/applications/context/application.context";
import StatsCards from "../components/StatsCards";
import ChartsSection from "../components/ChartsSection";
import ApplicationsList from "../components/ApplicationsList";
import InterviewsList from "../components/InterviewList";
import WelcomeOverlay from "../components/WelcomeOverlay";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "@/shared/ui/LoadingSpinner";

export default function ApplicantPage() {
  const { profile, user } = useUser();
  const [showWelcome, setShowWelcome] = useState(
    () => !sessionStorage.getItem("welcomeShown"),
  );
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    loading,
    applications,
    error,
    getAllApplications,
    updateApplicationStage,
  } = useApplications();

  useEffect(() => {
    if (user?.id) {
      getAllApplications(user.id);
    }
  }, [user?.id, getAllApplications]);

  if (loading) {
    return <LoadingSpinner message={t("applicant_dashboard.loading")} />;
  }

  if (error) {
    return (
      <div className="m-6 px-5 py-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-xs font-sans">
        {error}
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-surface-muted font-sans text-foreground">
      {showWelcome && (
        <WelcomeOverlay
          profile={profile}
          applications={applications}
          onContinue={() => {
            sessionStorage.setItem("welcomeShown", "1");
            setShowWelcome(false);
          }}
        />
      )}
      <div className="p-4">
        {/* Inner max-width container */}
        <div className="max-w-7xl mx-auto">
          {/* ── EMPTY STATE (ONLY WHEN NO APPLICATIONS) ───────────────── */}
          {applications?.length === 0 ? (
            <div className="bg-card rounded-2xl h-dvh flex flex-col justify-center items-center p-10 text-center border border-border shadow-sm">
              <h2 className="text-lg font-semibold text-foreground mb-2">
                {t("apply_job.empty_state.no_applications")}
              </h2>

              <p className="text-sm text-muted-foreground mb-6">
                {t("apply_job.empty_state.start_exploring")}
              </p>

              <button
                onClick={() => navigate("/jobs")}
                className="
      bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-medium
      hover:bg-primary-hover transition-colors
    "
              >
                {t("howItWorks.applicantSteps.step1.title")}
              </button>
            </div>
          ) : (
            <>
              {/* ── STATS ──────────────────────────────── */}
              <motion.div
                className="mb-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
              >
                <StatsCards applications={applications} />
              </motion.div>

              {/* ── CHARTS ──────────────────────────────── */}
              <motion.div
                className="mb-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
              >
                <ChartsSection applications={applications} />
              </motion.div>

              {/* ── MAIN GRID ──────────────────────────── */}
              <motion.div
                className="grid grid-cols-1 gap-4 applicant-grid"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.45, ease: "easeOut" }}
              >
                {/* LEFT: main column */}
                <div className="flex flex-col gap-4 col-span-full applicant-main">
                  <ApplicationsList applications={applications} />

                  <InterviewsList
                    applications={applications}
                    onStageUpdated={(appId, newStage) => {
                      updateApplicationStage(appId, newStage);
                    }}
                  />
                </div>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
