//src\features\interview\components\TextQuestion.jsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2, AlertCircle } from "lucide-react";

const MIN_LENGTH = 30;

export default function TextQuestion({ onAnswer }) {
  const [value, setValue] = useState("");
  const charCount = value.trim().length;
  const tooShort = charCount < MIN_LENGTH;
  const { t } = useTranslation();
  const handleSubmit = () => {
    if (tooShort) return;
    onAnswer(value.trim());
  };

  return (
    <div className="space-y-4">
      {/* Textarea */}
      <div className="relative rounded-xl border border-border bg-card shadow-md shadow-cerulean-900/10 transition-all focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Type your answer here…"
          rows={7}
          className="w-full bg-transparent px-5 py-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none resize-none leading-relaxed"
        />
      </div>

      {/* Footer row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Char counter */}
          <div
            className={[
              "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors",
              tooShort
                ? "bg-warning/10 text-warning border border-warning/20"
                : "bg-success/10 text-success border border-success/20",
            ].join(" ")}
          >
            {tooShort ? <AlertCircle className="size-3" /> : <CheckCircle2 className="size-3" />}
            <span>
              {charCount}{charCount >= MIN_LENGTH ? " chars" : ` chars (min ${MIN_LENGTH})`}
            </span>
          </div>

          {/* Word count */}
          <span className="text-xs text-muted-foreground">
            {value.trim() ? `${value.trim().split(/\s+/).length} words` : ""}
          </span>
        </div>

        <button
          onClick={handleSubmit}
          disabled={tooShort}
          className="flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <CheckCircle2 className="size-4" />
          {t("code_question.submit_answer")} →
        </button>
      </div>
    </div>
  );
}
