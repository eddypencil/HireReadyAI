// src/features/applicant/components/ApplicationsList.jsx
import { useNavigate, Link } from "react-router-dom";
import { APPLICATION_STAGE } from "@/shared/constants/enums";
import {
  Briefcase,
  Clock,
  Calendar,
  ArrowUpRight,
  Layers,
} from "lucide-react";
import { useTranslation } from "react-i18next";

// Stage config with HireReadyAI pipeline colors
const stageConfig = {
  [APPLICATION_STAGE.applied]: {
    label: "Applied",
    bg: "rgba(137,194,217,0.15)",
    text: "#2c7da0",
    border: "rgba(137,194,217,0.4)",
    dot: "#89c2d9",
  },
  [APPLICATION_STAGE.screening]: {
    label: "Screening",
    bg: "rgba(97,165,194,0.15)",
    text: "#2a6f97",
    border: "rgba(97,165,194,0.4)",
    dot: "#61a5c2",
  },
  [APPLICATION_STAGE.shorListed]: {
    label: "Shortlisted",
    bg: "rgba(44,125,160,0.12)",
    text: "#01497c",
    border: "rgba(44,125,160,0.35)",
    dot: "#2c7da0",
  },
  [APPLICATION_STAGE.interview]: {
    label: "Interview",
    bg: "rgba(1,73,124,0.12)",
    text: "#01497c",
    border: "rgba(1,73,124,0.3)",
    dot: "#2c7da0",
  },
  [APPLICATION_STAGE.hired]: {
    label: "Hired",
    bg: "rgba(22,163,74,0.1)",
    text: "#15803d",
    border: "rgba(22,163,74,0.25)",
    dot: "#22c55e",
  },
  [APPLICATION_STAGE.rejected]: {
    label: "Rejected",
    bg: "rgba(185,28,28,0.08)",
    text: "#b91c1c",
    border: "rgba(185,28,28,0.2)",
    dot: "#ef4444",
  },
  cv_review: {
    label: "CV Review",
    color: "bg-slate-100 text-slate-700",
  },
  shortlist: {
    label: "Shortlisting",
    color: "bg-purple-100 text-purple-700",
  },
  [APPLICATION_STAGE.cv_screening]: {
    label: "CV Screening",
    bg: "rgba(42,111,151,0.1)",
    text: "#2a6f97",
    border: "rgba(42,111,151,0.25)",
    dot: "#2a6f97",
  },
  [APPLICATION_STAGE.ai_screening]: {
    label: "AI Screening",
    bg: "rgba(70,143,175,0.12)",
    text: "#01497c",
    border: "rgba(70,143,175,0.3)",
    dot: "#468faf",
  },
  [APPLICATION_STAGE.assessment_test]: {
    label: "Assessment Test",
    bg: "rgba(44,125,160,0.12)",
    text: "#2c7da0",
    border: "rgba(44,125,160,0.3)",
    dot: "#2c7da0",
  },
  [APPLICATION_STAGE.coding_test]: {
    label: "Coding Test",
    bg: "rgba(1,73,124,0.1)",
    text: "#01497c",
    border: "rgba(1,73,124,0.28)",
    dot: "#01497c",
  },
  [APPLICATION_STAGE.video_interview]: {
    label: "Video Interview",
    bg: "rgba(97,165,194,0.13)",
    text: "#2a6f97",
    border: "rgba(97,165,194,0.35)",
    dot: "#61a5c2",
  },
  [APPLICATION_STAGE.technical_interview]: {
    label: "Technical Interview",
    bg: "rgba(1,73,124,0.1)",
    text: "#01497c",
    border: "rgba(1,73,124,0.28)",
    dot: "#2c7da0",
  },
  [APPLICATION_STAGE.hr_interview]: {
    label: "HR Interview",
    bg: "rgba(70,143,175,0.12)",
    text: "#01497c",
    border: "rgba(70,143,175,0.3)",
    dot: "#468faf",
  },
  [APPLICATION_STAGE.manager_interview]: {
    label: "Manager Interview",
    bg: "rgba(42,111,151,0.12)",
    text: "#2a6f97",
    border: "rgba(42,111,151,0.3)",
    dot: "#2a6f97",
  },
  [APPLICATION_STAGE.background_check]: {
    label: "Background Check",
    bg: "rgba(234,179,8,0.1)",
    text: "#854d0e",
    border: "rgba(234,179,8,0.25)",
    dot: "#eab308",
  },
  [APPLICATION_STAGE.offer]: {
    label: "Offer",
    bg: "rgba(22,163,74,0.12)",
    text: "#15803d",
    border: "rgba(22,163,74,0.3)",
    dot: "#22c55e",
  },
};

