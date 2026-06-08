//src\features\jobs\components\JobFilters.jsx
import { SENIORITY_LEVEL } from "@/shared/constants/enums";
import { useTranslation } from "react-i18next";

export default function JobFilters({
  level,
  setLevel,
  jobType,
  setJobType,
  workLocation,
  setWorkLocation,
  datePosted,
  setDatePosted,
  salaryMin,
  setSalaryMin,
  salaryMax,
  setSalaryMax,
  onClear,
}) {
  const { t } = useTranslation();

  return (
    <div className="bg-background rounded-xl border border-border p-4 space-y-4 sticky top-4 h-fit max-h-[calc(100vh-2rem)] overflow-y-auto">

      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-border">
        <h3 className="text-sm font-bold text-foreground">Filter</h3>
        <button
          onClick={onClear}
          className="text-xs text-muted-foreground hover:text-foreground hover:underline font-medium transition-colors"
        >
          {t("job_filters.clear_all")}
        </button>
      </div>

      {/* Date Posted */}      <div className="space-y-1.5">
        <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
          {t("job_filters.date_posted")}
        </h4>

        <select
          value={datePosted}
          onChange={(e) => setDatePosted(e.target.value)}
          className="w-full h-8 px-2 rounded-md text-xs text-foreground border border-border bg-muted/50 outline-none focus:ring-1 focus:ring-ring focus:bg-background transition cursor-pointer"
        >
          <option value="">{t("job_filters.anytime")}</option>
          <option value="24h">{t("job_filters.last_24h")}</option>
          <option value="week">{t("job_filters.last_week")}</option>
          <option value="month">{t("job_filters.last_month")}</option>
        </select>
      </div>

      {/* Salary */}
      <div className="space-y-1.5">
        <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
          {t("job_filters.salary")}
        </h4>

        <div className="flex items-center gap-1.5">
          <input
            type="number"
            value={salaryMin}
            onChange={(e) => setSalaryMin(e.target.value)}
            placeholder={t("job_filters.min")}
            className="w-full h-8 px-2 rounded-md text-xs text-foreground border border-border bg-muted/50 outline-none focus:ring-1 focus:ring-ring focus:bg-background transition placeholder:text-muted-foreground/60"
          />

          <span className="text-muted-foreground/50 text-xs shrink-0">
            {t("job_filters.to")}
          </span>

          <input
            type="number"
            value={salaryMax}
            onChange={(e) => setSalaryMax(e.target.value)}
            placeholder={t("job_filters.max")}
            className="w-full h-8 px-2 rounded-md text-xs text-foreground border border-border bg-muted/50 outline-none focus:ring-1 focus:ring-ring focus:bg-background transition placeholder:text-muted-foreground/60"
          />
        </div>
      </div>

      {/* Job Type */}      <div className="space-y-1.5">
        <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
          {t("job_filters.job_type")}
        </h4>

        <div className="space-y-1.5">
          {[
            { label: t("job_filters.full_time"), value: "full_time" },
            { label: t("job_filters.part_time"), value: "part_time" },
          ].map(({ label, value }) => (
            <label
              key={value}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={jobType === value}
                onChange={() => setJobType(jobType === value ? "" : value)}
                className="w-3.5 h-3.5 rounded border-border accent-primary cursor-pointer"
              />
              <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Work Location */}      <div className="space-y-1.5">
        <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
          {t("job_filters.work_location")}
        </h4>

        <div className="space-y-1.5">
          {[
            { label: t("job_filters.on_site"), value: "on_site" },
            { label: t("job_filters.remote"), value: "remote" },
            { label: t("job_filters.hybrid"), value: "hybrid" },
          ].map(({ label, value }) => (
            <label
              key={value}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={workLocation === value}
                onChange={() =>
                  setWorkLocation(workLocation === value ? "" : value)
                }
                className="w-3.5 h-3.5 rounded border-border accent-primary cursor-pointer"
              />
              <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Seniority */}      <div className="space-y-1.5">
        <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
          {t("job_filters.seniority")}
        </h4>

        <div className="space-y-1.5">
          {Object.values(SENIORITY_LEVEL).map((lvl) => (
            <label
              key={lvl}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={level === lvl}
                onChange={() => setLevel(level === lvl ? "" : lvl)}
                className="w-3.5 h-3.5 rounded border-border accent-primary cursor-pointer"
              />
              <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors capitalize">
                {lvl}
              </span>
            </label>
          ))}
        </div>
      </div>

    </div>
  );
}
