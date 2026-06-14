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
} from "lucide-react";

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
  const generatingRef = useRef(false);

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
    <div className="min-h-screen bg-secondary/40 flex flex-col">
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
          </div>
        </div>
      </header>

      {/* ── Content ─────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center px-4 sm:px-6 py-6 sm:py-10">
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
                        className={`h-full rounded-full transition-all ${
                          elapsed >= maxTime
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
                onClick={() => navigate(`/applications/${applicationId}`)}
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
    </div>
  );
}
