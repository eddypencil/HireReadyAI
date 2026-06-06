import { useNavigate } from "react-router-dom";
import {
  X,
  Mail,
  Briefcase,
  Sparkles,
  Check,
  ChevronRight,
} from "lucide-react";

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

const MetricCard = ({ title, score, colorClass }) => (
  <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-4 flex flex-col gap-3">
    <span className="text-xs font-semibold text-slate-500">{title}</span>
    <span className="text-3xl font-bold text-slate-800 leading-none">
      {score ?? "--"}
    </span>
    <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${colorClass || "bg-yale-blue-500"}`}
        style={{ width: `${score ?? 0}%` }}
      />
    </div>
  </div>
);

const StatusBadge = ({ status, isRejected }) => {
  if (isRejected)
    return (
      <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-red-50 text-red-600">
        Reject
      </span>
    );
  if (status === "passed")
    return (
      <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-100/60 text-emerald-700">
        Passed
      </span>
    );
  if (status === "in_progress")
    return (
      <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-50 text-blue-600">
        In Progress
      </span>
    );
  if (status === "failed")
    return (
      <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-red-100 text-red-700">
        Failed
      </span>
    );
  return (
    <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-500">
      Pending
    </span>
  );
};

export default function CandidateSidebar({ candidate, onClose }) {
  const navigate = useNavigate();
  if (!candidate) return null;

  const { profile, stagesData = [] } = candidate;

  const sortedStages = [...stagesData].sort(
    (a, b) =>
      (a.recruitment_stages?.order_index || 0) -
      (b.recruitment_stages?.order_index || 0),
  );

  // Find the last stage with an evaluation to display AI recommendation
  const currentStage = sortedStages.find(
    (s) => s.recruitment_stages?.id === candidate.currentStageId,
  );
  const hasCurrentStageScore = currentStage?.score != null;

  const stagesWithEvals = sortedStages.filter((s) => {
    const raw = s.application_stage_evaluations;
    const d = Array.isArray(raw) ? raw[0] : raw;
    return d?.reasoning || d?.recommendation;
  });
  const lastEvalStage =
    stagesWithEvals[stagesWithEvals.length - 1] || sortedStages[0];
  const evalsRaw = lastEvalStage?.application_stage_evaluations;
  const currentEval = Array.isArray(evalsRaw) ? evalsRaw[0] : evalsRaw;

  // Compute AI Match score from cv_review's dimension_scores average
  const cvReviewStage = sortedStages.find(
    (s) => s.recruitment_stages?.stage_type === "cv_review",
  );
  let aiMatchScore = null;
  if (cvReviewStage?.ai_feedback) {
    try {
      const feedback = JSON.parse(cvReviewStage.ai_feedback);
      const dims = feedback.dimension_scores;
      if (dims) {
        const values = Object.values(dims).filter((v) => typeof v === "number");
        if (values.length > 0) {
          aiMatchScore = Math.round(
            values.reduce((a, b) => a + b, 0) / values.length,
          );
        }
      }
    } catch {}
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed top-0 right-0 h-screen w-full max-w-115 bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col transform transition-transform duration-300 overflow-hidden font-sans">
        {/* HEADER */}
        <div className="flex-none bg-white px-6 py-5 border-b border-slate-100 flex items-start justify-between shrink-0">
          <div className="flex gap-4 items-center">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center shrink-0 overflow-hidden">
              {/* Mocking the avatar from the image, but using initials if no pic */}
              {profile?.profile_pic ? (
                <img
                  src={profile.profile_pic}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-pink-600 font-bold text-lg">
                  {getInitials(candidate.name)}
                </span>
              )}
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  {candidate.name}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-500 border border-red-100">
                  Reject
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 font-medium">
                {profile?.phone && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {profile.phone}
                  </span>
                )}
                {profile?.headline && (
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    {profile.headline}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-8 bg-[#fafcff]">
          {/* Top Section: Metrics, AI Rec, Pipeline Progress */}
          <div className="flex flex-col gap-6">
            {/* Metric Cards */}
            <div className="flex gap-3">
              <MetricCard
                title="Resume"
                score={candidate.cvScore}
                colorClass="bg-slate-400"
              />
              <MetricCard
                title="AI Match"
                score={aiMatchScore}
                colorClass="bg-yale-blue-500"
              />
              <MetricCard
                title="Stage"
                score={candidate.score}
                colorClass="bg-slate-400"
              />
            </div>

            {/* AI Recommendation */}
            <div className="bg-linear-to-br from-[#f0f9ff] to-[#e6f4ff] rounded-2xl border border-blue-100 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-yale-blue-500" />
                  <span className="text-xs font-bold text-yale-blue-600 tracking-wide uppercase">
                    AI Recommendation
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase">
                    Confidence
                  </span>
                  <span className="text-sm font-bold text-yale-blue-700 leading-none mt-0.5">
                    {currentEval?.confidence != null
                      ? `${Math.round(Number(currentEval.confidence) * 100)}%`
                      : "N/A"}
                  </span>
                </div>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {currentEval?.recommendation === "reject"
                  ? "Politely reject"
                  : "Advance to next stage"}
              </h3>

              <p className="text-sm text-slate-600 leading-relaxed mb-5">
                {currentEval?.reasoning ||
                  "Evaluation completed, but no detailed reasoning was provided."}
              </p>

              {hasCurrentStageScore && (
                <div className="flex gap-3 items-center">
                  <button className="flex items-center gap-2 bg-yale-blue-600 text-white font-semibold text-sm px-4 py-2 rounded-xl hover:bg-yale-blue-700 transition-colors shadow-sm">
                    <Check className="w-4 h-4" />
                    Advance to next stage
                  </button>
                  <button className="bg-white border border-slate-200 text-slate-600 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors">
                    Reject
                  </button>
                </div>
              )}
            </div>

            {/* Pipeline Progress */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Pipeline Progress
                </h3>
              </div>

              <div className="flex flex-col gap-3.5">
                {sortedStages.map((stage) => {
                  const isPassed = stage.status === "passed";
                  const isFailed = stage.status === "failed";
                  const isInProgress = stage.status === "in_progress";
                  const isPending = !isPassed && !isInProgress && !isFailed;

                  return (
                    <div
                      key={stage.id}
                      className="flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        {isPassed ? (
                          <div className="w-2 h-2 rounded-full bg-emerald-500 ml-1" />
                        ) : isInProgress ? (
                          <div className="w-2.5 h-2.5 rounded-full bg-yale-blue-500 ml-0.5 ring-2 ring-air-force-blue-500" />
                        ) : (
                          <div className="w-2 h-2 rounded-full border-2 border-slate-300 ml-1" />
                        )}
                        <span
                          className={`text-sm ${isInProgress ? "font-bold text-slate-900" : isPending ? "font-medium text-slate-400" : "font-medium text-slate-700"}`}
                        >
                          {stage.recruitment_stages?.name || "Unknown Stage"}
                        </span>
                      </div>
                      <StatusBadge
                        status={stage.status}
                        isRejected={isFailed}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-slate-200" />

          {/* STAGE RESULTS SECTION */}
          <div>
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4">
              Stage Results
            </h3>
            <div className="flex flex-col gap-4">
              {sortedStages.map((stage) => {
                // Only show results for stages that have evaluations or are in progress
                const stageEvalsRaw = stage.application_stage_evaluations;
                const evalData = Array.isArray(stageEvalsRaw)
                  ? stageEvalsRaw[0]
                  : stageEvalsRaw;

                if (!evalData && stage.status === "pending") return null;

                return (
                  <div
                    key={stage.id}
                    className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-slate-800 text-sm">
                        {stage.recruitment_stages?.name}
                      </h4>
                      <div className="flex items-center gap-2">
                        {stage.score !== null && (
                          <span
                            className={`px-2 py-0.5 rounded-md text-xs font-bold ${stage.score >= 80 ? "bg-emerald-50 text-emerald-700" : stage.score >= 60 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}
                          >
                            {Math.round(stage.score)}
                          </span>
                        )}
                        <StatusBadge
                          status={stage.status}
                          isRejected={stage.status === "failed"}
                        />
                      </div>
                    </div>

                    {/* Strengths & Weaknesses Cards */}
                    {evalData &&
                    (evalData.strengths?.length > 0 ||
                      evalData.weaknesses?.length > 0) ? (
                      <div className="flex flex-col gap-3">
                        {evalData.strengths?.length > 0 && (
                          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                            <h5 className="text-[10px] font-bold text-green-700 uppercase tracking-wider mb-2">
                              Strengths
                            </h5>
                            <ul className="space-y-1.5">
                              {evalData.strengths.map((s, i) => (
                                <li
                                  key={`s-${i}`}
                                  className="flex items-start gap-2 text-sm text-green-800"
                                >
                                  <Check className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                                  <span>{s}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {evalData.weaknesses?.length > 0 && (
                          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                            <h5 className="text-[10px] font-bold text-red-700 uppercase tracking-wider mb-2">
                              Weaknesses
                            </h5>
                            <ul className="space-y-1.5">
                              {evalData.weaknesses.map((w, i) => (
                                <li
                                  key={`w-${i}`}
                                  className="flex items-start gap-2 text-sm text-red-800"
                                >
                                  <X className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
                                  <span>{w}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <ul className="space-y-2.5">
                        {/* Fallback if no specific strengths/weaknesses to match mockup look */}
                        {stage.status === "in_progress" ? (
                          <>
                            <li className="flex items-start gap-2.5 text-sm text-yale-blue-600">
                              <div className="w-1 h-1 rounded-full bg-yale-blue-500 mt-2 shrink-0" />
                              <span className="leading-snug">
                                Currently evaluating
                              </span>
                            </li>
                            <li className="flex items-start gap-2.5 text-sm text-yale-blue-600">
                              <div className="w-1 h-1 rounded-full bg-yale-blue-500 mt-2 shrink-0" />
                              <span className="leading-snug">
                                Live session scheduled
                              </span>
                            </li>
                          </>
                        ) : (
                          <li className="flex items-start gap-2.5 text-sm text-slate-400 italic">
                            <span className="leading-snug">
                              No detailed feedback available.
                            </span>
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* View Profile Button */}
          <button
            onClick={() => { navigate(`/companies/candidates/${candidate.id}`); onClose(); }}
            className="w-full bg-yale-blue-600 text-white font-semibold text-sm px-4 py-3 rounded-xl hover:bg-yale-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2 mt-4"
          >
            View Profile <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
}
