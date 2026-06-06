import { useNavigate } from "react-router-dom";
import { APPLICATION_STAGE } from "@/shared/constants/enums";

const stageConfig = {
  [APPLICATION_STAGE.applied]: {
    label: "Applied",
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  [APPLICATION_STAGE.screening]: {
    label: "Screening",
    color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
  [APPLICATION_STAGE.shorListed]: {
    label: "Shortlisted",
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  },
  [APPLICATION_STAGE.interview]: {
    label: "Interview",
    color: "bg-accent/10 text-accent border-accent/20",
  },
  [APPLICATION_STAGE.hired]: {
    label: "Hired",
    color: "bg-green-500/10 text-green-600 border-green-500/20",
  },
  [APPLICATION_STAGE.rejected]: {
    label: "Rejected",
    color: "bg-destructive/10 text-destructive border-destructive/20",
  },
  [APPLICATION_STAGE.cv_screening]: {
    label: "CV Screening",
    color: "bg-secondary text-muted-foreground border-border",
  },
  [APPLICATION_STAGE.ai_screening]: {
    label: "AI Screening",
    color: "bg-accent/10 text-accent border-accent/20",
  },
  [APPLICATION_STAGE.assessment_test]: {
    label: "Assessment Test",
    color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
  },
  [APPLICATION_STAGE.coding_test]: {
    label: "Coding Test",
    color: "bg-sky-500/10 text-sky-600 border-sky-500/20",
  },
  [APPLICATION_STAGE.video_interview]: {
    label: "Video Interview",
    color: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
  },
  [APPLICATION_STAGE.technical_interview]: {
    label: "Technical Interview",
    color: "bg-accent/10 text-accent border-accent/20",
  },
  [APPLICATION_STAGE.hr_interview]: {
    label: "HR Interview",
    color: "bg-pink-500/10 text-pink-600 border-pink-500/20",
  },
  [APPLICATION_STAGE.manager_interview]: {
    label: "Manager Interview",
    color: "bg-violet-500/10 text-violet-600 border-violet-500/20",
  },
  [APPLICATION_STAGE.background_check]: {
    label: "Background Check",
    color: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  },
  [APPLICATION_STAGE.offer]: {
    label: "Offer",
    color: "bg-green-500/10 text-green-600 border-green-500/20",
  },
};

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function ApplicationsList({ applications }) {
  const navigate = useNavigate();

  if (!applications || applications.length === 0) {
    return (
      <div className="bg-background rounded-2xl border border-border p-7 shadow-xs">
        <h2 className="text-base font-bold text-sidebar">
          Active applications
        </h2>
        <p className="text-sm text-muted-foreground mt-2">
          No applications yet
        </p>
      </div>
    );
  }

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

  const showViewAll = applications.length > 3;

  return (
    <div className="bg-background rounded-2xl border border-border p-7 space-y-5 shadow-xs">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-sidebar">
          Active applications
        </h2>

        {showViewAll && (
          <button
            onClick={() => navigate("/applications")}
            className="text-sm font-medium text-muted-foreground hover:text-accent transition-colors cursor-pointer"
          >
            View all
          </button>
        )}
      </div>

      <div className="space-y-4">
        {applications.map((app) => {
          const job = app.job_postings;
          const company = job?.companies;
          const activeStage = getActiveStage(app);

          let displayLabel = app.current_stage;
          let displayColor =
            stageConfig[app.current_stage]?.color ||
            "bg-secondary text-muted-foreground border-border";

          if (activeStage) {
            const type = activeStage.recruitment_stages?.stage_type;
            displayLabel = activeStage.recruitment_stages?.name || "Processing";
            displayColor =
              stageConfig[type]?.color ||
              stageConfig[APPLICATION_STAGE.interview].color;
          } else if (stageConfig[app.current_stage]) {
            displayLabel = stageConfig[app.current_stage].label;
          }

          return (
            <div
              key={app.id}
              className="p-4 rounded-xl border border-border bg-background hover:bg-secondary/40 transition-all duration-200"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-sidebar truncate">
                      {job?.title || "Unknown Position"}
                    </h3>

                    <span
                      className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${displayColor}`}
                    >
                      {displayLabel}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground mt-1">
                    {company?.name || "Unknown Company"}
                  </p>

                  <div className="flex gap-3 mt-2 text-xs text-muted-foreground/60">
                    <span>Applied {formatDate(app.applied_at)}</span>

                    {job?.closed_at && (
                      <span>Closes {formatDate(job.closed_at)}</span>
                    )}
                  </div>
                </div>

                {/* Open Button */}
                <button
                  onClick={() => navigate(`/jobs/${job?.id}`)}
                  className="text-sm font-medium text-sidebar bg-background border border-border px-4 py-1.5 rounded-xl hover:bg-secondary hover:border-accent/40 transition-all duration-200 cursor-pointer"
                >
                  Open
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}