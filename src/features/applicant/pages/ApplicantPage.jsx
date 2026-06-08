// src/features/applicant/pages/ApplicantPage.jsx
import { useEffect, useState } from "react";
import { useUser } from "@/features/auth/context/user.context";
import { useApplications } from "@/features/applications/context/application.context";
import ApplicantHeader from "../components/ApplicantHeader";
import StatsCards from "../components/StatsCards";
import ApplicationsList from "../components/ApplicationsList";
import InterviewsList from "../components/InterviewList";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ApplicantPage() {
  const { profile, user } = useUser();
  const [localProfile, setLocalProfile] = useState(profile);
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
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#eef7fa",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        <div
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #01497c, #468faf)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 8px 24px rgba(1,73,124,0.25)",
          }}
        >
          <Loader2
            size={22}
            color="white"
            style={{ animation: "spin 1s linear infinite" }}
          />
        </div>
        <p
          style={{
            fontSize: "13px",
            color: "#2a6f97",
            fontWeight: "500",
            margin: 0,
          }}
        >
          {t("applicant_dashboard.loading")}
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          margin: "24px",
          padding: "16px 20px",
          background: "rgba(185,28,28,0.07)",
          border: "1px solid rgba(185,28,28,0.2)",
          borderRadius: "12px",
          color: "#b91c1c",
          fontSize: "13px",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        {error}
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#eef7fa",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        color: "#012a4a",
        padding: "24px",
      }}
    >
      {/* Inner max-width container */}
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        {/* ── HEADER ─────────────────────────────── */}
        <div style={{ marginBottom: "24px" }}>
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
        </div>

        {/* ── STATS ──────────────────────────────── */}
        <div style={{ marginBottom: "24px" }}>
          <StatsCards applications={applications} />
        </div>

        {/* ── MAIN GRID ──────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "24px",
          }}
          className="applicant-grid"
        >
          {/* LEFT: main column */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              gridColumn: "1 / -1",
            }}
            className="applicant-main"
          >
            <ApplicationsList applications={applications} />

            <InterviewsList
              applications={applications}
              onStageUpdated={(appId, newStage) => {
                updateApplicationStage(appId, newStage);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}