import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ChevronDown, ChevronRight, Video, FileText, Code, ListChecks, Sparkles, Check, X, MessageSquare, Monitor, Clock, Brain } from "lucide-react";
import { getCandidateProfile, getCandidateStageQuestions } from "../services/candidateProfile.service";
import LoadingSpinner from "@/shared/ui/LoadingSpinner";

const QUESTION_TYPE_ICONS = {
  video: Video,
  text: FileText,
  code: Code,
  multiple_choice: ListChecks,
};

const QUESTION_TYPE_LABELS = {
  video: "Video Response",
  text: "Written Answer",
  code: "Code Challenge",
  multiple_choice: "Multiple Choice",
};

const STAGE_ICONS = {
  hr_interview: MessageSquare,
  technical_interview: Monitor,
  assessment: Brain,
  assessment_test: Brain,
  coding_test: Code,
  video_interview: Video,
  manager_interview: MessageSquare,
  ai_screening: Brain,
};

function StageSelector({ stages, activeStage, onSelect }) {
  if (stages.length <= 1) return null;
  return (
    <div className="border-b border-cerulean-900">
      <div className="flex -mb-px">
        {stages.map(stage => {
          const Icon = STAGE_ICONS[stage.recruitment_stages?.stage_type] || Brain;
          return (
            <button
              key={stage.id}
              onClick={() => onSelect(stage)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
                activeStage?.id === stage.id
                  ? "border-yale-blue-600 text-yale-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              <Icon className="w-4 h-4" />
              {stage.recruitment_stages?.name || "Unknown"}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ExpandableQuestion({ question, index }) {
  const [expanded, setExpanded] = useState(false);
  const answer = question.application_answers;
  const answerData = Array.isArray(answer) ? answer[0] : answer;
  const context = question.generation_context || {};
  const options = context.options || [];
  const language = context.language || null;
  const Icon = QUESTION_TYPE_ICONS[question.question_type] || FileText;

  const typeLabel = QUESTION_TYPE_LABELS[question.question_type] || question.question_type;

  return (
    <div className="bg-white border border-cerulean-900 rounded-xl overflow-hidden shadow-sm transition-all duration-200">
      {/* Question Header (clickable) */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-sky-blue-900/50 transition-colors"
      >
        <div className={`p-2 rounded-lg ${
          question.question_type === "video" ? "bg-rose-50 text-rose-600" :
          question.question_type === "code" ? "bg-indigo-50 text-indigo-600" :
          question.question_type === "multiple_choice" ? "bg-amber-50 text-amber-600" :
          "bg-sky-blue-900 text-rich-cerulean"
        }`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">{typeLabel}</span>
            {language && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 uppercase">{language}</span>
            )}
            {context.max_time && (
              <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
                <Clock className="w-3 h-3" />
                {context.max_time < 60 ? `${context.max_time}s` : `${Math.round(context.max_time / 60)}m`}
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-slate-800 mt-0.5 line-clamp-2">{question.question_text}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {answerData?.score != null && (
            <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${
              answerData.score >= 80 ? "bg-emerald-50 text-emerald-700" :
              answerData.score >= 60 ? "bg-blue-50 text-blue-700" :
              answerData.score >= 40 ? "bg-amber-50 text-amber-700" :
              "bg-red-50 text-red-700"
            }`}>
              {Math.round(answerData.score)}
            </span>
          )}
          {expanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
        </div>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-cerulean-900 px-5 py-4 space-y-4 bg-[#fafcff]">
          {/* Answer Content */}
          <div>
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Answer</h4>

            {question.question_type === "video" && (
              <div className="space-y-3">
                {answerData?.recording_url ? (
                  <video
                    src={answerData.recording_url}
                    controls
                    className="w-full rounded-xl border border-cerulean-900 max-h-[320px] bg-black"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-sm text-slate-400 italic p-3 bg-slate-50 rounded-xl">
                    <Video className="w-4 h-4" />
                    No video recording available
                  </div>
                )}
                {answerData?.transcript && (
                  <div className="bg-white border border-cerulean-900 rounded-xl p-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Transcript</span>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{answerData.transcript}</p>
                  </div>
                )}
              </div>
            )}

            {question.question_type === "text" && (
              <div className="bg-white border border-cerulean-900 rounded-xl p-4">
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{answerData?.answer_text || "No answer provided."}</p>
              </div>
            )}

            {question.question_type === "code" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {language && (
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-indigo-50 text-indigo-700 uppercase">{language}</span>
                  )}
                  {context.code_type && (
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-sky-blue-900 text-rich-cerulean">{context.code_type === "visuals" ? "UI / Visual" : "Problem Solving"}</span>
                  )}
                </div>
                {answerData?.answer_text ? (
                  <pre className="bg-slate-900 text-slate-100 rounded-xl p-4 overflow-x-auto text-sm font-mono leading-relaxed whitespace-pre-wrap">
                    <code>{answerData.answer_text}</code>
                  </pre>
                ) : (
                  <p className="text-sm text-slate-400 italic p-3 bg-slate-50 rounded-xl">No code submitted.</p>
                )}
              </div>
            )}

            {question.question_type === "multiple_choice" && (
              <div className="space-y-2">
                {options.length > 0 && (
                  <div className="space-y-1.5 mb-3">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Options</span>
                    {options.map((opt, idx) => {
                      const letter = String.fromCharCode(65 + idx);
                      const isSelected = answerData?.answer_text === opt;
                      return (
                        <div
                          key={idx}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border ${
                            isSelected
                              ? "bg-yale-blue-50 border-yale-blue-200 text-yale-blue-700 font-medium"
                              : "bg-white border-cerulean-900 text-slate-600"
                          }`}
                        >
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                            isSelected ? "bg-yale-blue-600 text-white" : "bg-slate-100 text-slate-500"
                          }`}>
                            {letter}
                          </span>
                          <span>{opt}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 ml-auto text-yale-blue-600" />}
                        </div>
                      );
                    })}
                  </div>
                )}
                {(!answerData?.answer_text || answerData.answer_text === "") && (
                  <p className="text-sm text-slate-400 italic p-3 bg-slate-50 rounded-xl">No answer selected.</p>
                )}
              </div>
            )}
          </div>

          {/* AI Feedback */}
          {(answerData?.feedback || answerData?.strengths?.length > 0 || answerData?.weaknesses?.length > 0) && (
            <div className="bg-gradient-to-br from-[#f0f9ff] to-[#e6f4ff] rounded-xl border border-blue-100 p-4">
              <div className="flex items-center gap-1.5 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-yale-blue-600" />
                <span className="text-[10px] font-bold text-yale-blue-600 uppercase tracking-wider">AI Feedback</span>
              </div>
              {answerData.feedback && (
                <p className="text-sm text-slate-700 leading-relaxed mb-3">{answerData.feedback}</p>
              )}
              {answerData.strengths?.length > 0 && (
                <div className="mb-2">
                  <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider block mb-1">Strengths</span>
                  <ul className="space-y-1">
                    {answerData.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-green-800">
                        <Check className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {answerData.weaknesses?.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider block mb-1">Weaknesses</span>
                  <ul className="space-y-1">
                    {answerData.weaknesses.map((w, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-red-800">
                        <X className="w-3 h-3 text-red-500 mt-0.5 shrink-0" />
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {(!answerData?.feedback && (!answerData?.strengths || answerData.strengths.length === 0) && (!answerData?.weaknesses || answerData.weaknesses.length === 0)) && (
            <p className="text-xs text-slate-400 italic">No AI feedback available for this answer.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function CandidateAssessmentsPage() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [stagesWithQuestions, setStagesWithQuestions] = useState([]);
  const [activeStage, setActiveStage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getCandidateProfile(id).then(async ({ data, error: err }) => {
      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
      setProfile(data);

      const allStages = (data.application_stages || []).sort(
        (a, b) => (a.recruitment_stages?.order_index || 0) - (b.recruitment_stages?.order_index || 0)
      );
      const interviewStages = allStages.filter(s =>
        ["assessment_test", "coding_test", "video_interview", "technical_interview", "hr_interview", "manager_interview", "ai_screening", "assessment"].includes(s.recruitment_stages?.stage_type)
      );

      if (interviewStages.length === 0) {
        setStagesWithQuestions([]);
        setLoading(false);
        return;
      }

      const stageQuestions = await Promise.all(
        interviewStages.map(async (stage) => {
          const { data: questions } = await getCandidateStageQuestions(stage.id);
          return { ...stage, questions: questions || [] };
        })
      );

      setStagesWithQuestions(stageQuestions);
      setActiveStage(stageQuestions[0]);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 font-medium">{error}</p>
        <Link to={`/companies/candidates/${id}`} className="text-yale-blue-600 hover:underline mt-4 inline-block">&larr; Back to profile</Link>
      </div>
    );
  }

  const isEmpty = stagesWithQuestions.length === 0 || stagesWithQuestions.every(s => s.questions.length === 0);

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Back link */}
      <Link
        to={`/companies/candidates/${id}`}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-rich-cerulean hover:text-yale-blue-600 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Profile
      </Link>

      {/* Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-yale-blue-600 via-rich-cerulean to-deep-space-blue p-8 shadow-lg relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Assessments & Interviews</h1>
            <p className="text-sm text-sky-blue-800 mt-1 font-medium">{profile?.profiles?.full_name || "Candidate"}</p>
          </div>
          {!isEmpty && (
            <div className="text-right">
              <span className="text-xs text-sky-blue-800 font-semibold bg-white/15 px-3 py-1.5 rounded-lg">
                {stagesWithQuestions.reduce((a, s) => a + s.questions.length, 0)} total questions
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Stage Tabs */}
      <StageSelector stages={stagesWithQuestions} activeStage={activeStage} onSelect={setActiveStage} />

      {isEmpty ? (
        <div className="bg-white rounded-2xl border border-cerulean-900 p-12 text-center mt-6">
          <Brain className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-slate-700 mb-1">No Assessment Data</h2>
          <p className="text-sm text-slate-400">This candidate has not completed any interviews or assessments yet.</p>
        </div>
      ) : activeStage ? (
        <div className="mt-6 space-y-6">
          {/* Stage Header */}
          <div className="bg-white rounded-2xl border border-cerulean-900 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-yale-blue-600 to-deep-space-blue text-white">
                  {(() => {
                    const StageIcon = STAGE_ICONS[activeStage.recruitment_stages?.stage_type] || Brain;
                    return <StageIcon className="w-5 h-5" />;
                  })()}
                </div>
                <div>
                  <h2 className="font-bold text-slate-900">{activeStage.recruitment_stages?.name}</h2>
                  <p className="text-xs text-slate-500 capitalize">{activeStage.recruitment_stages?.stage_type?.replace(/_/g, " ")}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {activeStage.score != null && (
                  <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
                    activeStage.score >= 80 ? "bg-emerald-50 text-emerald-700" :
                    activeStage.score >= 60 ? "bg-blue-50 text-blue-700" :
                    "bg-amber-50 text-amber-700"
                  }`}>
                    {Math.round(activeStage.score)}/100
                  </span>
                )}
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
                  activeStage.status === "passed" ? "bg-emerald-50 text-emerald-700" :
                  activeStage.status === "failed" ? "bg-red-50 text-red-700" :
                  activeStage.status === "in_progress" ? "bg-blue-50 text-blue-700" :
                  "bg-slate-100 text-slate-500"
                }`}>
                  {activeStage.status?.charAt(0).toUpperCase() + activeStage.status?.slice(1)}
                </span>
              </div>
            </div>

            {/* Stage Evaluation Summary */}
            {(() => {
              const evals = activeStage.application_stage_evaluations;
              const evalData = Array.isArray(evals) ? evals[0] : evals;
              if (!evalData) return null;
              return (
                <div className="mt-4 pt-4 border-t border-cerulean-900 grid grid-cols-3 gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Recommendation</span>
                    <p className={`text-sm font-bold mt-0.5 ${
                      evalData.recommendation === "proceed" ? "text-emerald-700" :
                      evalData.recommendation === "review" ? "text-amber-700" : "text-red-700"
                    }`}>
                      {evalData.recommendation?.charAt(0).toUpperCase() + evalData.recommendation?.slice(1) || "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Confidence</span>
                    <p className="text-sm font-bold text-slate-700 mt-0.5">
                      {evalData.confidence != null ? `${Math.round(Number(evalData.confidence) * 100)}%` : "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Questions</span>
                    <p className="text-sm font-bold text-slate-700 mt-0.5">{activeStage.questions?.length || 0}</p>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Questions */}
          <div className="space-y-3">
            {activeStage.questions.map((q, i) => (
              <ExpandableQuestion key={q.id} question={q} index={i} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
