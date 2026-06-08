//src\features\recruiter\components\DashboardStats.jsx
import React from "react";
import { Briefcase, Users, CheckCircle, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
export default function DashboardStats({ stats }) {
  const { t } = useTranslation();
  const cards = [
    {
      label: t("dashboard_stats.total_jobs"),
      value: stats.totalJobs,
      icon: <Briefcase className="w-4 h-4 text-primary" />,
      iconBg: "bg-primary/10",
    },
    {
      label: t("dashboard_stats.total_applicants"),
      value: stats.totalApplicants,
      icon: <Users className="w-4 h-4 text-primary" />,
      iconBg: "bg-primary/10",
    },
    {
      label: t("dashboard_stats.accepted"),
      value: stats.totalAccepted,
      icon: <CheckCircle className="w-4 h-4 text-emerald-500" />,
      iconBg: "bg-emerald-500/10",
    },
    {
      label: t("dashboard_stats.rejected"),
      value: stats.totalRejected,
      icon: <XCircle className="w-4 h-4 text-destructive" />,
      iconBg: "bg-destructive/10",
    },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-6 font-sans">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="bg-background border border-border/60 rounded-xl p-4 shadow-xs flex items-center justify-between hover:border-border transition-colors duration-200"
        >
          <div className="min-w-0">
            <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase mb-0.5 truncate">
              {card.label}
            </p>
            <h3 className="text-2xl font-bold text-foreground tracking-tight">
              {card.value}
            </h3>
          </div>
          <div className={`w-9 h-9 rounded-lg ${card.iconBg} flex items-center justify-center shrink-0`}>
            {card.icon}
          </div>
        </div>
      ))}
    </div>
  );
}