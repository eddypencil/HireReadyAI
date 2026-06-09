// src/features/recruiter/components/DashboardCharts.jsx
import React from "react";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTranslation } from "react-i18next";

export default function DashboardCharts({
  pipelineSummaryData,
  trendData,
  topJobsData,
}) {
  const { t } = useTranslation();

  const calcPct = (val) => {
    if (!pipelineSummaryData || pipelineSummaryData.applied === 0) return 0;
    return Math.round((val / pipelineSummaryData.applied) * 100);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6 font-sans">
      {/* ── Pipeline Summary Component ────────────────────────────────────────── */}
      <div className="bg-surface border border-border rounded-xl shadow-xs p-5 col-span-1 lg:col-span-2 xl:col-span-1">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-base font-bold text-foreground tracking-tight font-display">
              {t("dashboard_charts.pipeline_summary.title")}
            </h3>
            <p className="text-xs text-muted-foreground">
              {t("dashboard_charts.pipeline_summary.subtitle")}
            </p>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-primary bg-primary/10 border border-primary/20">
            {t("dashboard_charts.pipeline_summary.live")}
          </span>
        </div>

        {pipelineSummaryData && (
          <div className="flex gap-2 mb-6">
            {[
              {
                label: t("dashboard_charts.pipeline_summary.stages.applied"),
                value: pipelineSummaryData.applied,
                pct: 100,
              },
              {
                label: t("dashboard_charts.pipeline_summary.stages.screened"),
                value: pipelineSummaryData.screened,
                pct: calcPct(pipelineSummaryData.screened),
              },
              {
                label: t("dashboard_charts.pipeline_summary.stages.testing"),
                value: pipelineSummaryData.testing,
                pct: calcPct(pipelineSummaryData.testing),
              },
              {
                label: t("dashboard_charts.pipeline_summary.stages.interviewed"),
                value: pipelineSummaryData.interviewed,
                pct: calcPct(pipelineSummaryData.interviewed),
              },
              {
                label: t("dashboard_charts.pipeline_summary.stages.shortlisted"),
                value: pipelineSummaryData.shortlisted,
                pct: calcPct(pipelineSummaryData.shortlisted),
              },
            ].map((stage, idx) => (
              <div key={idx} className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className="text-[10px] font-medium text-muted-foreground truncate">
                    {stage.label}
                  </span>
                  {idx > 0 && (
                    <span className="text-[10px] font-bold text-foreground">
                      {stage.pct}%
                    </span>
                  )}
                </div>
                <span className="text-lg font-bold text-foreground mb-1.5 tracking-tight">
                  {stage.value}
                </span>
                <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${stage.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Trend Area Chart */}
        <div className="h-[180px] -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={trendData}
              margin={{ top: 5, right: 10, left: -25, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-primary)"
                    stopOpacity={0.2}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-primary)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--color-border)"
                opacity={0.5}
              />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 10, fontWeight: 500 }}
                dy={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 10, fontWeight: 500 }}
                tickCount={4}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-surface)",
                  borderRadius: "12px",
                  border: "1px solid var(--color-border)",
                  boxShadow: "var(--shadow-xs)",
                  fontSize: "11px",
                  color: "var(--color-foreground)",
                }}
              />
              <Area
                type="monotone"
                dataKey="applications"
                stroke="var(--color-primary)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorApps)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl shadow-xs p-5">
        <div className="mb-4">
          <h3 className="text-base font-bold text-foreground tracking-tight font-display">
            {t("dashboard_charts.top_jobs.title")}
          </h3>
          <p className="text-xs text-muted-foreground">
            {t("dashboard_charts.top_jobs.subtitle")}
          </p>
        </div>
        <div className="h-[210px] -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={topJobsData}
              margin={{ top: 5, right: 10, left: -25, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--color-border)"
                opacity={0.5}
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 10, fontWeight: 500 }}
                dy={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 10, fontWeight: 500 }}
                tickCount={4}
              />
              <Tooltip
                cursor={{ fill: "var(--color-muted)", opacity: 0.15 }}
                contentStyle={{
                  backgroundColor: "var(--color-surface)",
                  borderRadius: "12px",
                  border: "1px solid var(--color-border)",
                  boxShadow: "var(--shadow-xs)",
                  fontSize: "11px",
                  color: "var(--color-foreground)",
                }}
              />
              <Bar
                dataKey="applicants"
                fill="var(--color-primary)"
                opacity={0.85}
                radius={[4, 4, 0, 0]}
                barSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}