import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { APPLICATION_STAGE } from "@/shared/constants/enums";

const stageConfig = {
    [APPLICATION_STAGE.interview]: {
        label: "Active Interview",
        color: "bg-accent/10 text-accent border-accent/20 font-bold animate-pulse"
    },
    [APPLICATION_STAGE.shorListed]: {
        label: "Shortlisted",
        color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
    },
    [APPLICATION_STAGE.hired]: {
        label: "Hired / Completed",
        color: "bg-green-500/10 text-green-600 border-green-500/20"
    },
    [APPLICATION_STAGE.rejected]: {
        label: "Rejected",
        color: "bg-destructive/10 text-destructive border-destructive/20"
    },

    [APPLICATION_STAGE.cv_screening]: {
        label: "CV Screening",
        color: "bg-secondary text-muted-foreground border-border"
    },
    [APPLICATION_STAGE.ai_screening]: {
        label: "AI Screening",
        color: "bg-accent/10 text-accent border-accent/20"
    },
    [APPLICATION_STAGE.assessment_test]: {
        label: "Assessment Test",
        color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20 font-bold animate-pulse"
    },
    [APPLICATION_STAGE.coding_test]: {
        label: "Coding Test",
        color: "bg-sky-500/10 text-sky-600 border-sky-500/20 font-bold animate-pulse"
    },
    [APPLICATION_STAGE.video_interview]: {
        label: "Video Interview",
        color: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20 font-bold animate-pulse"
    },
    [APPLICATION_STAGE.technical_interview]: {
        label: "Technical Interview",
        color: "bg-accent/10 text-accent border-accent/20 font-bold animate-pulse"
    },
    [APPLICATION_STAGE.hr_interview]: {
        label: "HR Interview",
        color: "bg-pink-500/10 text-pink-600 border-pink-500/20 font-bold animate-pulse"
    },
    [APPLICATION_STAGE.manager_interview]: {
        label: "Manager Interview",
        color: "bg-violet-500/10 text-violet-600 border-violet-500/20 font-bold animate-pulse"
    },
    [APPLICATION_STAGE.background_check]: {
        label: "Background Check",
        color: "bg-orange-500/10 text-orange-600 border-orange-500/20"
    },
    [APPLICATION_STAGE.offer]: {
        label: "Offer",
        color: "bg-green-500/10 text-green-600 border-green-500/20"
    },
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

    const getActiveInterviewStage = (app) => {
        if (!app.application_stages || !Array.isArray(app.application_stages)) return null;

        const sortedStages = [...app.application_stages].sort((a, b) => {
            const orderA = a.recruitment_stages?.order_index || 0;
            const orderB = b.recruitment_stages?.order_index || 0;
            return orderA - orderB;
        });

        let active = sortedStages.find(s => s.status === "in_progress" && INTERVIEW_STAGE_TYPES.includes(s.recruitment_stages?.stage_type));

        if (!active) {
            active = sortedStages.find(s => s.status === "pending" && INTERVIEW_STAGE_TYPES.includes(s.recruitment_stages?.stage_type));
        }

        return active;
    };

    const interviewProcesses = applications?.filter((app) => {
        const activeStage = getActiveInterviewStage(app);
        return activeStage ||
            app.current_stage === APPLICATION_STAGE.interview ||
            app.current_stage === APPLICATION_STAGE.shortlisted ||
            app.current_stage === APPLICATION_STAGE.hired ||
            app.current_stage === APPLICATION_STAGE.rejected;
    }) || [];

    if (interviewProcesses.length === 0) {
        return (
            <div className="bg-background border border-border rounded-xl p-6 text-center shadow-xs">
                <h2 className="font-semibold text-sidebar text-lg">Status Management</h2>
                <p className="text-sm text-muted-foreground/60 mt-1">No interview processes or status updates records found yet.</p>
            </div>
        );
    }

    const countAll = interviewProcesses.length;
    const countInterviews = interviewProcesses.filter(app => getActiveInterviewStage(app) || app.current_stage === APPLICATION_STAGE.interview).length;
    const countCompleted = interviewProcesses.filter(app => !getActiveInterviewStage(app) && app.current_stage === APPLICATION_STAGE.hired).length;
    const countRejected = interviewProcesses.filter(app => !getActiveInterviewStage(app) && app.current_stage === APPLICATION_STAGE.rejected).length;

    const filteredInterviews = interviewProcesses.filter((app) => {
        const activeStage = getActiveInterviewStage(app);
        if (activeTab === "all_interviews") return true;
        if (activeTab === "interview") return activeStage || app.current_stage === APPLICATION_STAGE.interview;
        if (activeTab === "completed") return !activeStage && app.current_stage === APPLICATION_STAGE.hired;
        if (activeTab === "rejected") return !activeStage && app.current_stage === APPLICATION_STAGE.rejected;
        return true;
    });

    return (
        <div className="bg-background border border-border rounded-xl p-6 shadow-xs space-y-6">
            <div>
                <h2 className="font-semibold text-sidebar text-lg">Status Management</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Track your interview stages and process results</p>
            </div>

            <div className="flex flex-wrap gap-2 border-b border-border/60 pb-4">
                <button
                    onClick={() => setActiveTab("all_interviews")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${activeTab === "all_interviews" ? "bg-sidebar text-white shadow-xs" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}
                >
                    All Processes - {countAll}
                </button>
                <button
                    onClick={() => setActiveTab("interview")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${activeTab === "interview" ? "bg-accent text-white shadow-xs" : "bg-accent/10 text-accent hover:bg-accent/20"}`}
                >
                    Active Interviews - {countInterviews}
                </button>
                <button
                    onClick={() => setActiveTab("completed")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${activeTab === "completed" ? "bg-green-600 text-white shadow-xs" : "bg-green-500/10 text-green-600 hover:bg-green-500/20"}`}
                >
                    Completed - {countCompleted}
                </button>
                <button
                    onClick={() => setActiveTab("rejected")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${activeTab === "rejected" ? "bg-destructive text-white shadow-xs" : "bg-destructive/10 text-destructive hover:bg-destructive/20"}`}
                >
                    Rejected - {countRejected}
                </button>
            </div>

            <div className="space-y-4">
                {filteredInterviews.length === 0 ? (
                    <p className="text-sm text-muted-foreground/60 py-6 text-center bg-secondary/40 rounded-xl border border-dashed border-border">
                        No records found in this section.
                    </p>
                ) : (
                    filteredInterviews.map((app) => {
                        const job = app.job_postings;
                        const company = job?.companies;
                        const activeStage = getActiveInterviewStage(app);
                        const isInterviewActive = !!activeStage || app.current_stage === APPLICATION_STAGE.interview;

                        let displayLabel = app.current_stage;
                        let displayColor = stageConfig[app.current_stage]?.color || "bg-secondary text-muted-foreground border-border";

                        if (activeStage) {
                            const type = activeStage.recruitment_stages?.stage_type;
                            displayLabel = activeStage.recruitment_stages?.name || "Interview Stage";
                            displayColor = stageConfig[type]?.color || stageConfig[APPLICATION_STAGE.interview].color;
                        } else if (stageConfig[app.current_stage]) {
                            displayLabel = stageConfig[app.current_stage].label;
                        }

                        return (
                            <div
                                key={app.id}
                                className="bg-secondary/20 border border-border rounded-xl p-5 shadow-xs hover:shadow-xs hover:border-accent/30 hover:bg-background transition-all duration-200 flex items-center justify-between flex-wrap gap-4"
                            >
                                <div className="flex-1 min-w-0 space-y-1.5">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h4 className="font-semibold text-sidebar text-base tracking-tight">
                                            {job?.title || "Unknown Position"}
                                        </h4>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${displayColor}`}>
                                            {displayLabel}
                                        </span>
                                    </div>

                                    <p className="text-sm text-muted-foreground font-medium">
                                        {company?.name || "Unknown Company"}
                                    </p>

                                    <div className="flex items-center gap-3 text-xs text-muted-foreground/60">
                                        <span className="bg-secondary px-2 py-0.5 rounded text-[11px] font-mono text-muted-foreground/80">
                                            ID: {app.candidate_profile_id.substring(0, 8)}
                                        </span>
                                        <span className="w-1 h-1 rounded-full bg-border"></span>
                                        <span>Applied {formatDate(app.applied_at)}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 shrink-0">
                                    {isInterviewActive && (
                                        <button
                                            onClick={() => navigate(`/interview/${app.id}`)}
                                            className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
                                        >
                                            {activeStage ? `Start ${activeStage.recruitment_stages?.name}` : "Start AI Interview"}
                                        </button>
                                    )}
                                    {app.cv_file_url && (
                                        <a
                                            href={app.cv_file_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-sidebar text-xs font-semibold bg-background border border-border px-4 py-2 rounded-xl shadow-xs hover:border-accent/40 hover:bg-secondary/50 transition-all"
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