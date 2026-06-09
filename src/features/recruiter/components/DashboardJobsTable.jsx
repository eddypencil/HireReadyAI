// src/features/recruiter/components/DashboardJobsTable.jsx
import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function DashboardJobsTable({ jobs }) {
  const { t } = useTranslation();

  if (!jobs || jobs.length === 0) {
    return (
      <div className="bg-surface rounded-xl border border-border p-8 text-center text-muted-foreground text-xs font-medium font-sans shadow-xs">
        {t("dashboard_jobs_table.no_jobs")}
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-xl shadow-xs overflow-hidden font-sans">
      <div className="px-5 py-3.5 border-b border-border bg-surface">
        <h3 className="text-sm font-bold text-foreground tracking-tight font-display">
          {t("dashboard_jobs_table.title")}
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-muted/30 border-b border-border">
              <th className="px-5 py-2.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                {t("dashboard_jobs_table.columns.job_title")}
              </th>
              <th className="px-5 py-2.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                {t("dashboard_jobs_table.columns.company")}
              </th>
              <th className="px-4 py-2.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-center">
                {t("dashboard_jobs_table.columns.applicants")}
              </th>
              <th className="px-4 py-2.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-center">
                {t("dashboard_jobs_table.columns.tested")}
              </th>
              <th className="px-4 py-2.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-center">
                {t("dashboard_jobs_table.columns.interview")}
              </th>
              <th className="px-4 py-2.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-center">
                {t("dashboard_jobs_table.columns.waiting_action")}
              </th>
              <th className="px-4 py-2.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-center">
                {t("dashboard_jobs_table.columns.shortlisted")}
              </th>
              <th className="px-5 py-2.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-right">
                {t("dashboard_jobs_table.columns.actions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {jobs.map((job) => (
              <tr
                key={job.id}
                className="hover:bg-muted/20 transition-colors group"
              >
                <td className="px-5 py-3">
                  <p className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors">
                    {job.job_title}
                  </p>
                </td>
                <td className="px-5 py-3 text-xs text-muted-foreground">
                  {job.company}
                </td>
                <td className="px-4 py-3 text-xs font-bold text-center text-primary">
                  {job.applicants_count}
                </td>
                <td className="px-4 py-3 text-xs text-center text-foreground/90">
                  {job.tested_count}
                </td>
                <td className="px-4 py-3 text-xs text-center text-foreground/90">
                  {job.interview_count}
                </td>
                <td className="px-4 py-3 text-xs text-center text-foreground/90">
                  {job.waiting_action_count}
                </td>
                <td className="px-4 py-3 text-xs text-center text-foreground/90">
                  {job.shortlisted_count}
                </td>
                <td className="px-5 py-3 text-right">
                  <Link
                    to={`/companies/shortlists/${job.id}`}
                    className="group inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700/80 rounded-md transition-colors"
                  >
                    {t("dashboard_jobs_table.view_shortlist")}{" "}
                    <ChevronRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}