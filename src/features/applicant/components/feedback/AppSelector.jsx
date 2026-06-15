import { useTranslation } from "react-i18next";
export default function AppSelector({ applications, selectedId, onSelect }) {
  if (!applications || applications.length === 0) return null;
  const { t } = useTranslation();
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {applications.map((app) => {
        const job = app.job_postings;
        const sel = app.id === selectedId;
        const isRejected =
          app.current_stage === "rejected" || app.is_rejected === true;
        const isOffer =
          app.current_stage === "offer" ||
          app.current_recruitment_stage?.stage_type === "offer";

        const statusLabel = isRejected
          ? t("app_selector.rejected")
          : isOffer
            ? t("app_selector.offer")
            : t("app_selector.hired");

        const statusStyle = isRejected
          ? sel
            ? "bg-white/20 text-white"
            : "bg-destructive/10 text-destructive"
          : isOffer
            ? sel
              ? "bg-white/20 text-white"
              : "bg-amber-500/10 text-amber-600"
            : sel
              ? "bg-white/20 text-white"
              : "bg-success/10 text-success";

        return (
          <button
            key={app.id}
            onClick={() => onSelect(app.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold border transition-all whitespace-nowrap shrink-0 ${
              sel
                ? "bg-accent text-white border-accent shadow-sm"
                : "bg-card text-foreground/80 border-border hover:bg-surface-hover hover:border-accent/30"
            }`}
          >
            <span className="truncate max-w-[160px]">
              {job?.title || t("app_selector.unknown_job")}
            </span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${statusStyle}`}
            >
              {statusLabel}
            </span>
          </button>
        );
      })}
    </div>
  );
}
