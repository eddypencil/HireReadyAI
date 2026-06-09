// src/features/applicant/pages/ApplicantPage.jsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useUser } from "@/features/auth/context/user.context";
import { useApplications } from "@/features/applications/context/application.context";
import ApplicantHeader from "../components/ApplicantHeader";
import StatsCards from "../components/StatsCards";
import ChartsSection from "../components/ChartsSection";
import ApplicationsList from "../components/ApplicationsList";
import InterviewsList from "../components/InterviewList";
import WelcomeOverlay from "../components/WelcomeOverlay";
import { useTranslation } from "react-i18next";
import LoadingSpinner from "@/shared/ui/LoadingSpinner";

export default function ApplicantPage() {
  const { profile, user } = useUser();
  const [localProfile, setLocalProfile] = useState(profile);
  const [showWelcome, setShowWelcome] = useState(() => !sessionStorage.getItem("welcomeShown"));
  const { t } = useTranslation();
  const {
    loading,
    applications,
    error,
    getAllApplications,
    updateApplicationStage,
  } = useApplications();


  useEffect(() => {
    setLocalProfile(profile);
  }, [profile]);


  useEffect(() => {
    if (user?.id) {
      getAllApplications(user.id);
    }
  }, [user?.id]);

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
          profile={localProfile}
          applications={applications}
          onContinue={() => { sessionStorage.setItem("welcomeShown", "1"); setShowWelcome(false); }}
        />
      )}
      <div className="p-4">
      {/* Inner max-width container */}
      <div className="max-w-7xl mx-auto">
        {/* ── HEADER ─────────────────────────────── */}
        <motion.div
          className="mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <ApplicantHeader
            fullName={localProfile?.fullName}
            profile_pic={localProfile?.profile_pic}
            email={localProfile?.email}
            phone={localProfile?.phone}
            joinedDate={localProfile?.created_at}
            userId={user?.id}
            onAvatarChange={(url) =>
              setLocalProfile((prev) => ({ ...prev, profile_pic: url }))
            }
          />
        </motion.div>

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
      </div>
    </div>
    </div>
  );
}