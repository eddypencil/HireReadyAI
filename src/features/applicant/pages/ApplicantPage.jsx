//src\features\applicant\pages\ApplicantPage.jsx
import { useEffect, useState } from "react";
import { useUser } from "@/features/auth/context/user.context";
import { useApplications } from "@/features/applications/context/application.context";
import ApplicantHeader from "../components/ApplicantHeader";
import StatsCards from "../components/StatsCards";
import ApplicationsList from "../components/ApplicationsList";
import RecommendedJobs from "../components/RecommendedJobs";
import ProfileStrength from "../components/ProfileStrength";
import FeedbackTips from "../components/FeedbackTips";
import InterviewsList from "../components/InterviewList";

export default function ApplicantPage() {
  const { profile, user } = useUser();
  const [localProfile, setLocalProfile] = useState(profile);
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
    return (
      <div className="min-h-screen bg-secondary/30 flex flex-col items-center justify-center text-sidebar">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-sm text-muted-foreground animate-pulse">
          Loading applications...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-destructive bg-destructive/5 border border-destructive/20 rounded-xl text-sm font-medium">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30 text-sidebar p-6 space-y-6 font-sans">
      {/* HEADER (DB ONLY) */}
      <ApplicantHeader
        fullName={localProfile?.fullName}
        profile_pic={localProfile?.profile_pic}
        userId={user?.id}
        onAvatarChange={(url) =>
          setLocalProfile((prev) => ({
            ...prev,
            profile_pic: url,
          }))
        }
      />

      {/* STATS (DB ONLY) */}
      <StatsCards applications={applications} />

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT SIDE */}
        <div className="lg:col-span-2 space-y-6">
          <ApplicationsList applications={applications} />

          <InterviewsList
            applications={applications}
            onStageUpdated={(appId, newStage) => {
              updateApplicationStage(appId, newStage);
            }}
          />

          <FeedbackTips />
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-6">
          <ProfileStrength />
          <RecommendedJobs />
        </div>
      </div>
    </div>
  );
}