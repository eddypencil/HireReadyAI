import { Check, X, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ApplicationTimeline({ stages }) {
  const { t } = useTranslation();

  if (!stages || stages.length === 0) return null;

  return (
    <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
      <h2 className="text-sm font-bold text-foreground mb-5">
        {t("applicationTimeline.title")}
      </h2>

      <div className="relative">
        {stages.map((stage, i) => {
          const isPassed =
            stage.status === "passed" || stage.status === "completed";
          const isFailed = stage.status === "failed";
          const isInProgress = stage.status === "in_progress";
          const isLast = i === stages.length - 1;

          const dotColor = isPassed
            ? "bg-success border-success"
            : isFailed
              ? "bg-destructive border-destructive"
              : isInProgress
                ? "bg-accent border-accent"
                : "bg-muted-foreground/30 border-muted-foreground/30";

          const dotIcon = isPassed
            ? "text-white"
            : isFailed
              ? "text-white"
              : "hidden";

          const scoreColor =
            stage.score >= 80
              ? "bg-success/10 text-success"
              : stage.score >= 60
                ? "bg-accent/10 text-accent"
                : stage.score >= 40
                  ? "bg-amber-50 text-amber-700"
                  : "bg-destructive/10 text-destructive";

          const statusKey = stage.status || "pending";

          return (
            <div key={stage.id} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 ${dotColor}`}
                >
                  {isPassed ? (
                    <Check size={13} className={dotIcon} />
                  ) : isFailed ? (
                    <X size={13} className={dotIcon} />
                  ) : (
                    <Clock size={12} className="text-muted-foreground/60" />
                  )}
                </div>
                {!isLast && (
                  <div className="w-0.5 h-full min-h-[24px] bg-border" />
                )}
              </div>

              <div className="pb-6 flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {stage.recruitment_stages?.name ||
                        t("applicationTimeline.unknown")}
                    </p>
                    <p className="text-[11px] text-muted-foreground capitalize">
                      {stage.recruitment_stages?.stage_type?.replace(
                        /_/g,
                        " ",
                      ) || ""}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {stage.score != null && (
                      <span
                        className={`px-2 py-0.5 rounded-md text-xs font-bold ${scoreColor}`}
                      >
                        {Math.round(stage.score)}
                      </span>
                    )}

                    <span
                      className={`text-[10px] font-semibold ${
                        isPassed
                          ? "text-success"
                          : isFailed
                            ? "text-destructive"
                            : isInProgress
                              ? "text-accent"
                              : "text-muted-foreground/60"
                      }`}
                    >
                      {isInProgress
                        ? t("applicationTimeline.inProgress")
                        : t(`applicationTimeline.status.${statusKey}`, {
                            defaultValue: t("applicationTimeline.pending"),
                          })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
