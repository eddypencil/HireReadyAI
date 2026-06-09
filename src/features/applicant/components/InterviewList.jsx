// // src\features\applicant\components\InterviewList.jsx
// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { APPLICATION_STAGE } from "@/shared/constants/enums";

// const stageConfig = {
//     // General / Legacy
//     [APPLICATION_STAGE.interview]: { label: "Active Interview", color: "bg-indigo-100 text-indigo-700 border-indigo-300 font-bold animate-pulse" },
//     [APPLICATION_STAGE.shorListed]: { label: "Shortlisted", color: "bg-purple-100 text-purple-700 border-purple-200" },
//     [APPLICATION_STAGE.hired]: { label: "Hired / Completed", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
//     [APPLICATION_STAGE.rejected]: { label: "Rejected", color: "bg-red-100 text-red-700 border-red-200" },

//     // Pipeline Stages
//     [APPLICATION_STAGE.cv_screening]: { label: "CV Screening", color: "bg-slate-100 text-slate-700 border-slate-200" },
//     [APPLICATION_STAGE.ai_screening]: { label: "AI Screening", color: "bg-purple-100 text-purple-700 border-purple-200" },
//     [APPLICATION_STAGE.assessment_test]: { label: "Assessment Test", color: "bg-indigo-100 text-indigo-700 border-indigo-300 font-bold animate-pulse" },
//     [APPLICATION_STAGE.coding_test]: { label: "Coding Test", color: "bg-blue-100 text-blue-700 border-blue-300 font-bold animate-pulse" },
//     [APPLICATION_STAGE.video_interview]: { label: "Video Interview", color: "bg-cyan-100 text-cyan-700 border-cyan-300 font-bold animate-pulse" },
//     [APPLICATION_STAGE.technical_interview]: { label: "Technical Interview", color: "bg-indigo-100 text-indigo-700 border-indigo-300 font-bold animate-pulse" },
//     [APPLICATION_STAGE.hr_interview]: { label: "HR Interview", color: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-300 font-bold animate-pulse" },
//     [APPLICATION_STAGE.manager_interview]: { label: "Manager Interview", color: "bg-violet-100 text-violet-700 border-violet-300 font-bold animate-pulse" },
//     [APPLICATION_STAGE.background_check]: { label: "Background Check", color: "bg-orange-100 text-orange-700 border-orange-200" },
//     [APPLICATION_STAGE.offer]: { label: "Offer", color: "bg-green-100 text-green-700 border-green-200" },
// };

// const INTERVIEW_STAGE_TYPES = [
//     APPLICATION_STAGE.assessment_test,
//     APPLICATION_STAGE.coding_test,
//     APPLICATION_STAGE.video_interview,
//     APPLICATION_STAGE.technical_interview,
//     APPLICATION_STAGE.hr_interview,
//     APPLICATION_STAGE.manager_interview,
//     APPLICATION_STAGE.ai_screening,
// ];

// function formatDate(dateStr) {
//     if (!dateStr) return "";
//     return new Date(dateStr).toLocaleDateString("en-US", {
//         month: "short",
//         day: "numeric",
//     });
// }

// export default function InterviewList({ applications }) {
//     const navigate = useNavigate();
//     const [activeTab, setActiveTab] = useState("all_interviews");

//     // Helper to find an active interview stage
//     const getActiveInterviewStage = (app) => {
//         if (!app.application_stages || !Array.isArray(app.application_stages)) return null;

//         const sortedStages = [...app.application_stages].sort((a, b) => {
//             const orderA = a.recruitment_stages?.order_index || 0;
//             const orderB = b.recruitment_stages?.order_index || 0;
//             return orderA - orderB;
//         });

//         // in_progress takes precedence
//         let active = sortedStages.find(s => s.status === "in_progress" && INTERVIEW_STAGE_TYPES.includes(s.recruitment_stages?.stage_type));

//         // Otherwise, first pending
//         if (!active) {
//             active = sortedStages.find(s => s.status === "pending" && INTERVIEW_STAGE_TYPES.includes(s.recruitment_stages?.stage_type));
//         }

