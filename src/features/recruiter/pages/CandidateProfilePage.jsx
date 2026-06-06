import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, FileText, Sparkles, BarChart3, ChevronRight, Check, X, AlertTriangle, Award } from "lucide-react";
import { getCandidateProfile, getJobScorePercentile, getPercentileTag } from "../services/candidateProfile.service";

function getInitials(name = "") {
  return (name || "").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";
}

function parseAIFeedback(stage) {
  if (!stage?.ai_feedback) return null;
  try {
    return JSON.parse(stage.ai_feedback);
  } catch {
    return null;
  }
}

const DimensionBar = ({ label, score }) => (
  <div className="flex items-center gap-3">
    <span className="text-sm font-medium text-slate-600 w-36 shrink-0">{label}</span>
    <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${
          score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-yale-blue-600" : score >= 40 ? "bg-amber-500" : "bg-red-500"
        }`}
        style={{ width: `${score}%` }}
      />
    </div>
    <span className="text-sm font-bold text-slate-700 w-8 text-right">{score}</span>
  </div>
);

export default function CandidateProfilePage() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [percentile, setPercentile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getCandidateProfile(id).then(({ data, error: err }) => {
      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
      setProfile(data);
      if (data?.job_postings?.id && data.composite_score != null) {
        getJobScorePercentile(data.job_postings.id, data.composite_score).then(({ percentile: p }) => {
          setPercentile(p);
        });
      }
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-yale-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 font-medium">{error || "Candidate not found"}</p>
        <Link to="../candidates" className="text-yale-blue-600 hover:underline mt-4 inline-block">&larr; Back to pipeline</Link>
      </div>
    );
  }

  const app = profile;
  const candidate = app.profiles || {};
  const stages = (app.application_stages || []).sort(
    (a, b) => (a.recruitment_stages?.order_index || 0) - (b.recruitment_stages?.order_index || 0)
  );
  const cvStage = stages.find(s => s.recruitment_stages?.stage_type === "cv_review");
  const cvFeedback = parseAIFeedback(cvStage);

  // Compute composite from stage scores as fallback
  const computedComposite = app.composite_score != null
    ? Number(app.composite_score)
    : (() => {
        const scores = stages.filter(s => s.score != null).map(s => Number(s.score));
        return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
      })();

  const percentileTag = getPercentileTag(percentile);
  const interviewStages = stages.filter(s =>
    ["assessment_test", "coding_test", "video_interview", "technical_interview", "hr_interview", "manager_interview", "ai_screening"].includes(s.recruitment_stages?.stage_type)
  );

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Back button */}
      <Link
        to="../candidates"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-rich-cerulean hover:text-yale-blue-600 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Pipeline
      </Link>

      {/* Candidate Header */}
      <div className="bg-white rounded-2xl border border-cerulean-900 p-6 shadow-sm mb-6">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yale-blue-600 to-deep-space-blue flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-xl">{getInitials(candidate.full_name)}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-deep-space-blue">{candidate.full_name || "Unknown Candidate"}</h1>
              {app.is_rejected && (
                <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-red-50 text-red-600 border border-red-200">Rejected</span>
              )}
            </div>
            {candidate.headline && (
              <p className="text-sm text-rich-cerulean mt-1">{candidate.headline}</p>
            )}
            <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
              {candidate.phone && <span>{candidate.phone}</span>}
              {app.job_postings?.title && (
                <span className="flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" />
                  Applied for: <strong className="text-slate-700">{app.job_postings.title}</strong>
                </span>
              )}
            </div>
          </div>

          {/* Composite Score + Percentile Tag */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yale-blue-600 to-cerulean flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{computedComposite ?? "--"}</span>
            </div>
            <span className="text-[10px] font-semibold text-slate-500 uppercase">Composite</span>
            {percentileTag && (
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${percentileTag.color}`}>
                {percentileTag.label}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CV Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          {cvFeedback && (
            <>
              {/* AI CV Review Banner */}
              <div className="rounded-2xl bg-gradient-to-br from-yale-blue-600 via-rich-cerulean to-deep-space-blue p-8 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-6 h-6 text-sky-blue-800" />
                    <h2 className="text-lg font-bold text-white">AI CV Review</h2>
                    <span className={`ml-auto px-3 py-1 rounded-lg text-xs font-bold ${
                      cvFeedback.recommendation === "proceed" ? "bg-emerald-400 text-emerald-900" :
                      cvFeedback.recommendation === "review" ? "bg-amber-400 text-amber-900" :
                      "bg-red-400 text-red-900"
                    }`}>
                      {cvFeedback.recommendation?.toUpperCase() || "N/A"}
                    </span>
                  </div>
                  <p className="text-sm text-sky-blue-900 leading-relaxed font-medium">{cvFeedback.feedback}</p>
                </div>
              </div>

              {/* Dimension Scores */}
              {cvFeedback.dimension_scores && (
                <div className="bg-white rounded-2xl border border-cerulean-900 p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-5">
                    <BarChart3 className="w-5 h-5 text-yale-blue-600" />
                    <h2 className="text-lg font-bold text-slate-900">Dimension Scores</h2>
                  </div>
                  <div className="space-y-3">
                    {Object.entries(cvFeedback.dimension_scores).map(([key, val]) => (
                      <DimensionBar key={key} label={key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())} score={val} />
                    ))}
                  </div>
                </div>
              )}

              {/* Strengths, Weaknesses, Gaps */}
              <div className="flex flex-col gap-4">
                {cvFeedback.strengths?.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-1.5 mb-3">
                      <Check className="w-4 h-4 text-green-600" />
                      <h3 className="text-xs font-bold text-green-700 uppercase tracking-wider">Strengths</h3>
                    </div>
                    <ul className="space-y-2">
                      {cvFeedback.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-green-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 shrink-0" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {cvFeedback.weaknesses?.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-1.5 mb-3">
                      <X className="w-4 h-4 text-red-600" />
                      <h3 className="text-xs font-bold text-red-700 uppercase tracking-wider">Weaknesses</h3>
                    </div>
                    <ul className="space-y-2">
                      {cvFeedback.weaknesses.map((w, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-red-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {cvFeedback.gaps?.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-1.5 mb-3">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <h3 className="text-xs font-bold text-amber-700 uppercase tracking-wider">Gaps</h3>
                    </div>
                    <ul className="space-y-2">
                      {cvFeedback.gaps.map((g, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-amber-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                          <span>{g}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </>
          )}

          {!cvFeedback && (
            <div className="bg-white rounded-2xl border border-cerulean-900 p-8 shadow-sm text-center">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No CV review data available</p>
              <p className="text-xs text-slate-400 mt-1">CV has not been reviewed yet.</p>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Stage Scores */}
          <div className="bg-white rounded-2xl border border-cerulean-900 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-4 h-4 text-yale-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">Stage Scores</h2>
            </div>
            <div className="space-y-3">
              {stages.map(stage => (
                <div key={stage.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-2 h-2 rounded-full ${
                      stage.status === "passed" ? "bg-emerald-500" :
                      stage.status === "failed" ? "bg-red-500" :
                      stage.status === "in_progress" ? "bg-yale-blue-500" :
                      "bg-slate-300"
                    }`} />
                    <span className="text-sm text-slate-700">{stage.recruitment_stages?.name || "Unknown"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {stage.score != null && (
                      <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                        stage.score >= 80 ? "bg-emerald-50 text-emerald-700" :
                        stage.score >= 60 ? "bg-blue-50 text-blue-700" :
                        stage.score >= 40 ? "bg-amber-50 text-amber-700" :
                        "bg-red-50 text-red-700"
                      }`}>
                        {Math.round(stage.score)}
                      </span>
                    )}
                    <span className={`text-[10px] font-semibold ${
                      stage.status === "passed" ? "text-emerald-600" :
                      stage.status === "failed" ? "text-red-600" :
                      stage.status === "in_progress" ? "text-yale-blue-600" :
                      "text-slate-400"
                    }`}>
                      {stage.status === "in_progress" ? "In Progress" : stage.status?.charAt(0).toUpperCase() + stage.status?.slice(1) || "Pending"}
                    </span>
                  </div>
                </div>
              ))}
              {stages.length === 0 && (
                <p className="text-sm text-slate-400 italic">No stages available.</p>
              )}
            </div>
          </div>

          {/* Interview Results Link */}
          {interviewStages.length > 0 && (
            <Link
              to={`/companies/candidates/${id}/assessments`}
              className="block bg-white rounded-2xl border border-cerulean-900 p-6 shadow-sm hover:shadow-md hover:border-yale-blue-600 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Assessments & Interviews</h2>
                  <p className="text-xs text-slate-500 mt-0.5">{interviewStages.length} stage(s) with results</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-yale-blue-600 transition-colors" />
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
