import { FileText } from "lucide-react";
import ScoreRing from "./ScoreRing";
import { useTranslation } from "react-i18next";
function getInitials(name = "") {
  return (
    (name || "")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?"
  );
}

export default function CandidateHeader({ app, percentile, percentileTag }) {
  if (!app) return null;
  const { t } = useTranslation();
  const candidate = app.profiles || {};
  const job = app.job_postings;
  const isRejected =
    app.current_stage === "rejected" || app.is_rejected === true;
  const allStages = (app.application_stages || [])
    .filter((s) => s.recruitment_stages)
    .sort(
      (a, b) =>
        (a.recruitment_stages.order_index || 0) -
        (b.recruitment_stages.order_index || 0),
    );
  const scoredStages = allStages.filter((s) => s.score != null);
  const computedComposite =
    scoredStages.length > 0
      ? Math.round(
          scoredStages.reduce((sum, s) => sum + Number(s.score), 0) /
            scoredStages.length,
        )
      : (app?.composite_score ?? null);

  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-sm mb-6">
      <div className="flex items-start gap-5">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#2a6f97] to-[#012a4a] flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-xl">
            {getInitials(candidate.full_name || job?.title)}
          </span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-foreground">
              {candidate.full_name || job?.title || "Unknown"}
            </h1>
            {isRejected && (
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-destructive/10 text-destructive border border-destructive/20">
                {t("candidate.status.rejected")}
              </span>
            )}
            {!isRejected && app?.current_stage === "hired" && (
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-success/10 text-success border border-success/20">
                {t("candidate.status.hired")}
              </span>
            )}
            {!isRejected &&
              (app?.current_stage === "offer" ||
                app?.current_recruitment_stage?.stage_type === "offer") && (
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                {t("candidate.status.offer")}
              </span>
            )}
          </div>
          {candidate.headline && (
            <p className="text-sm text-muted-foreground mt-1">
              {candidate.headline}
            </p>
          )}
          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground flex-wrap">
            {app?.answers?.info?.email && <span>{app.answers.info.email}</span>}
            {app?.answers?.info?.phone && <span>{app.answers.info.phone}</span>}
            {job?.title && (
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                {t("candidate.appliedFor")}:{" "}
                <strong className="text-foreground/80">{job.title}</strong>
              </span>
            )}
          </div>
        </div>
        <div className="shrink-0">
          <ScoreRing score={computedComposite} percentileTag={percentileTag} />
        </div>
      </div>
    </div>
  );
}