//         return active;
//     };

//     const interviewProcesses = applications?.filter((app) => {
//         const activeStage = getActiveInterviewStage(app);
//         return activeStage ||
//             app.current_stage === APPLICATION_STAGE.interview ||
//             app.current_stage === APPLICATION_STAGE.shortlisted ||
//             app.current_stage === APPLICATION_STAGE.hired ||
//             app.current_stage === APPLICATION_STAGE.rejected;
//     }) || [];

//     if (interviewProcesses.length === 0) {
//         return (
//             <div className="bg-white border border-gray-200 rounded-xl p-6 text-center shadow-sm">
//                 <h2 className="font-semibold text-gray-800 text-lg">Status Management</h2>
//                 <p className="text-sm text-gray-400 mt-1">No interview processes or status updates records found yet.</p>
//             </div>
//         );
//     }

//     const countAll = interviewProcesses.length;
//     const countInterviews = interviewProcesses.filter(app => getActiveInterviewStage(app) || app.current_stage === APPLICATION_STAGE.interview).length;
//     const countCompleted = interviewProcesses.filter(app => !getActiveInterviewStage(app) && app.current_stage === APPLICATION_STAGE.hired).length;
//     const countRejected = interviewProcesses.filter(app => !getActiveInterviewStage(app) && app.current_stage === APPLICATION_STAGE.rejected).length;

//     const filteredInterviews = interviewProcesses.filter((app) => {
//         const activeStage = getActiveInterviewStage(app);
//         if (activeTab === "all_interviews") return true;
//         if (activeTab === "interview") return activeStage || app.current_stage === APPLICATION_STAGE.interview;
//         if (activeTab === "completed") return !activeStage && app.current_stage === APPLICATION_STAGE.hired;
//         if (activeTab === "rejected") return !activeStage && app.current_stage === APPLICATION_STAGE.rejected;
//         return true;
//     });

//     return (
//         <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
//             <div>
//                 <h2 className="font-semibold text-gray-800 text-lg">Status Management</h2>
//                 <p className="text-sm text-gray-500 mt-0.5">Track your interview stages and process results</p>
//             </div>

//             <div className="flex flex-wrap gap-2 border-b border-gray-100 pb-4">
//                 <button
//                     onClick={() => setActiveTab("all_interviews")}
//                     className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${activeTab === "all_interviews" ? "bg-slate-900 text-white shadow-sm" : "bg-gray-50 text-gray-600 hover:bg-gray-100"}`}
//                 >
//                     All Processes - {countAll}
//                 </button>
//                 <button
//                     onClick={() => setActiveTab("interview")}
//                     className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${activeTab === "interview" ? "bg-indigo-600 text-white shadow-sm" : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"}`}
//                 >
//                     Active Interviews - {countInterviews}
//                 </button>
//                 <button
//                     onClick={() => setActiveTab("completed")}
//                     className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${activeTab === "completed" ? "bg-green-600 text-white shadow-sm" : "bg-green-50 text-green-600 hover:bg-green-100"}`}
//                 >
//                     Completed - {countCompleted}
//                 </button>
//                 <button
//                     onClick={() => setActiveTab("rejected")}
//                     className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${activeTab === "rejected" ? "bg-red-600 text-white shadow-sm" : "bg-red-50 text-red-600 hover:bg-red-100"}`}
//                 >
//                     Rejected - {countRejected}
//                 </button>
//             </div>

//             <div className="space-y-4">
//                 {filteredInterviews.length === 0 ? (
//                     <p className="text-sm text-gray-400 py-6 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
//                         No records found in this section.
//                     </p>
//                 ) : (
//                     filteredInterviews.map((app) => {
//                         const job = app.job_postings;
//                         const company = job?.companies;
//                         const activeStage = getActiveInterviewStage(app);
//                         const isInterviewActive = !!activeStage || app.current_stage === APPLICATION_STAGE.interview;

