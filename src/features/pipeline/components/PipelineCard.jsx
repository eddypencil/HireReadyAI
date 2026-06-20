//src\features\pipeline\components\PipelineCard.jsx
import React from "react";
import { Link } from "react-router-dom";
import { GitBranch } from "lucide-react";
import { useTranslation } from "react-i18next";

const SENIORITY_COLORS = {
  intern: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  junior: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  mid: "bg-primary/10 text-primary dark:text-primary-hover",
  senior: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  lead: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
};

export default function PipelineCard({ pipeline }) {
  const stages = pipeline.recruitment_stages || [];
  const stageCount = stages.length;
  const previewStages = stages.slice(0, 4);
  const overflow = stageCount - 4;
  const { t } = useTranslation();

  const createdDate = new Date(pipeline.created_at).toLocaleDateString(
    "en-US",
    { month: "short", day: "numeric", year: "numeric" },
  );

  const seniorityColor =
    SENIORITY_COLORS[pipeline.seniority_level] || "bg-muted text-muted-foreground";

  return (
    <Link
      to={`/companies/pipelines/${pipeline.id}`}
      className="block bg-surface rounded-xl border border-border/70 p-6 hover:shadow-md hover:border-primary/50 transition-all duration-200 group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
          <GitBranch className="w-4 h-4 text-primary" />
        </div>
        {pipeline.seniority_level && (
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${seniorityColor}`}
          >
            {pipeline.seniority_level}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="font-bold text-foreground text-base mb-1 group-hover:text-primary transition-colors leading-snug">
        {pipeline.title}
      </h3>
      <p className="text-xs text-muted-foreground mb-4">
        {t("pipeline_builder.created")} {createdDate}
      </p>

      {/* Stage Preview */}
      {stageCount > 0 ? (
        <div className="flex flex-wrap items-center gap-1.5 mb-4">
          {previewStages.map((stage, idx) => (
            <React.Fragment key={stage.id}>
              <span className="text-xs text-foreground bg-muted border border-border/60 rounded px-2 py-0.5 truncate max-w-[90px]">
                {stage.name}
              </span>
              {idx < previewStages.length - 1 || overflow > 0 ? (
                <span className="text-border text-xs">→</span>
              ) : null}
            </React.Fragment>
          ))}
          {overflow > 0 && (
            <span className="text-xs font-semibold text-primary bg-primary/10 border border-primary/20 rounded px-2 py-0.5">
              +{overflow}
            </span>
          )}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground italic mb-4">
          {t("pipeline_builder.empty.title")}
        </p>
      )}

      {/* Footer */}
      <div className="text-xs text-muted-foreground font-semibold">
        {stageCount} {stageCount === 1 ? "stage" : "stages"}
      </div>
    </Link>
  );
}