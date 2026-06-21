//src\features\interview\pages\interviewPage.jsx
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import VideoQuestion from "../components/VideoQuestion";
import TextQuestion from "../components/TextQuestion";
import MultipleChoiceQuestion from "../components/MultipleChoiceQuestion";
import CodeQuestion from "../components/CodeQuestion";
import {
  fetchActiveInterviewStage,
  fetchStageQuestions,
  generateNextQuestion,
} from "../services/interview.service";
import { useTranslation } from "react-i18next";
import { useUser } from "@/features/auth/context/user.context";
import { submitReport } from "@/features/admin/services/admin.service";
import {
  Loader2,
  ChevronLeft,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Clock,
  BarChart3,
  Code,
  Video,
  List,
  FileText,
  Flag,
  Send,
} from "lucide-react";
import useInterviewSecurity from "../hooks/useInterviewSecurity";
import SecurityViolationModal from "../components/SecurityViolationModal";

const PHASE = {
  INIT: "init",
  LOADING: "loading",
  ANSWERING: "answering",
  UPLOADING: "uploading",
  EVALUATING: "evaluating",
  FINISHED: "finished",
  ERROR: "error",
};

const stageTypeLabel = {
  hr_interview: "HR Interview",
  technical_interview: "Technical Interview",
  assessment: "Assessment",
  interview: "Interview",
};

function QuestionComponent({ question, applicationStageId, onAnswer, onStatusChange }) {
  const props = { question, onAnswer, onStatusChange };
  switch (question?.type) {
    case "video":
      return (
        <VideoQuestion {...props} applicationStageId={applicationStageId} />
      );
    case "multiple_choice":
      return <MultipleChoiceQuestion {...props} />;
    case "code":
      return <CodeQuestion {...props} />;
    case "text":
    default:
      return <TextQuestion {...props} />;
  }
}

