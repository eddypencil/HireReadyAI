// src\features\recruiter\pages\RecruiterDashboardPage.jsx
import React from "react";
import { useEffect, useState } from "react";
import { useDashboardData } from "../hooks/useDashboardData";
import DashboardStats from "../components/DashboardStats";
import LoadingSpinner from "@/shared/ui/LoadingSpinner";
import DashboardCharts from "../components/DashboardCharts";
import DashboardJobsTable from "../components/DashboardJobsTable";
import { fetchCurrentUserName } from "../services/dashboard.service";
import { useUser } from "../../auth/context/user.context";

import { useTranslation } from "react-i18next";
export default function RecruiterDashboardPage() {
  const {
    jobs,
    stats,
    pipelineSummaryData,
    trendData,
    topJobsData,
    isLoading,
    error,
  } = useDashboardData();
  const { t } = useTranslation();

  const { profile } = useUser();
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    async function loadName() {
      if (!profile?.id) return;

      try {
        const name = await fetchCurrentUserName(profile.id);
        setFullName(name);
      } catch (err) {
        console.error("Failed to fetch user name", err);
      }
    }

    loadName();
  }, [profile?.id]);

  if (isLoading) {
    return <LoadingSpinner message={t("recruiter_dashboard.loading")} />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-red-50 text-red-700 p-6 rounded-xl text-sm border border-red-100 max-w-md w-full shadow-sm">
          <span className="font-bold block mb-1">Error Loading Data</span>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {t("recruiter_dashboard.title")}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {t("recruiter_dashboard.subtitle")}
            </p>
          </div>

          <div className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 font-semibold shadow-sm">
            {t("sign_in.headline")},{" "}
            <span className="text-[#0f294a]">{fullName || "Recruiter"}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <DashboardStats stats={stats} />

        {/* Charts Section */}
        {pipelineSummaryData && topJobsData.length > 0 && (
          <DashboardCharts
            pipelineSummaryData={pipelineSummaryData}
            trendData={trendData}
            topJobsData={topJobsData}
          />
        )}

        {/* Jobs Table */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-1 shadow-sm">
          <DashboardJobsTable jobs={jobs} />
        </div>
      </div>
    </div>
  );
}