//                         let displayLabel = app.current_stage;
//                         let displayColor = stageConfig[app.current_stage]?.color || "bg-gray-100 text-gray-700";

//                         if (activeStage) {
//                             const type = activeStage.recruitment_stages?.stage_type;
//                             displayLabel = activeStage.recruitment_stages?.name || "Interview Stage";
//                             displayColor = stageConfig[type]?.color || stageConfig[APPLICATION_STAGE.interview].color;
//                         } else if (stageConfig[app.current_stage]) {
//                             displayLabel = stageConfig[app.current_stage].label;
//                         }

//                         return (
//                             <div
//                                 key={app.id}
//                                 className="bg-gray-50/60 border border-gray-100 rounded-xl p-5 shadow-xs hover:shadow-sm hover:border-violet-200 hover:bg-white transition-all duration-200 flex items-center justify-between flex-wrap gap-4"
//                             >
//                                 <div className="flex-1 min-w-0 space-y-1.5">
//                                     <div className="flex items-center gap-2 flex-wrap">
//                                         <h4 className="font-semibold text-gray-800 text-base tracking-tight">
//                                             {job?.title || "Unknown Position"}
//                                         </h4>
//                                         <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${displayColor}`}>
//                                             {displayLabel}
//                                         </span>
//                                     </div>

//                                     <p className="text-sm text-gray-600 font-medium">
//                                         {company?.name || "Unknown Company"}
//                                     </p>

//                                     <div className="flex items-center gap-3 text-xs text-gray-400">
//                                         <span className="bg-gray-200/70 px-2 py-0.5 rounded text-[11px] font-mono text-gray-500">
//                                             ID: {app.candidate_profile_id.substring(0, 8)}
//                                         </span>
//                                         <span className="w-1 h-1 rounded-full bg-gray-300"></span>
//                                         <span>Applied {formatDate(app.applied_at)}</span>
//                                     </div>
//                                 </div>

//                                 <div className="flex items-center gap-3 shrink-0">
//                                     {isInterviewActive && (
//                                         <button
//                                             onClick={() => navigate(`/interview/${app.id}`)}
//                                             className="bg-indigo-600 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs hover:bg-indigo-700 transition-all"
//                                         >
//                                             {activeStage ? `Start ${activeStage.recruitment_stages?.name}` : "Start AI Interview"}
//                                         </button>
//                                     )}
//                                     {app.cv_file_url && (
//                                         <a
//                                             href={app.cv_file_url}
//                                             target="_blank"
//                                             rel="noreferrer"
//                                             className="text-violet-600 text-xs font-semibold bg-white border border-gray-200 px-4 py-2 rounded-xl shadow-xs hover:border-violet-300 hover:bg-violet-50/50 transition-all"
//                                         >
//                                             View Submitted CV
//                                         </a>
//                                     )}
//                                 </div>
//                             </div>
//                         );
//                     })
//                 )}
//             </div>
//         </div>
//     );
// }
// src/features/applicant/components/InterviewList.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { APPLICATION_STAGE } from "@/shared/constants/enums";
import { useTranslation } from "react-i18next";
import { t } from "i18next";

