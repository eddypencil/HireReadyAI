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

export default function DashboardCharts({ pipelineSummaryData, trendData, topJobsData }) {
  const calcPct = (val) => {
    if (!pipelineSummaryData || pipelineSummaryData.applied === 0) return 0;
    return Math.round((val / pipelineSummaryData.applied) * 100);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6 font-sans">
      {/* Pipeline Summary Component */}
      <div className="bg-background border border-border/60 rounded-xl shadow-xs p-5 col-span-1 lg:col-span-2 xl:col-span-1">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-base font-bold text-foreground tracking-tight">
              Pipeline summary
            </h3>
            <p className="text-xs text-muted-foreground">
              Across all active roles · last 7 days
            </p>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-primary bg-primary/10 border border-primary/20">
            Live
          </span>
        </div>

        {pipelineSummaryData && (
          <div className="flex gap-2 mb-6">
            {[
              { label: "Applied", value: pipelineSummaryData.applied, pct: 100 },
              { label: "Screened", value: pipelineSummaryData.screened, pct: calcPct(pipelineSummaryData.screened) },
              { label: "Testing", value: pipelineSummaryData.testing, pct: calcPct(pipelineSummaryData.testing) },
              { label: "Interviewed", value: pipelineSummaryData.interviewed, pct: calcPct(pipelineSummaryData.interviewed) },
              { label: "Shortlisted", value: pipelineSummaryData.shortlisted, pct: calcPct(pipelineSummaryData.shortlisted) },
            ].map((stage, idx) => (
              <div key={idx} className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className="text-[10px] font-medium text-muted-foreground truncate">{stage.label}</span>
                  {idx > 0 && <span className="text-[10px] font-bold text-foreground">{stage.pct}%</span>}
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
            <AreaChart data={trendData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.4} />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 10, fontWeight: 500 }}
                dy={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 10, fontWeight: 500 }}
                tickCount={4}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--background)',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow-xs)',
                  fontSize: '11px',
                  color: 'var(--foreground)'
                }}
              />
              <Area
                type="monotone"
                dataKey="applications"
                stroke="var(--primary)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorApps)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Jobs Chart */}
      <div className="bg-background border border-border/60 rounded-xl shadow-xs p-5">
        <div className="mb-4">
          <h3 className="text-base font-bold text-foreground tracking-tight">
            Top Jobs by Applicants
          </h3>
          <p className="text-xs text-muted-foreground">
            Most active job postings
          </p>
        </div>
        <div className="h-[210px] -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={topJobsData}
              margin={{ top: 5, right: 10, left: -25, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.4} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 10, fontWeight: 500 }}
                dy={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 10, fontWeight: 500 }}
                tickCount={4}
              />
              <Tooltip
                cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
                contentStyle={{
                  backgroundColor: 'var(--background)',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow-xs)',
                  fontSize: '11px',
                  color: 'var(--foreground)'
                }}
              />
              <Bar dataKey="applicants" fill="var(--primary)" opacity={0.85} radius={[4, 4, 0, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}