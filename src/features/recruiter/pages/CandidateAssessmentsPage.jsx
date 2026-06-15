import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Video,
  FileText,
  Code,
  ListChecks,
  Sparkles,
  Check,
  X,
  MessageSquare,
  Monitor,
  Clock,
  Brain,
} from "lucide-react";
import {
  getCandidateProfile,
  getCandidateStageQuestions,
} from "../services/candidateProfile.service";
import LoadingSpinner from "@/shared/ui/LoadingSpinner";
import { useTranslation } from "react-i18next";
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
    <div className="border-b border-border">
      <div className="flex -mb-px overflow-x-auto snap-x scrollbar-none">
        {stages.map((stage) => {
          const Icon =
            STAGE_ICONS[stage.recruitment_stages?.stage_type] || Brain;
          return (
            <button
              key={stage.id}
              onClick={() => onSelect(stage)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all shrink-0 snap-start ${
                activeStage?.id === stage.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              <Icon className="w-4 h-4" />
              {stage.recruitment_stages?.name ||
                t("candidate_assessments.unknown")}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ExpandableQuestion({ question }) {
  const [expanded, setExpanded] = useState(false);
  const answer = question.application_answers;
  const answerData = Array.isArray(answer) ? answer[0] : answer;
  const context = question.generation_context || {};
  const options = context.options || [];
  const language = context.language || null;
  const Icon = QUESTION_TYPE_ICONS[question.question_type] || FileText;
  const { t } = useTranslation();

  const typeLabel =
    QUESTION_TYPE_LABELS[question.question_type] || question.question_type;

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-xs transition-all duration-200">
      {/* Question Header (clickable) */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-muted/40 transition-colors"
      >
        <div
          className={`p-2 rounded-lg ${
            question.question_type === "video"
              ? "bg-destructive/10 text-destructive"
              : question.question_type === "code"
                ? "bg-primary/10 text-primary"
                : question.question_type === "multiple_choice"
                  ? "bg-warning/10 text-warning"
                  : "bg-accent/10 text-accent"
          }`}
        >
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-muted-foreground">
              {typeLabel}
            </span>
            {language && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-muted text-muted-foreground uppercase">
                {language}
              </span>
            )}
            {context.max_time && (
              <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground/60">
                <Clock className="w-3 h-3" />
                {context.max_time < 60
                  ? `${context.max_time}s`
                  : `${Math.round(context.max_time / 60)}m`}
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-foreground mt-0.5 line-clamp-2">
            {question.question_text}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {answerData?.score != null && (
            <span
              className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                answerData.score >= 80
                  ? "bg-success/10 text-success"
                  : answerData.score >= 60
                    ? "bg-primary/10 text-primary"
                    : answerData.score >= 40
                      ? "bg-warning/10 text-warning"
                      : "bg-destructive/10 text-destructive"
              }`}
            >
              {Math.round(answerData.score)}
            </span>
          )}
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground/60" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground/60" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-border px-5 py-4 space-y-4 bg-muted/10">
          {/* Answer Content */}
          <div>
            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
              {t("candidate_assessments.answer")}
            </h4>

            {question.question_type === "video" && (
              <div className="space-y-3">
                {context?.video_url || context?.recording_url ? (
                  <video
                    src={context.video_url || context.recording_url}
                    controls
                    className="w-full rounded-xl border border-border max-h-[320px] bg-black"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground/60 italic p-3 bg-muted/30 rounded-xl">
                    <Video className="w-4 h-4" />
                    {t("candidate_assessments.no_video")}
                  </div>
                )}
                {answerData?.answer_text && (
                  <div className="bg-surface border border-border rounded-xl p-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <MessageSquare className="w-3.5 h-3.5 text-muted-foreground/60" />
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        {t("candidate_assessments.transcript")}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                      {answerData.answer_text}
                    </p>
                  </div>
                )}
              </div>
            )}

            {question.question_type === "text" && (
              <div className="bg-surface border border-border rounded-xl p-4">
                <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {answerData?.answer_text ||
                    t("candidate_assessments.no_answer")}
                </p>
              </div>
            )}

            {question.question_type === "code" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {language && (
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-primary/10 text-primary uppercase">
                      {language}
                    </span>
                  )}
                  {context.code_type && (
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-accent/10 text-accent">
                      {context.code_type === "visuals"
                        ? t("candidate_assessments.ui_visual")
                        : t("candidate_assessments.problem_solving")}
                    </span>
                  )}
                </div>
                {answerData?.answer_text ? (
                  <pre className="bg-slate-950 dark:bg-black text-slate-100 border border-border rounded-xl p-4 overflow-x-auto text-sm font-mono leading-relaxed whitespace-pre-wrap">
                    <code>{answerData.answer_text}</code>
                  </pre>
                ) : (
                  <p className="text-sm text-muted-foreground/60 italic p-3 bg-muted/30 rounded-xl">
                    {t("candidate_assessments.no_code")}
                  </p>
                )}
              </div>
            )}

            {question.question_type === "multiple_choice" && (
              <div className="space-y-2">
                {options.length > 0 && (
                  <div className="space-y-1.5 mb-3">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                      Options
                    </span>
                    {options.map((opt, idx) => {
                      const letter = String.fromCharCode(65 + idx);
                      const isSelected = answerData?.answer_text === opt;
                      return (
                        <div
                          key={idx}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-colors ${
                            isSelected
                              ? "bg-primary/10 border-primary/30 text-primary font-medium"
                              : "bg-surface border-border text-foreground/80"
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                              isSelected
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {letter}
                          </span>
                          <span>{opt}</span>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 ml-auto text-primary" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                {(!answerData?.answer_text ||
                  answerData.answer_text === "") && (
                  <p className="text-sm text-muted-foreground/60 italic p-3 bg-muted/30 rounded-xl">
                    {t("candidate_assessments.no_selection")}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* AI Feedback */}
          {(answerData?.feedback ||
            answerData?.strengths?.length > 0 ||
            answerData?.weaknesses?.length > 0) && (
            <div className="bg-accent/5 dark:bg-accent/10 rounded-xl border border-accent/20 p-4">
              <div className="flex items-center gap-1.5 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                <span className="text-[10px] font-bold text-accent uppercase tracking-wider">
                  {t("candidate_assessments.ai_feedback")}
                </span>
              </div>
              {answerData.feedback && (
                <p className="text-sm text-foreground/90 leading-relaxed mb-3">
                  {answerData.feedback}
                </p>
              )}
              {answerData.strengths?.length > 0 && (
                <div className="mb-2">
                  <span className="text-[10px] font-bold text-success uppercase tracking-wider block mb-1">
                    {t("candidate_assessments.strengths")}
                  </span>
                  <ul className="space-y-1">
                    {answerData.strengths.map((s, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-1.5 text-xs text-foreground/80"
                      >
                        <Check className="w-3 h-3 text-success mt-0.5 shrink-0" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {answerData.weaknesses?.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-destructive uppercase tracking-wider block mb-1">
                    {t("candidate_assessments.weaknesses")}
                  </span>
                  <ul className="space-y-1">
                    {answerData.weaknesses.map((w, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-1.5 text-xs text-foreground/80"
                      >
                        <X className="w-3 h-3 text-destructive mt-0.5 shrink-0" />
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {!answerData?.feedback &&
            (!answerData?.strengths || answerData.strengths.length === 0) &&
            (!answerData?.weaknesses || answerData.weaknesses.length === 0) && (
              <p className="text-xs text-muted-foreground/60 italic">
                {t("candidate_assessments.no_ai_feedback")}
              </p>
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
  const { t } = useTranslation();
  useEffect(() => {
    if (!id) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    getCandidateProfile(id).then(async ({ data, error: err }) => {
      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
      setProfile(data);

      const allStages = (data.application_stages || []).sort(
        (a, b) =>
          (a.recruitment_stages?.order_index || 0) -
          (b.recruitment_stages?.order_index || 0),
      );
      const interviewStages = allStages.filter((s) =>
        [
          "assessment_test",
          "coding_test",
          "video_interview",
          "technical_interview",
          "hr_interview",
          "manager_interview",
          "ai_screening",
          "assessment",
        ].includes(s.recruitment_stages?.stage_type),
      );

      if (interviewStages.length === 0) {
        setStagesWithQuestions([]);
        setLoading(false);
        return;
      }

      const stageQuestions = await Promise.all(
        interviewStages.map(async (stage) => {
          const { data: questions } = await getCandidateStageQuestions(
            stage.id,
          );
          return { ...stage, questions: questions || [] };
        }),
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
        <p className="text-destructive font-medium">{error}</p>
        <Link
          to={`/companies/candidates/${id}`}
          className="text-primary hover:underline mt-4 inline-block"
        >
          &larr; {t("candidate_assessments.back_to_profile")}
        </Link>
      </div>
    );
  }

  const isEmpty =
    stagesWithQuestions.length === 0 ||
    stagesWithQuestions.every((s) => s.questions.length === 0);

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 font-sans">
      {/* Back link */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: false, margin: "-30px" }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <Link
          to={`/companies/candidates/${id}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("candidate_assessments.back_to_profile")}
        </Link>
      </motion.div>

      {/* Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, margin: "-30px" }}
        transition={{ duration: 0.5, delay: 0.05, ease: "easeOut" }}
        className="rounded-2xl bg-linear-to-br from-primary via-accent to-neutral-950 p-8 shadow-md relative overflow-hidden mb-8"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {t("candidate_assessments.title")}
            </h1>
            <p className="text-sm text-white/80 mt-1 font-medium">
              {profile?.profiles?.full_name ||
                t("candidate_assessments.candidate")}
            </p>
          </div>
          {!isEmpty && (
            <div className="text-right hidden sm:block">
              <span className="text-xs text-white bg-white/15 px-3 py-1.5 rounded-lg font-semibold">
                {stagesWithQuestions.reduce(
                  (a, s) => a + s.questions.length,
                  0,
                )}{" "}
                {t("candidate_assessments.total_questions")}
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Stage Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, margin: "-30px" }}
        transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
      >
        <StageSelector
          stages={stagesWithQuestions}
          activeStage={activeStage}
          onSelect={setActiveStage}
        />
      </motion.div>

      {isEmpty ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-30px" }}
          transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
          className="bg-surface rounded-2xl border border-border p-12 text-center mt-6"
        >
          <Brain className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-foreground mb-1">
            {t("candidate_assessments.no_assessment_data")}
          </h2>
          <p className="text-sm text-muted-foreground/60">
            {t("candidate_assessments.no_assessment_subtitle")}
          </p>
        </motion.div>
      ) : activeStage ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-30px" }}
          transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
          className="mt-6 space-y-6"
        >
          {/* Stage Header */}
          <div className="bg-surface rounded-2xl border border-border p-5 shadow-xs">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-linear-to-br from-primary to-accent text-primary-foreground">
                  {(() => {
                    const StageIcon =
                      STAGE_ICONS[activeStage.recruitment_stages?.stage_type] ||
                      Brain;
                    return <StageIcon className="w-5 h-5" />;
                  })()}
                </div>
                <div>
                  <h2 className="font-bold text-foreground">
                    {activeStage.recruitment_stages?.name}
                  </h2>
                  <p className="text-xs text-muted-foreground capitalize">
                    {activeStage.recruitment_stages?.stage_type?.replace(
                      /_/g,
                      " ",
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {activeStage.score != null && (
                  <span
                    className={`px-3 py-1 rounded-lg text-sm font-bold ${
                      activeStage.score >= 80
                        ? "bg-success/10 text-success"
                        : activeStage.score >= 60
                          ? "bg-primary/10 text-primary"
                          : "bg-warning/10 text-warning"
                    }`}
                  >
                    {Math.round(activeStage.score)}/100
                  </span>
                )}
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
                    activeStage.status === "passed"
                      ? "bg-success/10 text-success"
                      : activeStage.status === "failed"
                        ? "bg-destructive/10 text-destructive"
                        : activeStage.status === "in_progress"
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                  }`}
                >
                  {activeStage.status?.charAt(0).toUpperCase() +
                    activeStage.status?.slice(1)}
                </span>
              </div>
            </div>

            {/* Stage Evaluation Summary */}
            {(() => {
              const evals = activeStage.application_stage_evaluations;
              const evalData = Array.isArray(evals) ? evals[0] : evals;
              if (!evalData) return null;
              return (
                <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      {t("candidate_assessments.recommendation")}
                    </span>
                    <p
                      className={`text-sm font-bold mt-0.5 ${
                        evalData.recommendation === "proceed"
                          ? "text-success"
                          : evalData.recommendation === "review"
                            ? "text-warning"
                            : "text-destructive"
                      }`}
                    >
                      {evalData.recommendation?.charAt(0).toUpperCase() +
                        evalData.recommendation?.slice(1) || "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      {t("candidate_assessments.confidence")}
                    </span>
                    <p className="text-sm font-bold text-foreground/90 mt-0.5">
                      {evalData.confidence != null
                        ? `${Math.round(Number(evalData.confidence) * 100)}%`
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      {t("candidate_assessments.questions")}
                    </span>
                    <p className="text-sm font-bold text-foreground/90 mt-0.5">
                      {activeStage.questions?.length || 0}
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Questions */}
          <div className="space-y-3">
            {activeStage.questions.map((q, i) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, margin: "-30px" }}
                transition={{
                  duration: 0.35,
                  delay: 0.15 + i * 0.05,
                  ease: "easeOut",
                }}
              >
                <ExpandableQuestion question={q} index={i} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      ) : null}
    </div>
  );
}
