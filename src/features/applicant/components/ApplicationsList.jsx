import { useNavigate } from "react-router-dom";
import { APPLICATION_STAGE } from "@/shared/constants/enums";

const stageConfig = {
  [APPLICATION_STAGE.applied]: {
    label: "Applied",
    color: "bg-blue-100 text-blue-700",
  },
  [APPLICATION_STAGE.screening]: {
    label: "Screening",
    color: "bg-yellow-100 text-yellow-700",
  },
  [APPLICATION_STAGE.shorListed]: {
    label: "Shortlisted",
    color: "bg-purple-100 text-purple-700",
  },
  [APPLICATION_STAGE.interview]: {
    label: "Interview",
    color: "bg-indigo-100 text-indigo-700",
  },
  [APPLICATION_STAGE.hired]: {
    label: "Hired",
    color: "bg-emerald-100 text-emerald-700",
  },
  [APPLICATION_STAGE.rejected]: {
    label: "Rejected",
    color: "bg-red-100 text-red-700",
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
    color: "bg-slate-100 text-slate-700",
  },
  [APPLICATION_STAGE.ai_screening]: {
    label: "AI Screening",
    color: "bg-purple-100 text-purple-700",
  },
  [APPLICATION_STAGE.assessment_test]: {
    label: "Assessment Test",
    color: "bg-indigo-100 text-indigo-700",
  },
  [APPLICATION_STAGE.coding_test]: {
    label: "Coding Test",
    color: "bg-blue-100 text-blue-700",
  },
  [APPLICATION_STAGE.video_interview]: {
    label: "Video Interview",
    color: "bg-cyan-100 text-cyan-700",
  },
  [APPLICATION_STAGE.technical_interview]: {
    label: "Technical Interview",
    color: "bg-indigo-100 text-indigo-700",
  },
  [APPLICATION_STAGE.hr_interview]: {
    label: "HR Interview",
    color: "bg-fuchsia-100 text-fuchsia-700",
  },
  [APPLICATION_STAGE.manager_interview]: {
    label: "Manager Interview",
    color: "bg-violet-100 text-violet-700",
  },
  [APPLICATION_STAGE.background_check]: {
    label: "Background Check",
    color: "bg-orange-100 text-orange-700",
  },
  [APPLICATION_STAGE.offer]: {
    label: "Offer",
    color: "bg-green-100 text-green-700",
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
      <div className="bg-white rounded-2xl border border-dark-amethyst-100 p-7 shadow-sm">
        <h2 className="text-base font-bold text-dark-amethyst-950">
          Active applications
        </h2>
        <p className="text-sm text-dark-amethyst-500 mt-2">
          No applications yet
        </p>
      </div>
    );
  }

  const getStageInfo = (app) => {
    if (!app.application_stages || !Array.isArray(app.application_stages))
      return { label: stageConfig[app.current_stage]?.label || app.current_stage, color: stageConfig[app.current_stage]?.color || "bg-gray-100 text-gray-700" };

    const sortedStages = [...app.application_stages].sort((a, b) => {
      const orderA = a.recruitment_stages?.order_index || 0;
      const orderB = b.recruitment_stages?.order_index || 0;
      return orderA - orderB;
    });

    // Check for rejected
    const isRejected = sortedStages.some((s) => s.status === "rejected");
    if (isRejected) {
      return { label: "Rejected", color: "bg-red-100 text-red-700" };
    }

    // Find the first non-completed stage (no score)
    const firstNonCompleted = sortedStages.find((s) => !s.score);

    if (firstNonCompleted) {
      const type = firstNonCompleted.recruitment_stages?.stage_type;
      const name = firstNonCompleted.recruitment_stages?.name;

      // Check if previous stage has score (meaning current is waiting)
      const idx = sortedStages.indexOf(firstNonCompleted);
      const prevHasScore = idx > 0 && sortedStages[idx - 1]?.score;

      if (prevHasScore) {
        return {
          label: name || "Processing",
          color: stageConfig[type]?.color || "bg-amber-100 text-amber-700",
          waiting: true,
        };
      }

      // This stage is currently active (in_progress or first pending)
      return {
        label: name || "Processing",
        color: stageConfig[type]?.color || "bg-indigo-100 text-indigo-700",
      };
    }

    // All stages have scores — use the last stage
    const lastStage = sortedStages[sortedStages.length - 1];
    if (lastStage) {
      const lastType = lastStage.recruitment_stages?.stage_type;
      const lastName = lastStage.recruitment_stages?.name;
      return {
        label: lastName || "Completed",
        color: stageConfig[lastType]?.color || "bg-emerald-100 text-emerald-700",
      };
    }

    return { label: stageConfig[app.current_stage]?.label || app.current_stage, color: stageConfig[app.current_stage]?.color || "bg-gray-100 text-gray-700" };
  };

  const showViewAll = applications.length > 3;

  return (
    <div className="bg-white rounded-2xl border border-dark-amethyst-100 p-7 space-y-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-dark-amethyst-950">
          Active applications
        </h2>

        {showViewAll && (
          <button
            onClick={() => navigate("/applications")}
            className="text-sm font-medium text-dark-amethyst-600 hover:text-dark-amethyst-700 transition"
          >
            View all
          </button>
        )}
      </div>

      {/* List */}
      <div className="space-y-4">
        {applications.map((app) => {
          const job = app.job_postings;
          const company = job?.companies;
          const stageInfo = getStageInfo(app);

          return (
            <div
              key={app.id}
              className="p-4 rounded-xl border border-dark-amethyst-100 hover:bg-dark-amethyst-50 transition"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-dark-amethyst-800 truncate">
                      {job?.title || "Unknown Position"}
                    </h3>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`text-xs font-medium px-3 py-1 rounded-full border border-dark-amethyst-100 ${stageInfo.color}`}
                      >
                        {stageInfo.label}
                      </span>
                      {stageInfo.waiting && (
                        <span className="text-xs font-medium px-3 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                          Waiting
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-dark-amethyst-500 mt-1">
                    {company?.name || "Unknown Company"}
                  </p>

                  <div className="flex gap-3 mt-2 text-xs text-dark-amethyst-400">
                    <span>Applied {formatDate(app.applied_at)}</span>

                    {job?.closed_at && (
                      <span>Closes {formatDate(job.closed_at)}</span>
                    )}
                  </div>
                </div>

                {/* Open Button */}
                <button
                  onClick={() => navigate(`/jobs/${job?.id}`)}
                  className="text-sm font-medium text-dark-amethyst-600 border border-dark-amethyst-200 px-4 py-1.5 rounded-xl hover:bg-dark-amethyst-50 transition"
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
