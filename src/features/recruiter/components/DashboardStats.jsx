// src/features/recruiter/components/DashboardStats.jsx
import React from "react";
import { motion } from "framer-motion";
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
      icon: <CheckCircle className="w-4 h-4 text-success" />,
      iconBg: "bg-success/10",
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
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-30px" }}
          transition={{ duration: 0.5, delay: 0.1 + idx * 0.1, ease: "easeOut" }}
          className="bg-surface border border-border rounded-xl p-4 shadow-xs flex items-center justify-between hover:border-border/80 transition-colors duration-200"
        >
          <div className="min-w-0">
            <p className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase mb-1 truncate">
              {card.label}
            </p>
            <h3 className="text-2xl font-bold text-foreground tracking-tight font-display">
              {card.value}
            </h3>
          </div>
          <div className={`w-9 h-9 rounded-xl ${card.iconBg} flex items-center justify-center shrink-0 transition-transform duration-200 hover:scale-105`}>
            {card.icon}
          </div>
        </motion.div>
      ))}
    </div>
  );
}