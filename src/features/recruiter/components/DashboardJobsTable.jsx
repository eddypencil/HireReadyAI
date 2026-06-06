import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export default function DashboardJobsTable({ jobs }) {
  if (!jobs || jobs.length === 0) {
    return (
      <div className="bg-background rounded-xl border border-border/60 p-8 text-center text-muted-foreground text-xs font-medium font-sans">
        No jobs available
      </div>
    );
  }

  return (
    <div className="bg-background border border-border/60 rounded-xl shadow-xs overflow-hidden font-sans">
      <div className="px-5 py-3.5 border-b border-border/60 bg-background">
        <h3 className="text-sm font-bold text-foreground tracking-tight">
          Active Jobs Overview
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-muted/40 border-b border-border/60">
              <th className="px-5 py-2.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Job Title
              </th>
              <th className="px-5 py-2.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Company
              </th>
              <th className="px-4 py-2.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-center">
                Applicants
              </th>
              <th className="px-4 py-2.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-center">
                Tested
              </th>
              <th className="px-4 py-2.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-center">
                Interview
              </th>
              <th className="px-4 py-2.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-center">
                Waiting Action
              </th>
              <th className="px-4 py-2.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-center">
                Shortlisted
              </th>
              <th className="px-5 py-2.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {jobs.map((job) => (
              <tr key={job.id} className="hover:bg-muted/30 transition-colors group">
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
                <td className="px-4 py-3 text-xs text-center text-foreground/80">
                  {job.tested_count}
                </td>
                <td className="px-4 py-3 text-xs text-center text-foreground/80">
                  {job.interview_count}
                </td>
                <td className="px-4 py-3 text-xs text-center text-foreground/80">
                  {job.waiting_action_count}
                </td>
                <td className="px-4 py-3 text-xs text-center text-foreground/80">
                  {job.shortlisted_count}
                </td>
                <td className="px-5 py-3 text-right">
                  <Link
                    to={`/companies/shortlists/${job.id}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-secondary-foreground bg-secondary border border-border/80 hover:bg-secondary/80 rounded-md transition-colors"
                  >
                    View ShortList
                    <ChevronRight className="w-3 h-3 text-muted-foreground" />
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