const defaultStage = {
  label: "Processing",
  bg: "rgba(42,111,151,0.1)",
  text: "#2a6f97",
  border: "rgba(42,111,151,0.25)",
  dot: "#2a6f97",
};

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function StagePill({ label, config }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide whitespace-nowrap"
      style={{
        background: config.bg,
        color: config.text,
        border: `1px solid ${config.border}`,
      }}
    >
      <span
        className="size-1.5 rounded-full shrink-0"
        style={{ background: config.dot }}
      />
      {label}
    </span>
  );
}

export default function ApplicationsList({ applications }) {
  const navigate = useNavigate();

  const getActiveStage = (app) => {
    if (!app.application_stages || !Array.isArray(app.application_stages))
      return null;
    const sortedStages = [...app.application_stages].sort((a, b) => {
      const orderA = a.recruitment_stages?.order_index || 0;
      const orderB = b.recruitment_stages?.order_index || 0;
      return orderA - orderB;
    });
    const inProgressStage = sortedStages.find(
      (s) => s.status === "in_progress",
    );
    if (inProgressStage) return inProgressStage;
    return sortedStages.find((s) => s.status === "pending");
  };
  const { t } = useTranslation();
  const showViewAll = applications && applications.length > 3;

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      {/* Card Header */}
      <div className="px-5 py-4 pb-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-lg bg-surface-muted flex items-center justify-center text-primary">
            <Layers size={14} />
          </div>
          <div>
            <h2 className="font-sans text-sm font-bold text-foreground m-0 tracking-tight">
              {t("applications.title")}
            </h2>
            <p className="text-xs text-accent m-0 mt-0.5">
              {t("applications.subtitle")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {applications && applications.length > 0 && (
            <span className="bg-primary text-white rounded-full size-[22px] flex items-center justify-center text-[11px] font-bold">
              {applications.length}
            </span>
          )}

        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-3 pb-4">
        {!applications || applications.length === 0 ? (
          <div className="text-center py-7 text-accent">
            <Briefcase size={32} className="mx-auto mb-2.5 opacity-40" />
            <p className="text-[13px] m-0">
              {t("applications.empty")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {applications
              .slice(0, showViewAll ? 4 : applications.length)
              .map((app) => {
                const job = app.job_postings;
                const company = job?.companies;
                const activeStage = getActiveStage(app);

                let displayLabel = app.current_stage;
                let stageStyle = stageConfig[app.current_stage] || defaultStage;

                if (activeStage) {
                  const type = activeStage.recruitment_stages?.stage_type;
                  displayLabel =
                    activeStage.recruitment_stages?.name || "Processing";
                  stageStyle = stageConfig[type] || defaultStage;
                } else if (stageConfig[app.current_stage]) {
                  displayLabel = stageConfig[app.current_stage].label;
                }

                return (
                  <div
                    key={app.id}
                    className="bg-card border border-border rounded-xl p-3 cursor-pointer transition-all duration-[180ms] relative overflow-hidden hover:bg-surface-muted hover:border-stage-applied hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-12px_rgba(1,42,74,.18)]"
                  >
                    {/* Stage pill top-right */}
                    <div className="flex justify-between items-start mb-2.5">
                      <h3 className="font-sans text-[13px] font-bold text-foreground m-0 tracking-tight leading-tight flex-1 pr-2">
                        {job?.title || t("applications.unknown_position")}
                      </h3>
                      <StagePill label={displayLabel} config={stageStyle} />
                    </div>

                    {/* Company */}
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <Briefcase size={12} className="text-accent shrink-0" />
                      <span className="text-xs text-accent font-medium">
                      {company ? (
                        <Link to={`/company/${company.id}`} className="hover:underline">
                          {company.name}
                        </Link>
                      ) : (
                        t("applications.unknown_company")
                      )}
                    </span>
                    </div>

                    {/* Meta row */}
                    <div className="flex gap-3 flex-wrap border-t border-surface-muted pt-2">
                      <span className="flex items-center gap-1 text-[11px] text-accent">
                        <Clock size={10} />
                        {t("applications.applied", {
                          date: formatDate(app.applied_at),
                        })}
                      </span>
                      {job?.closed_at && (
                        <span className="flex items-center gap-1 text-[11px] text-accent">
                          <Calendar size={10} />
                          {t("applications.closes", {
                            date: formatDate(job.closed_at),
                          })}
                        </span>
                      )}
                    </div>

                    {/* Open button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/jobs/${job?.id}`);
                      }}
                      className="mt-2.5 w-full flex items-center justify-center gap-1.5 bg-transparent border border-border rounded-lg py-1.5 text-xs font-semibold text-primary cursor-pointer transition-all duration-150 hover:bg-primary hover:text-white hover:border-primary"
                    >
                      {t("applications.view_job")}
                      <ArrowUpRight size={12} />
                    </button>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