function ProgressBar({ current, max }) {
  const pct = Math.min((current / max) * 100, 100);
  return (
    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
      <div
        className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function Spinner({ label, icon: Icon = Loader2 }) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-16">
      <div className="relative">
        <div className="size-14 rounded-2xl bg-primary/5 flex items-center justify-center border border-primary/10">
          <Icon className="size-6 text-primary animate-spin" />
        </div>
        <span className="absolute -top-1 -right-1 size-3 rounded-full bg-accent animate-pulse" />
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

export default function InterviewPage() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useUser();
  const [phase, setPhase] = useState(PHASE.INIT);
  const [applicationStage, setApplicationStage] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [maxQuestions, setMaxQuestions] = useState(8);
  // eslint-disable-next-line no-unused-vars
  const [sessionSummary, setSessionSummary] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [maxTime, setMaxTime] = useState(null);
  const [timeExceeded, setTimeExceeded] = useState(false);
  const [showReportMenu, setShowReportMenu] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);
  const [reportSubject, setReportSubject] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [reportError, setReportError] = useState(null);
  const generatingRef = useRef(false);

  // ── Interview Security ───────────────────────────────────────────────────
  // Activates on ANSWERING / UPLOADING phases to:
  //  - Block copy/cut/paste/selection/right-click
  //  - Block Ctrl+C/V/X/A/S/P
  //  - Detect tab-switch, blur, fullscreen-exit, possible devtools
  //  - Force fullscreen
  //  - Track violations with local persistence + optional backend sync
  // When max violations (3) is reached the interview is terminated.
  const {
    violationCount,
    showWarning,
    currentViolation,
    securityRef,
    dismissWarning,
  } = useInterviewSecurity({
    stageId: applicationStage?.id ?? null,
    isActive: phase === PHASE.ANSWERING || phase === PHASE.UPLOADING,
    maxViolations: 3,
    onMaxReached: () => {
      setPhase(PHASE.ERROR);
      setErrorMsg(
        "Your interview has been terminated due to repeated security violations.",
      );
    },
  });

  const requestNextQuestion = async (
    stageId,
    previousAnswer,
    currentAnsweredCount,
  ) => {
    if (generatingRef.current) return;
    generatingRef.current = true;
    setPhase(previousAnswer ? PHASE.EVALUATING : PHASE.LOADING);
    setElapsed(0);
    setTimeExceeded(false);
    setMaxTime(null);

    try {
      const result = await generateNextQuestion(stageId, previousAnswer);

      if (result.isFinal) {
        setSessionSummary(result.stageSummary);
        setPhase(PHASE.FINISHED);
        return;
      }

      setCurrentQuestion(result.question);
      setMaxTime(result.question?.maxTime ?? 180);
      setQuestionNumber(
        result.question?.orderIndex ?? currentAnsweredCount + 1,
      );
      setPhase(PHASE.ANSWERING);
    } catch (err) {
      console.error("generate-question error:", err);
      setErrorMsg(err.message ?? "Failed to generate interview question.");
      setPhase(PHASE.ERROR);
    } finally {
      generatingRef.current = false;
    }
  };

  useEffect(() => {
    if (!applicationId) return;
    (async () => {
      try {
        const stage = await fetchActiveInterviewStage(applicationId);
        if (!stage) {
          setErrorMsg(t("interview_page.errors.no_active_stage"));
          setPhase(PHASE.ERROR);
          return;
        }

        setApplicationStage(stage);
        const mq = stage.recruitment_stages?.num_questions ?? 8;
        setMaxQuestions(mq);

        const existingQuestions = await fetchStageQuestions(stage.id);

        const hasAnswer = (q) => {
          const ans = q.application_answers;
          if (!ans) return false;
          if (Array.isArray(ans))
            return ans.length > 0 && ans[0]?.answer_text != null;
          return ans.answer_text != null;
        };

        const getAnswerText = (q) => {
          const ans = q.application_answers;
          if (!ans) return null;
          if (Array.isArray(ans)) return ans[0]?.answer_text ?? null;
          return ans.answer_text ?? null;
        };

        const answered = existingQuestions.filter(hasAnswer);
        const unanswered = existingQuestions.find((q) => !hasAnswer(q));

        if (existingQuestions.length === 0) {
          await requestNextQuestion(stage.id, null, 0);
        } else if (unanswered) {
          setCurrentQuestion({
            id: unanswered.id,
            text: unanswered.question_text,
            type: unanswered.question_type,
            options: unanswered.generation_context?.options ?? null,
            language: unanswered.generation_context?.language ?? null,
            maxTime: unanswered.generation_context?.max_time ?? 180,
            orderIndex: unanswered.order_index,
          });
          setMaxTime(unanswered.generation_context?.max_time ?? 180);
          setQuestionNumber(unanswered.order_index ?? answered.length + 1);
          setPhase(PHASE.ANSWERING);
        } else {
          const lastAnswered = answered[answered.length - 1];
          const lastAnswerText = getAnswerText(lastAnswered);
          await requestNextQuestion(
            stage.id,
            { questionId: lastAnswered.id, answerText: lastAnswerText ?? "" },
            answered.length,
          );
        }
      } catch (err) {
        console.error("Interview init error:", err);
        setErrorMsg(err.message ?? t("interview_page.errors.load_failed"));
        setPhase(PHASE.ERROR);
      }
    })();
  }, [applicationId, t]);

  useEffect(() => {
    if (phase !== PHASE.ANSWERING) return;
    const interval = setInterval(() => {
      setElapsed((p) => p + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  // Auto-submit if max_time is exceeded
  useEffect(() => {
    if (phase !== PHASE.ANSWERING || !maxTime || elapsed < maxTime) return;

    if (!timeExceeded) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTimeExceeded(true);
      // Auto-submit with empty answer if time exceeded
      // eslint-disable-next-line react-hooks/immutability
      handleAnswer("");
    }
  }, [elapsed, maxTime, phase, timeExceeded]);

  const handleAnswer = async (answerText) => {
    if (!currentQuestion || !applicationStage) return;
    await requestNextQuestion(
      applicationStage.id,
      {
        questionId: currentQuestion.id,
        answerText,
        timeTaken: elapsed, // Include time taken
      },
      questionNumber,
    );
  };

  const handleStatusChange = (status) => {
    if (status === "uploading") setPhase(PHASE.UPLOADING);
  };

  const stage = applicationStage?.recruitment_stages;
  const stageLabel =
    stageTypeLabel[stage?.stage_type] ?? stage?.name ?? "Interview";

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-secondary/40 flex flex-col" ref={securityRef}>
      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between h-14 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="size-8 rounded-lg border border-border flex items-center justify-center hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="size-4" />
            </button>
            <div className="size-8 rounded-lg bg-sidebar flex items-center justify-center">
              <span className="text-white text-sm font-bold font-display">
                H
              </span>
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-xs text-muted-foreground leading-tight">
                Interview Session
              </span>
              <span className="text-[11px] font-medium text-foreground/80">
                {stage?.name ?? ""}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {(phase === PHASE.ANSWERING || phase === PHASE.UPLOADING) && (
              <>
                <div className="hidden sm:flex items-center gap-2 text-xs">
                  <Clock className="size-3.5" />
                  <div className="flex items-center gap-1 font-mono">
                    <span
                      className={
                        elapsed >= maxTime
                          ? "text-destructive font-semibold"
                          : elapsed >= (maxTime || 0) * 0.8
                            ? "text-warning font-semibold"
                            : "text-muted-foreground"
                      }
                    >
                      {formatTime(elapsed)}
                    </span>
                    {maxTime && (
                      <>
                        <span className="text-muted-foreground/40">/</span>
                        <span className="text-muted-foreground">
                          {formatTime(maxTime)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="w-32 sm:w-48">
                  <ProgressBar current={questionNumber} max={maxQuestions} />
                </div>
              </>
            )}
            <span className="rounded-full border px-3 py-0.5 text-[11px] font-medium bg-primary/10 text-primary border-primary/20 whitespace-nowrap">
              {stageLabel}
            </span>
            <div className="relative">
              <button
                onClick={() => setShowReportMenu(true)}
                className="size-8 rounded-lg border border-border flex items-center justify-center hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-colors text-muted-foreground cursor-pointer"
              >
                <Flag className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Content ─────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center px-4 sm:px-6 py-6 sm:py-10 bg-muted ">
        <div className="w-full max-w-4xl space-y-5">
          {/* INIT / LOADING */}
          {(phase === PHASE.INIT || phase === PHASE.LOADING) && (
            <div className="bg-card rounded-2xl border border-border shadow-lg shadow-primary/10 p-8">
              <Spinner label="Preparing your interview…" />
            </div>
          )}

          {/* EVALUATING */}
          {phase === PHASE.EVALUATING && (
            <div className="bg-card rounded-2xl border border-border shadow-lg shadow-primary/10 p-8">
              <Spinner label="Evaluating your answer…" icon={BarChart3} />
              <div className="flex items-center justify-center gap-2 mt-2">
                <div className="flex gap-1">
                  <span
                    className="size-1.5 rounded-full bg-primary animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="size-1.5 rounded-full bg-primary animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="size-1.5 rounded-full bg-primary animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
                <span className="text-[11px] text-muted-foreground">
                  Generating next question
                </span>
              </div>
            </div>
          )}

          {/* ANSWERING / UPLOADING */}
          {(phase === PHASE.ANSWERING || phase === PHASE.UPLOADING) && currentQuestion && (
            <>
              {/* Question header card */}
              <div className="bg-card rounded-2xl border border-border shadow-lg shadow-primary/10 p-5 sm:p-6 space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex items-center gap-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold px-3 py-1 border border-primary/15">
                    <HelpCircle className="size-3" />Q{questionNumber} /{" "}
                    {maxQuestions}
                  </span>
                  <span className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground capitalize">
                    {currentQuestion.type === "code" ? (
                      <Code className="size-4" />
                    ) : currentQuestion.type === "video" ? (
                      <Video className="size-4" />
                    ) : currentQuestion.type === "multiple_choice" ? (
                      <List className="size-4" />
                    ) : (
                      <FileText className="size-4" />
                    )}
                    {currentQuestion.type.replace("_", " ")}
                  </span>
                </div>
                <h2 className="font-display text-lg sm:text-xl font-semibold text-foreground leading-snug">
                  {currentQuestion.text}
                </h2>
              </div>

              {/* Answer card */}
              <div className="bg-card rounded-2xl border border-border shadow-lg shadow-primary/10 p-5 sm:p-6">
                <QuestionComponent
                  question={currentQuestion}
                  applicationStageId={applicationStage?.id}
                  onAnswer={handleAnswer}
                  onStatusChange={handleStatusChange}
                />
              </div>

              {/* Footer context with timer */}
              <div className="flex items-center justify-between px-1 gap-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="size-3.5" />
                  <span className="font-mono">{formatTime(elapsed)}</span>
                  {maxTime && (
                    <>
                      <span className="text-muted-foreground/50">/</span>
                      <span className="font-mono">{formatTime(maxTime)}</span>
                    </>
                  )}
                </div>
                {maxTime && (
                  <div className="flex items-center gap-2 flex-1 max-w-xs">
                    <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${elapsed >= maxTime
                          ? "bg-destructive"
                          : elapsed >= maxTime * 0.8
                            ? "bg-warning"
                            : "bg-primary"
                          }`}
                        style={{
                          width: `${Math.min((elapsed / maxTime) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    {elapsed >= maxTime && (
                      <span className="text-[10px] font-semibold text-destructive whitespace-nowrap">
                        Time's up
                      </span>
                    )}
                  </div>
                )}
                <span className="text-xs text-muted-foreground text-right">
                  {maxQuestions - questionNumber > 0
                    ? t("interview_page.progress.remaining", {
                      count: maxQuestions - questionNumber,
                    })
                    : t("interview_page.progress.final")}
                </span>
              </div>
            </>
          )}

          {/* FINISHED */}
          {phase === PHASE.FINISHED && (
            <div className="bg-card rounded-2xl border border-border shadow-lg shadow-primary/10 p-6 sm:p-8 space-y-6 sm:space-y-8 text-center">
              {/* Icon */}
              <div className="flex justify-center">
                <div className="size-16 rounded-2xl bg-success/10 flex items-center justify-center border border-success/20">
                  <CheckCircle2 className="size-8 text-success" />
                </div>
              </div>

              {/* Heading */}
              <div className="space-y-2">
                <h2 className="font-display text-2xl font-semibold text-foreground">
                  {t("interview_page.finished.title")}
                </h2>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                  Your responses have been submitted and evaluated. The hiring
                  team will review the results.
                </p>
              </div>

              {/* Score */}

              <button
                onClick={() => navigate("/applicant")}
                className="w-full max-w-md bg-primary text-white rounded-xl px-4 py-3 text-sm font-medium hover:opacity-90 transition-all shadow-lg shadow-primary/30"
              >
                {t("interview_page.finished.back_to_application")}
              </button>
            </div>
          )}

          {/* ERROR */}
          {phase === PHASE.ERROR && (
            <div className="bg-card rounded-2xl border border-border shadow-lg shadow-primary/10 p-6 sm:p-8 space-y-6 text-center max-w-lg mx-auto">
              <div className="size-14 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto border border-destructive/20">
                <AlertCircle className="size-7 text-destructive" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-display text-lg font-semibold text-foreground">
                  {t("interview_page.errors.title")}
                </h3>
                <p className="text-sm text-muted-foreground">{errorMsg}</p>
              </div>
              <button
                onClick={() => navigate(-1)}
                className="border border-border bg-card text-foreground rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-secondary transition-colors"
              >
                {t("interview_page.errors.go_back")}
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Security violation warning modal */}
      <SecurityViolationModal
        open={showWarning}
        onDismiss={dismissWarning}
        violation={currentViolation}
        violationCount={violationCount}
        maxViolations={3}
      />

      {/* Report modal */}
      {showReportMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
          <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-sm mx-4">

            {!reportTarget ? (
              <>
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <h3 className="text-sm font-bold text-foreground">Report</h3>
                  <button
                    onClick={() => setShowReportMenu(false)}
                    className="p-1 rounded-lg hover:bg-muted text-muted-foreground cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-3 space-y-2">
                  {applicationStage && (
                    <button
                      onClick={() => {
                        setReportTarget("interview");
                        setReportSubject("");
                        setReportDescription("");
                        setReportError(null);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors cursor-pointer text-left"
                    >
                      <Flag className="w-4 h-4 shrink-0" />
                      Report this Interview
                    </button>
                  )}
                  {currentQuestion && (
                    <button
                      onClick={() => {
                        setReportTarget("question");
                        setReportSubject("");
                        setReportDescription("");
                        setReportError(null);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors cursor-pointer text-left"
                    >
                      <Flag className="w-4 h-4 shrink-0" />
                      Report this Question
                    </button>
                  )}
                  {!applicationStage && !currentQuestion && (
                    <p className="px-3 py-6 text-sm text-muted-foreground text-center">
                      No active content to report
                    </p>
                  )}
                  <button
                    onClick={() => setShowReportMenu(false)}
                    className="w-full h-10 rounded-xl text-xs font-semibold bg-muted text-muted-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Flag className="w-4 h-4 text-destructive" />
                    <h3 className="text-sm font-bold text-foreground">
                      Report this {reportTarget === "interview" ? "Interview" : "Question"}
                    </h3>
                  </div>
                  <button
                    onClick={() => setReportTarget(null)}
                    className="p-1 rounded-lg hover:bg-muted text-muted-foreground cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!user) return;
                    setReportSubmitting(true);
                    setReportError(null);
                    try {
                      await submitReport({
                        reporterId: user.id,
                        reportType: reportTarget,
                        targetId: reportTarget === "interview" ? applicationStage?.id : currentQuestion?.id,
                        targetDetails: reportTarget === "interview"
                          ? { stage_name: stage?.name }
                          : { question_text: currentQuestion?.text },
                        subject: reportSubject,
                        description: reportDescription,
                        severity: "medium",
                      });
                      setReportSubmitted(true);
                      setReportSubject("");
                      setReportDescription("");
                      setTimeout(() => {
                        setReportSubmitted(false);
                        setReportTarget(null);
                        setShowReportMenu(false);
                      }, 1500);
                    } catch (err) {
                      setReportError(err.message || "Failed to submit report");
                    } finally {
                      setReportSubmitting(false);
                    }
                  }}
                  className="p-4 space-y-4"
                >
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Subject</label>
                    <input
                      type="text"
                      value={reportSubject}
                      onChange={(e) => setReportSubject(e.target.value)}
                      placeholder="Brief title of the issue..."
                      required
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Description</label>
                    <textarea
                      value={reportDescription}
                      onChange={(e) => setReportDescription(e.target.value)}
                      placeholder="Describe the issue in detail..."
                      required
                      rows={4}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                    />
                  </div>

                  {reportError && (
                    <div className="px-3 py-2 rounded-lg text-xs text-destructive bg-destructive/10 border border-destructive/20">
                      {reportError}
                    </div>
                  )}

                  {reportSubmitted && (
                    <div className="px-3 py-2 rounded-lg text-xs text-green-600 bg-green-100 border border-green-200 dark:text-green-400 dark:bg-green-900/20 dark:border-green-800/30">
                      Report submitted successfully.
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setReportTarget(null)}
                      className="flex-1 h-10 rounded-xl text-xs font-semibold bg-muted text-muted-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={reportSubmitting || reportSubmitted}
                      className="flex-1 h-10 rounded-xl text-xs font-semibold text-white bg-destructive hover:bg-destructive/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {reportSubmitting ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      {reportSubmitting ? "Submitting..." : reportSubmitted ? "Submitted!" : "Submit Report"}
                    </button>
                  </div>
                </form>
              </>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
