import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { useTranslation } from "react-i18next";
const STATUS_CONFIG = {
  passed: { label: "Passed", color: "#22c55e" },
  failed: { label: "Failed", color: "#ef4444" },
  in_progress: { label: "In Progress", color: "#3b82f6" },
};

function PieTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const total = payload[0].payload.total;
    const pct = total > 0 ? Math.round((payload[0].value / total) * 100) : 0;
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-md text-xs">
        <p className="font-semibold text-foreground">{payload[0].name}</p>
        <p className="text-accent">
          {payload[0].value} stage{payload[0].value !== 1 ? "s" : ""} ({pct}%)
        </p>
      </div>
    );
  }
  return null;
}

function BarTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-md text-xs">
        <p className="font-semibold text-foreground">
          {payload[0].payload.month}
        </p>
        <p className="text-accent">
          {payload[0].value} application{payload[0].value !== 1 ? "s" : ""}
        </p>
      </div>
    );
  }
  return null;
}

export default function ChartsSection({ applications }) {
  const { t } = useTranslation();
  const stageStatusData = useMemo(() => {
    if (!applications) return [];
    const counts = { passed: 0, failed: 0, in_progress: 0 };
    applications.forEach((app) => {
      const stages = app.application_stages || [];
      const currentStageId = app.current_stage_id;
      stages.forEach((s) => {
        if (s.score != null) {
          const threshold =
            s.recruitment_stages?.min_score ??
            s.recruitment_stages?.pass_score ??
            55;
          if (s.score >= threshold) counts.passed++;
          else counts.failed++;
        } else if (s.stage_id === currentStageId) {
          counts.in_progress++;
        }
      });
    });
    const total = counts.passed + counts.failed + counts.in_progress;
    return Object.entries(counts)
      .filter(([_, v]) => v > 0)
      .map(([key, value]) => ({
        name: STATUS_CONFIG[key]?.label || key,
        value,
        color: STATUS_CONFIG[key]?.color || "#6b7280",
        total,
      }));
  }, [applications]);

  const timelineData = useMemo(() => {
    if (!applications) return [];
    const months = {};
    applications
      .filter((app) => app.applied_at)
      .forEach((app) => {
        const d = new Date(app.applied_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        months[key] = (months[key] || 0) + 1;
      });
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => {
        const [y, m] = month.split("-");
        const date = new Date(+y, +m - 1);
        return {
          month: date.toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          }),
          applications: count,
        };
      });
  }, [applications]);

  if (!applications || applications.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Stage Status Distribution */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-bold text-foreground m-0">
            {t("analytics_charts.stage_status_breakdown")}
          </h3>
        </div>
        <div className="p-4">
          {stageStatusData.length === 0 ? (
            <p className="text-xs text-accent text-center py-6">
               {t("analytics_charts.no_stage_data")}
            </p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={210}>
                <PieChart>
                  <Pie
                    data={stageStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {stageStatusData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-1 justify-center">
                {stageStatusData.map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <span
                      className="size-2.5 rounded-full shrink-0"
                      style={{ background: item.color }}
                    />
                    <span className="text-[11px] text-accent">
                      {item.name} ({item.value})
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Applications Over Time */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-bold text-foreground m-0">
           {t("analytics_charts.applications_over_time")}
          </h3>
        </div>
        <div className="p-4">
          {timelineData.length === 0 ? (
            <p className="text-xs text-accent text-center py-6">
             {t("analytics_charts.no_data")}
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart
                data={timelineData}
                margin={{ top: 5, right: 10, left: -15, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "var(--color-accent)" }}
                  axisLine={{ stroke: "var(--color-border)" }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "var(--color-accent)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<BarTooltip />} />
                <Bar
                  dataKey="applications"
                  radius={[4, 4, 0, 0]}
                  fill="#01497c"
                  maxBarSize={36}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
