import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { APPLICATION_STAGE } from "@/shared/constants/enums";

const stageConfig = {
    // General / Legacy
    [APPLICATION_STAGE.interview]: { label: "Active Interview", color: "bg-indigo-100 text-indigo-700 border-indigo-300 font-bold animate-pulse" },
    [APPLICATION_STAGE.shorListed]: { label: "Shortlisted", color: "bg-purple-100 text-purple-700 border-purple-200" },
    [APPLICATION_STAGE.hired]: { label: "Hired / Completed", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    [APPLICATION_STAGE.rejected]: { label: "Rejected", color: "bg-red-100 text-red-700 border-red-200" },

    // Pipeline Stages
    cv_review: { label: "CV Review", color: "bg-slate-100 text-slate-700 border-slate-200" },
    shortlist: { label: "Shortlisting", color: "bg-purple-100 text-purple-700 border-purple-200" },
    [APPLICATION_STAGE.cv_screening]: { label: "CV Screening", color: "bg-slate-100 text-slate-700 border-slate-200" },
    [APPLICATION_STAGE.ai_screening]: { label: "AI Screening", color: "bg-purple-100 text-purple-700 border-purple-200" },
    [APPLICATION_STAGE.assessment_test]: { label: "Assessment Test", color: "bg-indigo-100 text-indigo-700 border-indigo-300 font-bold animate-pulse" },
    [APPLICATION_STAGE.coding_test]: { label: "Coding Test", color: "bg-blue-100 text-blue-700 border-blue-300 font-bold animate-pulse" },
    [APPLICATION_STAGE.video_interview]: { label: "Video Interview", color: "bg-cyan-100 text-cyan-700 border-cyan-300 font-bold animate-pulse" },
    [APPLICATION_STAGE.technical_interview]: { label: "Technical Interview", color: "bg-indigo-100 text-indigo-700 border-indigo-300 font-bold animate-pulse" },
    [APPLICATION_STAGE.hr_interview]: { label: "HR Interview", color: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-300 font-bold animate-pulse" },
    [APPLICATION_STAGE.manager_interview]: { label: "Manager Interview", color: "bg-violet-100 text-violet-700 border-violet-300 font-bold animate-pulse" },
    [APPLICATION_STAGE.background_check]: { label: "Background Check", color: "bg-orange-100 text-orange-700 border-orange-200" },
    [APPLICATION_STAGE.offer]: { label: "Offer", color: "bg-green-100 text-green-700 border-green-200" },
};

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

export default function InterviewList({ applications }) {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("all_interviews");

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

    if (interviewProcesses.length === 0) {
        return (
            <div className="bg-white border border-gray-200 rounded-xl p-6 text-center shadow-sm">
                <h2 className="font-semibold text-gray-800 text-lg">Status Management</h2>
                <p className="text-sm text-gray-400 mt-1">No interview processes or status updates records found yet.</p>
            </div>
        );
    }

    const countAll = interviewProcesses.length;
    const countInterviews = interviewProcesses.filter(app => getStageStatus(app)?.status === "in_progress").length;
    const countCompleted = interviewProcesses.filter(app => getStageStatus(app)?.status === "completed").length;
    const countRejected = interviewProcesses.filter(app => getStageStatus(app)?.status === "rejected").length;
    const countWaiting = interviewProcesses.filter(app => getStageStatus(app)?.status === "waiting").length;

    const filteredInterviews = interviewProcesses.filter((app) => {
        const status = getStageStatus(app)?.status;
        if (activeTab === "all_interviews") return true;
        if (activeTab === "interview") return status === "in_progress" || status === "waiting";
        if (activeTab === "completed") return status === "completed";
        if (activeTab === "rejected") return status === "rejected";
        return true;
    });

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
            <div>
                <h2 className="font-semibold text-gray-800 text-lg">Status Management</h2>
                <p className="text-sm text-gray-500 mt-0.5">Track your interview stages and process results</p>
            </div>

            <div className="flex flex-wrap gap-2 border-b border-gray-100 pb-4">
                <button
                    onClick={() => setActiveTab("all_interviews")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${activeTab === "all_interviews" ? "bg-slate-900 text-white shadow-sm" : "bg-gray-50 text-gray-600 hover:bg-gray-100"}`}
                >
                    All Processes - {countAll}
                </button>
                <button
                    onClick={() => setActiveTab("interview")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${activeTab === "interview" ? "bg-indigo-600 text-white shadow-sm" : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"}`}
                >
                    Active Interviews - {countInterviews + countWaiting}
                </button>
                <button
                    onClick={() => setActiveTab("completed")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${activeTab === "completed" ? "bg-green-600 text-white shadow-sm" : "bg-green-50 text-green-600 hover:bg-green-100"}`}
                >
                    Completed - {countCompleted}
                </button>
                <button
                    onClick={() => setActiveTab("rejected")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${activeTab === "rejected" ? "bg-red-600 text-white shadow-sm" : "bg-red-50 text-red-600 hover:bg-red-100"}`}
                >
                    Rejected - {countRejected}
                </button>
            </div>

            <div className="space-y-4">
                {filteredInterviews.length === 0 ? (
                    <p className="text-sm text-gray-400 py-6 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        No records found in this section.
                    </p>
                ) : (
                    filteredInterviews.map((app) => {
                        const job = app.job_postings;
                        const company = job?.companies;
                        const stageStatus = getStageStatus(app);
                        const isInterviewActive = stageStatus?.status === "in_progress";

                        return (
                            <div
                                key={app.id}
                                className="bg-gray-50/60 border border-gray-100 rounded-xl p-5 shadow-xs hover:shadow-sm hover:border-violet-200 hover:bg-white transition-all duration-200 flex items-center justify-between flex-wrap gap-4"
                            >
                                <div className="flex-1 min-w-0 space-y-1.5">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h4 className="font-semibold text-gray-800 text-base tracking-tight">
                                            {job?.title || "Unknown Position"}
                                        </h4>
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${stageStatus?.color || "bg-gray-100 text-gray-700 border-gray-200"}`}>
                                                {stageStatus?.label || "Unknown"}
                                            </span>
                                            {stageStatus?.waiting && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-amber-50 text-amber-600 border-amber-200">
                                                    Waiting for Next Stage
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <p className="text-sm text-gray-600 font-medium">
                                        {company?.name || "Unknown Company"}
                                    </p>

                                    <div className="flex items-center gap-3 text-xs text-gray-400">
                                        <span className="bg-gray-200/70 px-2 py-0.5 rounded text-[11px] font-mono text-gray-500">
                                            ID: {app.candidate_profile_id.substring(0, 8)}
                                        </span>
                                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                        <span>Applied {formatDate(app.applied_at)}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 shrink-0">
                                    {isInterviewActive && stageStatus?.stageType && (
                                        <button
                                            onClick={() => navigate(`/interview/${app.id}`)}
                                            className="bg-indigo-600 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs hover:bg-indigo-700 transition-all"
                                        >
                                            {stageStatus.stageType ? `Start ${stageStatus.label}` : "Start AI Interview"}
                                        </button>
                                    )}
                                    {app.cv_file_url && (
                                        <a
                                            href={app.cv_file_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-violet-600 text-xs font-semibold bg-white border border-gray-200 px-4 py-2 rounded-xl shadow-xs hover:border-violet-300 hover:bg-violet-50/50 transition-all"
                                        >
                                            View Submitted CV
                                        </a>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}