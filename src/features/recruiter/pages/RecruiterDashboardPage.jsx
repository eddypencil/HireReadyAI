import { useEffect, useState } from "react";
import { motion } from "framer-motion";
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
      <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
        <div className="bg-destructive/10 text-destructive p-6 rounded-xl text-sm border border-destructive/20 max-w-md w-full shadow-xs">
          <span className="font-bold block mb-1">Error Loading Data</span>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-30px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight font-display">
              {t("recruiter_dashboard.title")}
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              {t("recruiter_dashboard.subtitle")}
            </p>
          </div>

          <div className="px-4 py-2 rounded-xl bg-surface border border-border text-xs text-muted-foreground font-semibold shadow-xs">
            {t("sign_in.headline")},{" "}
            <span className="text-primary font-bold">
              {fullName || "Recruiter"}
            </span>
          </div>
        </motion.div>

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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-30px" }}
          transition={{ duration: 0.5, delay: 0.35, ease: "easeOut" }}
          className="bg-surface rounded-xl border border-border p-1 shadow-xs"
        >
          <DashboardJobsTable jobs={jobs} />
        </motion.div>
      </div>
    </div>
  );
}
