import { useState } from "react";
import { ChevronDown, ChevronUp, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  getInitials,
  timeAgo,
  scoreColor,
  getFit,
  stageScore,
  statusStyle,
  statusLabel,
} from "./pipelineHelpers";

export default function CandidateCard({
  candidate,
  onDragStart,
  isDragging,
  onClick,
  allStages,
}) {
  const [expanded, setExpanded] = useState(false);
  const { t } = useTranslation();
  const fit = getFit(candidate.score, candidate.is_rejected, t);

  const currentStage = allStages?.find(
    (s) => s.id === candidate.currentStageId,
  );
  const isOfferStage = currentStage?.stage_type === "offer";

  const currentStageOrder = currentStage?.order_index ?? Infinity;

  const previousStages = (candidate.stagesData || [])
    .filter((as) => {
      const order = as.recruitment_stages?.order_index ?? Infinity;
      return order < currentStageOrder;
    })
    .sort(
      (a, b) =>
        (a.recruitment_stages?.order_index ?? 0) -
        (b.recruitment_stages?.order_index ?? 0),
    );

  return (
    <div
      draggable
      onDragStart={() => onDragStart(candidate)}
      className={`bg-surface rounded-2xl border border-border/80 p-4 cursor-grab active:cursor-grabbing select-none flex flex-col justify-between min-h-[165px] transition-all duration-200 hover:shadow-md dark:hover:shadow-neutral-950/50 hover:-translate-y-0.5 group ${isDragging ? "opacity-40 scale-95" : ""}`}
      onClick={onClick}
    >
      <div className="flex flex-col flex-1 justify-between">
        <div className="flex items-start gap-3 mb-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-xs shrink-0 font-display shadow-xs">
            {" "}
            {getInitials(candidate.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-foreground truncate font-display leading-snug group-hover:text-primary transition-colors">
              {candidate.name}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">
              {timeAgo(candidate.applied_at)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 mb-3">
          {candidate.hasEvaluation ? (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border tracking-wide uppercase ${fit.cls}`}
            >
              {fit.label}
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border bg-warning/10 text-warning border-warning/20 tracking-wide uppercase">
              In Progress
            </span>
          )}

          {candidate.is_rejected && !candidate.hasEvaluation && (
            <span className="text-[10px] px-2 py-0.5 rounded bg-destructive/10 text-destructive border border-destructive/20 font-medium uppercase tracking-wide">
              {t("candidate_pipeline.fit.rejected")}
            </span>
          )}

          {isOfferStage ? (
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-success/10 text-success border border-success/20 shrink-0">
              <Check className="w-3.5 h-3.5" />
            </span>
          ) : (
            <span
              className={`px-2 py-0.5 rounded-lg text-[11px] font-bold font-display tracking-tight shrink-0 ${candidate.hasEvaluation ? scoreColor(candidate.score) : "bg-muted text-muted-foreground border border-border"}`}
            >
              {candidate.hasEvaluation ? candidate.score : "-/100"}
            </span>
          )}
        </div>

        {isOfferStage ? (
          <div className="mb-1 w-full flex items-center gap-2 px-2 py-1.5 rounded-lg bg-success/10 border border-success/20 text-success">
            <Check className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[11px] font-bold">Offer Extended</span>
          </div>
        ) : (
          <div className="mb-1 w-full">
            <div className="flex items-center justify-between mb-1 text-[11px] font-medium text-muted-foreground">
              <span>Stage score</span>
              <span className="font-bold text-foreground">
                {candidate.hasEvaluation ? `${candidate.score}/100` : "-/100"}
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-muted border border-border/30 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  candidate.score >= 85
                    ? "bg-success"
                    : candidate.score >= 70
                      ? "bg-primary"
                      : candidate.score >= 55
                        ? "bg-warning"
                        : "bg-destructive"
                }`}
                style={{ width: `${candidate.score || 0}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {previousStages.length > 0 ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded((s) => !s);
          }}
          className="w-full flex items-center justify-center gap-1 pt-2.5 mt-2 text-[10px] sm:text-xs md:text-sm font-bold text-muted-foreground hover:text-primary border-t border-border/40 transition-colors cursor-pointer shrink-0"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-3 h-3" />
              Hide previous stages
            </>
          ) : (
            <>
              <ChevronDown className="w-3 h-3" />
              {previousStages.length} previous stage
              {previousStages.length > 1 ? "s" : ""}
            </>
          )}
        </button>
      ) : (
        <div
          className="h-6 w-full invisible border-t border-transparent mt-2"
          aria-hidden="true"
        />
      )}

      {expanded && previousStages.length > 0 && (
        <div className="mt-2 pt-2 border-t border-border/50 space-y-1.5 w-full animate-fade-in">
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
            Previous stages
          </p>
          {previousStages.map((as) => {
            const ss = stageScore(as);
            const name = as.recruitment_stages?.name || "Unknown";
            return (
              <div
                key={as.id}
                className="flex items-center justify-between py-1 px-2 rounded-lg bg-muted/40 border border-border/40"
              >
                <span className="text-[11px] font-medium text-foreground truncate max-w-[110px]">
                  {name}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {ss != null && (
                    <span
                      className={`text-[10px] font-bold px-1 py-0.2 rounded ${scoreColor(ss)}`}
                    >
                      {ss}
                    </span>
                  )}
                  <span
                    className={`text-[9px] font-bold px-1 py-0.2 rounded border uppercase tracking-tight ${statusStyle(as.status)}`}
                  >
                    {statusLabel(as.status)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
