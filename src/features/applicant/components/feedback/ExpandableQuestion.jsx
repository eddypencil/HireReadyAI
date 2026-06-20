import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronDown,
  FileText,
  Video,
  Code,
  ListChecks,
  Clock,
  MessageSquare,
  Check,
  X,
  Sparkles,
} from "lucide-react";
import { useTranslation } from "react-i18next";
const TYPE_ICONS = {
  video: Video,
  text: FileText,
  code: Code,
  multiple_choice: ListChecks,
};
const TYPE_LABELS = {
  video: "Video Response",
  text: "Written Answer",
  code: "Code Challenge",
  multiple_choice: "Multiple Choice",
};
const TYPE_ICON_BG = {
  video: "bg-rose-50 text-rose-600",
  code: "bg-indigo-50 text-indigo-600",
  multiple_choice: "bg-amber-50 text-amber-600",
  text: "bg-surface-muted text-accent",
};

export default function ExpandableQuestion({ question, index }) {
  const [expanded, setExpanded] = useState(false);
  const answer = question.application_answers;
  const answerData = Array.isArray(answer) ? answer[0] : answer;
  const context = question.generation_context || {};
  const options = context.options || [];
  const language = context.language || null;
  const Icon = TYPE_ICONS[question.question_type] || FileText;
  const typeLabel =
    TYPE_LABELS[question.question_type] || question.question_type;
  const iconBg =
    TYPE_ICON_BG[question.question_type] || "bg-surface-muted text-accent";
  const { t } = useTranslation();
  return (
    <motion.div
      className="bg-card border border-border rounded-xl shadow-sm"
      layout
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-30px" }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: "easeOut" }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-surface-hover transition-colors"
      >
        <div className={`p-2 rounded-lg ${iconBg}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
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
                    ? "bg-accent/10 text-accent"
                    : answerData.score >= 40
                      ? "bg-amber-50 text-amber-700"
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

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="answer-content"
            className="border-t border-border px-5 py-4 space-y-4 bg-surface-muted"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <div>
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                {t("questions.answer")}
              </h4>

              {question.question_type === "video" && (
                <div className="space-y-3">
                  {answerData?.recording_url ? (
                    <video
                      src={answerData.recording_url}
                      controls
                      className="w-full rounded-xl border border-border max-h-[320px] bg-black"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground/60 italic p-3 bg-card rounded-xl">
                      <Video className="w-4 h-4" />
                      {t("questions.noVideo")}
                    </div>
                  )}
                  {answerData?.transcript && (
                    <div className="bg-card border border-border rounded-xl p-4">
                      <div className="flex items-center gap-1.5 mb-2">
                        <MessageSquare className="w-3.5 h-3.5 text-muted-foreground/60" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                          {t("questions.transcript")}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                        {answerData.transcript}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {question.question_type === "text" && (
                <div className="bg-card border border-border rounded-xl p-4">
                  <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                    {answerData?.answer_text || t("questions.noTextAnswer")}
                  </p>
                </div>
              )}

              {question.question_type === "code" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {language && (
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-indigo-50 text-indigo-700 uppercase">
                        {language}
                      </span>
                    )}
                    {context.code_type && (
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-surface-muted text-accent">
                        {context.code_type === "visuals"
                          ? "UI / Visual"
                          : "Problem Solving"}
                      </span>
                    )}
                  </div>
                  {answerData?.answer_text ? (
                    <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto text-sm font-mono leading-relaxed whitespace-pre-wrap text-foreground">
                      <code>{answerData.answer_text}</code>
                    </pre>
                  ) : (
                    <p className="text-sm text-muted-foreground/60 italic p-3 bg-card rounded-xl">
                      {t("questions.noCode")}
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
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border ${
                              isSelected
                                ? "bg-accent/10 border-accent/30 text-accent font-medium"
                                : "bg-card border-border text-muted-foreground"
                            }`}
                          >
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                isSelected
                                  ? "bg-accent text-white"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {letter}
                            </span>
                            <span>{opt}</span>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 ml-auto text-accent" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {(!answerData?.answer_text ||
                    answerData.answer_text === "") && (
                    <p className="text-sm text-muted-foreground/60 italic p-3 bg-card rounded-xl">
                      {t("questions.noSelected")}
                    </p>
                  )}
                </div>
              )}
            </div>

            {(answerData?.feedback ||
              answerData?.strengths?.length > 0 ||
              answerData?.weaknesses?.length > 0) && (
              <div className="bg-gradient-to-br from-accent/5 to-primary/5 rounded-xl border border-accent/10 p-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                  <span className="text-[10px] font-bold text-accent uppercase tracking-wider">
                    {t("questions.aiFeedback")}
                  </span>
                </div>
                {answerData.feedback && (
                  <p className="text-sm text-foreground/80 leading-relaxed mb-3">
                    {answerData.feedback}
                  </p>
                )}
                {answerData.strengths?.length > 0 && (
                  <div className="mb-2">
                    <span className="text-[10px] font-bold text-success uppercase tracking-wider block mb-1">
                      {t("questions.strengths")}
                    </span>
                    <ul className="space-y-1">
                      {answerData.strengths.map((s, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-1.5 text-xs text-success"
                        >
                          <Check className="w-3 h-3 mt-0.5 shrink-0" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {answerData.weaknesses?.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-destructive uppercase tracking-wider block mb-1">
                      {t("questions.weaknesses")}
                    </span>
                    <ul className="space-y-1">
                      {answerData.weaknesses.map((w, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-1.5 text-xs text-destructive"
                        >
                          <X className="w-3 h-3 mt-0.5 shrink-0" />
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
              (!answerData?.weaknesses ||
                answerData.weaknesses.length === 0) && (
                <p className="text-xs text-muted-foreground/60 italic">
                  {t("questions.noFeedback")}
                </p>
              )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