const stageConfig = {
  [APPLICATION_STAGE.interview]: {
    labelKey: "stages.interview",
    bg: "rgba(1,73,124,0.1)",
    text: "#01497c",
    border: "rgba(1,73,124,0.25)",
    dot: "#2c7da0",
  },
  [[APPLICATION_STAGE.shortlisted]]: {
    labelKey: "stages.shortlisted",
    bg: "rgba(44,125,160,0.12)",
    text: "#01497c",
    border: "rgba(44,125,160,0.3)",
    dot: "#2c7da0",
  },
  [APPLICATION_STAGE.hired]: {
    labelKey: "stages.hired",
    bg: "rgba(22,163,74,0.1)",
    text: "#15803d",
    border: "rgba(22,163,74,0.25)",
    dot: "#22c55e",
  },
  [APPLICATION_STAGE.rejected]: {
    labelKey: "stages.rejected",
    bg: "rgba(185,28,28,0.08)",
    text: "#b91c1c",
    border: "rgba(185,28,28,0.2)",
    dot: "#ef4444",
  },
  [APPLICATION_STAGE.cv_screening]: {
    labelKey: "stages.cv_screening",
    bg: "rgba(42,111,151,0.1)",
    text: "#2a6f97",
    border: "rgba(42,111,151,0.25)",
    dot: "#2a6f97",
  },
  [APPLICATION_STAGE.ai_screening]: {
    labelKey: "stages.ai_screening",
    bg: "rgba(70,143,175,0.12)",
    text: "#01497c",
    border: "rgba(70,143,175,0.3)",
    dot: "#468faf",
  },
  [APPLICATION_STAGE.assessment_test]: {
    labelKey: "stages.assessment_test",
    bg: "rgba(44,125,160,0.12)",
    text: "#2c7da0",
    border: "rgba(44,125,160,0.3)",
    dot: "#2c7da0",
  },
  [APPLICATION_STAGE.coding_test]: {
    labelKey: "stages.coding_test",
    bg: "rgba(1,73,124,0.1)",
    text: "#01497c",
    border: "rgba(1,73,124,0.28)",
    dot: "#01497c",
  },
  [APPLICATION_STAGE.video_interview]: {
    labelKey: "stages.video_interview",
    bg: "rgba(97,165,194,0.13)",
    text: "#2a6f97",
    border: "rgba(97,165,194,0.35)",
    dot: "#61a5c2",
  },
  [APPLICATION_STAGE.technical_interview]: {
    labelKey: "stages.technical_interview",
    bg: "rgba(1,73,124,0.1)",
    text: "#01497c",
    border: "rgba(1,73,124,0.28)",
    dot: "#2c7da0",
  },
  [APPLICATION_STAGE.hr_interview]: {
    labelKey: "stages.hr_interview",
    bg: "rgba(70,143,175,0.12)",
    text: "#01497c",
    border: "rgba(70,143,175,0.3)",
    dot: "#468faf",
  },
  [APPLICATION_STAGE.manager_interview]: {
    labelKey: "stages.manager_interview",
    bg: "rgba(42,111,151,0.12)",
    text: "#2a6f97",
    border: "rgba(42,111,151,0.3)",
    dot: "#2a6f97",
  },
  [APPLICATION_STAGE.background_check]: {
    labelKey: "stages.background_check",
    bg: "rgba(234,179,8,0.1)",
    text: "#854d0e",
    border: "rgba(234,179,8,0.25)",
    dot: "#eab308",
  },
  [APPLICATION_STAGE.offer]: {
    labelKey: "stages.offer",
    bg: "rgba(22,163,74,0.12)",
    text: "#15803d",
    border: "rgba(22,163,74,0.3)",
    dot: "#22c55e",
  },
};

const defaultStage = {
  labelKey: "stages.processing",
  bg: "rgba(42,111,151,0.1)",
  text: "#2a6f97",
  border: "rgba(42,111,151,0.25)",
  dot: "#2a6f97",
};

// const AUTOMATED_STAGES = ["cv_review", "shortlist", "offer"];

const INTERVIEW_STAGE_TYPES = [
  APPLICATION_STAGE.assessment_test,
  APPLICATION_STAGE.coding_test,
  APPLICATION_STAGE.video_interview,
  APPLICATION_STAGE.technical_interview,
  APPLICATION_STAGE.hr_interview,
  APPLICATION_STAGE.manager_interview,
  APPLICATION_STAGE.ai_screening,
];

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function StagePill({ label, cfg }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap tracking-wide"
      style={{
        background: cfg.bg,
        color: cfg.text,
        border: `1px solid ${cfg.border}`,
      }}
    >
      <span
        className="size-1.5 rounded-full shrink-0"
        style={{ background: cfg.dot }}
      />
      {label}
    </span>
  );
}

