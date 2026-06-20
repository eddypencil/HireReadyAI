import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { APPLICATION_STAGE } from "@/shared/constants/enums";
import { useTranslation } from "react-i18next";
import { ChevronDown, ChevronUp, AlertCircle } from "lucide-react";

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function StatsCards({ applications }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showRejected, setShowRejected] = useState(false);

  const rejectedApps = (applications || []).filter(
    (a) =>
      a.current_stage === APPLICATION_STAGE.rejected || a.is_rejected === true,
  );

  const interviewCount = useMemo(() => {
    if (!applications) return 0;
    const excluded = ["cv_review", "shortlist", "offer"];
    let count = 0;
    applications.forEach((app) => {
      (app.application_stages || []).forEach((s) => {
        const type = s.recruitment_stages?.stage_type;
        if (s.score != null && type && !excluded.includes(type)) {
          count++;
        }
      });
    });
    return count;
  }, [applications]);

  const offerCount = useMemo(() => {
    if (!applications) return 0;
    return applications.filter((app) => {
      if (app.current_recruitment_stage?.stage_type === "offer") return true;
      if (
        app.current_stage_id &&
        (app.application_stages || []).some(
          (s) =>
            s.stage_id === app.current_stage_id &&
            s.recruitment_stages?.stage_type === "offer",
        )
      )
        return true;
      if (app.current_stage === APPLICATION_STAGE.offer) return true;
      return false;
    }).length;
  }, [applications]);

  const stats = [
    {
      label: t("applicant_dashboard.stats.applications"),
      value: applications?.length || 0,
    },
    {
      label: t("applicant_dashboard.stats.interviews"),
      value: interviewCount,
    },
    {
      label: t("applicant_dashboard.stats.offers"),
      value: offerCount,
    },
    {
      label: "Rejected",
      value: rejectedApps.length,
      isRejected: true,
    },
  ];

  return (
    <>
      <div className={`flex flex-col ${showRejected ? "gap-3" : "gap-0"}`}>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {stats.map((s, idx) => (
            <div
              key={s.label}
              onClick={
                s.isRejected ? () => setShowRejected(!showRejected) : undefined
              }
              className={`bg-card rounded-xl px-4 py-3 shadow-sm relative overflow-hidden transition-all duration-200 ${
                s.isRejected
                  ? "cursor-pointer hover:shadow-[0_4px_12px_rgba(185,28,28,0.12)]"
                  : "cursor-default"
              } ${s.isRejected && showRejected ? "border border-destructive" : "border border-border"}`}
            >
              <p
                className={`text-xs font-semibold m-0 mb-0.5 tracking-wide ${s.isRejected ? "text-destructive" : "text-accent"}`}
              >
                {s.label}
              </p>
              <div className="flex items-center gap-2">
                <h2
                  className={`text-2xl font-bold m-0 leading-none ${idx === 2 ? "text-success" : idx === 3 ? "text-destructive" : "text-primary"}`}
                >
                  {s.value}
                </h2>
                {s.isRejected && s.value > 0 && (
                  <span
                    className="text-destructive transition-transform duration-200"
                    style={{
                      transform: showRejected ? "rotate(180deg)" : "none",
                    }}
                  >
                    {showRejected ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Rejected applications list */}
        {showRejected && rejectedApps.length > 0 && (
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-3.5 border-b border-surface-muted flex items-center gap-2">
              <AlertCircle size={14} className="text-destructive" />
              <span className="text-[13px] font-semibold text-destructive">
                {t("rejected_applications")}
              </span>
            </div>
            {rejectedApps.map((app) => {
              const job = app.job_postings;
              const company = job?.companies;
              return (
                <div
                  key={app.id}
                  className="px-5 py-3 border-b border-surface-muted last:border-b-0 flex items-center justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="m-0 text-[13px] font-semibold text-foreground">
                      {job?.title || "Unknown Position"}
                    </p>
                    <p className="m-0 mt-0.5 text-[11px] text-accent">
                      <Link
                        to={`/company/${company?.id}`}
                        className="hover:underline"
                      >
                        {company?.name}
                      </Link>
                      {app.applied_at
                        ? ` · Applied ${formatDate(app.applied_at)}`
                        : ""}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      navigate(`/applicant/feedback?appId=${app.id}`)
                    }
                    className="shrink-0 px-3.5 py-1.5 bg-transparent border border-destructive rounded-lg text-destructive text-xs font-semibold cursor-pointer transition-all duration-150 hover:bg-destructive hover:text-white"
                  >
                    {t("show_feedback")}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