const CardHeader = () => (
  <div className="px-4 pt-3">
    <div className="flex items-center gap-2 mb-3">
      <div className="size-7 rounded-lg bg-surface-muted flex items-center justify-center text-primary shrink-0">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      </div>
      <div>
            <div className="text-sm font-bold text-foreground tracking-tight">
              {t("interview_list.title")}
            </div>
            <div className="text-[11px] text-accent mt-0.5">
              {t("interview_list.subtitle")}
            </div>
      </div>
    </div>
  </div>
);

export default function InterviewList({ applications }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all_interviews");
  const { t } = useTranslation();
  const getActiveInterviewStage = (app) => {
    if (!app.application_stages || !Array.isArray(app.application_stages))
      return null;
    const sortedStages = [...app.application_stages].sort(
      (a, b) =>
        (a.recruitment_stages?.order_index || 0) -
        (b.recruitment_stages?.order_index || 0),
    );
    let active = sortedStages.find(
      (s) =>
        s.status === "in_progress" &&
        INTERVIEW_STAGE_TYPES.includes(s.recruitment_stages?.stage_type),
    );
    if (!active) {
      active = sortedStages.find(
        (s) =>
          s.status === "pending" &&
          INTERVIEW_STAGE_TYPES.includes(s.recruitment_stages?.stage_type),
      );
    }
    return active;
  };

    const getStageStatus = (app) => {
        const currentStageId = app.current_stage_id;
        if (!currentStageId) return null;

        const recStage = app.current_recruitment_stage;
        if (!recStage || !INTERVIEW_STAGE_TYPES.includes(recStage.stage_type)) return null;

        // Find the matching application_stages entry (may not exist if stage was just assigned)
        const appStage = (app.application_stages || []).find(
            (s) => s.stage_id === currentStageId,
        );

        const hasScore = appStage?.score != null;

        if (!hasScore) {
            return {
                status: "in_progress",
                label: recStage.name || "Interview Stage",
                color: stageConfig[recStage.stage_type]?.color || stageConfig[APPLICATION_STAGE.interview].color,
                stageType: recStage.stage_type,
            };
        }

        return {
            status: "completed",
            label: "Completed",
            color: "bg-emerald-100 text-emerald-700 border-emerald-200",
        };
    };

    const interviewProcesses = applications?.filter((app) => {
        const stageStatus = getStageStatus(app);
        return stageStatus !== null;
    }) || [];

  // ── Empty state ──
  if (interviewProcesses.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm font-sans">
        <CardHeader />
        <div className="border-t border-border py-9 px-5 text-center text-accent text-[13px]">
          {t("interview_list.empty_state")}
        </div>
      </div>
    );
  }

  const countAll = interviewProcesses.length;
  const countInterviews = interviewProcesses.filter(
    (app) => getStageStatus(app)?.status === "in_progress",
  ).length;
  const countCompleted = interviewProcesses.filter(
    (app) => getStageStatus(app)?.status === "completed",
  ).length;
  const countRejected = interviewProcesses.filter(
    (app) => app.current_stage === APPLICATION_STAGE.rejected,
  ).length;

  const filteredInterviews = interviewProcesses.filter((app) => {
    const stageStatus = getStageStatus(app);
    if (activeTab === "all_interviews") return true;
    if (activeTab === "interview") return stageStatus?.status === "in_progress";
    if (activeTab === "completed") return stageStatus?.status === "completed";
    if (activeTab === "rejected")
      return app.current_stage === APPLICATION_STAGE.rejected;
    return true;
  });

  const tabs = [
    { key: "all_interviews", label: "All Processes", count: countAll },
    { key: "interview", label: "Active Interviews", count: countInterviews },
    { key: "completed", label: "Completed", count: countCompleted },
    { key: "rejected", label: "Rejected", count: countRejected },
  ];

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm font-sans">
      {/* Header + tabs */}
      <div className="px-4 pt-3">
        {/* Title row */}
        <div className="flex items-center gap-2 mb-3">
          <div className="size-7 rounded-lg bg-surface-muted flex items-center justify-center text-primary shrink-0">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <div>
        <div className="text-sm font-bold text-foreground tracking-tight">
              {t("interview_list.title")}
            </div>
            <div className="text-[11px] text-accent mt-0.5">
              {t("interview_list.subtitle")}
            </div>
          </div>
        </div>

        {/* Underline tabs */}
        <div className="flex border-b border-border overflow-x-auto -mx-5 px-5">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold bg-transparent border-none cursor-pointer whitespace-nowrap font-sans transition-all duration-150 ${
                  isActive
                    ? "text-primary border-b-2 border-primary"
                    : "text-accent border-b-2 border-transparent"
                }`}
              >
                {tab.label}
                <span
                  className={`rounded-full px-[7px] py-[1px] text-[9px] font-extrabold ${
                    isActive ? "bg-primary text-white" : "bg-surface-muted text-accent"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Body */}
      <div className="px-4 pt-3 pb-3">
        {filteredInterviews.length === 0 ? (
          <div className="text-center py-6 text-accent text-xs bg-surface-muted rounded-xl border border-dashed border-stage-applied">
            {t("interview_list.no_records")}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filteredInterviews.map((app) => {
              const job = app.job_postings;
              const company = job?.companies;
              const stageStatus = getStageStatus(app);
              const isInterviewActive = stageStatus?.status === "in_progress";

              let displayLabel;
              let stageCfg;

              if (stageStatus) {
                const type = stageStatus.stageType;
                stageCfg = stageConfig[type] || defaultStage;
                displayLabel = stageStatus.label;
              } else {
                const type = app.current_stage;
                stageCfg = stageConfig[type] || defaultStage;
                displayLabel = t(stageCfg.labelKey);
              }

              return (
                <div
                  key={app.id}
                  className={`flex items-center justify-between flex-wrap gap-3 rounded-xl px-3.5 py-2.5 transition-all duration-[180ms] hover:-translate-y-0.5 hover:shadow-[0_4px_14px_rgba(1,42,74,.09)] ${
                    isInterviewActive
                      ? "bg-surface-muted border border-stage-applied"
                      : "bg-card border border-border"
                  }`}
                >
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[13px] font-bold text-foreground tracking-tight">
                        {job?.title ||
                          t("interview_list.fields.unknown_position")}
                      </span>
                      <StagePill label={displayLabel} cfg={stageCfg} />
                    </div>

                    <p className="text-xs text-accent font-medium m-0 mb-1.5">
                      {company?.name ||
                        t("interview_list.fields.unknown_company")}
                    </p>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-surface-muted border border-border rounded-md px-2 py-0.5 text-[10px] font-semibold text-accent font-mono">
                        {t("interview_list.fields.id")}:{" "}
                        {app.candidate_profile_id?.substring(0, 8)}
                      </span>
                      <span className="size-1 rounded-full bg-stage-applied shrink-0" />
                      <span className="text-[11px] text-accent">
                        {t("interview_list.fields.applied")}{" "}
                        {formatDate(app.applied_at)}
                      </span>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    {isInterviewActive && (
                      <button
                        onClick={() => navigate(`/interview/${app.id}`)}
                        className="flex items-center gap-1.5 bg-primary text-white border-none rounded-lg px-3.5 py-[7px] text-[11px] font-bold cursor-pointer whitespace-nowrap font-sans transition-opacity duration-150 hover:opacity-[0.88]"
                      >
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                        {t("interview_list.buttons.start_stage_interview", {
                          stage: stageStatus?.label || "Interview",
                        })}
                      </button>
                    )}

                    {app.cv_file_url && (
                      <a
                        href={app.cv_file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 bg-transparent text-primary border border-border rounded-lg px-[13px] py-[7px] text-[11px] font-bold cursor-pointer whitespace-nowrap no-underline font-sans transition-all duration-150 hover:bg-surface-muted hover:border-stage-applied"
                      >
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                        {t("interview_list.buttons.view_cv")}
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
