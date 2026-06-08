//src\features\interview\components\MultipleChoiceQuestion.jsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2, HelpCircle } from "lucide-react";

export default function MultipleChoiceQuestion({ question, onAnswer }) {
  const [selected, setSelected] = useState(null);
  const options = question?.options ?? [];
  const { t } = useTranslation();
  const handleSubmit = () => {
    if (selected === null) return;
    onAnswer(selected);
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-3">
        {options.map((opt, idx) => {
          const letter = String.fromCharCode(65 + idx);
          const isSelected = selected === opt;
          return (
            <button
              key={idx}
              onClick={() => setSelected(opt)}
              className={[
                "group relative w-full text-left rounded-xl border px-5 py-4 text-sm transition-all flex items-start gap-4",
                isSelected
                  ? "border-primary bg-primary/6 shadow-sm shadow-primary/20"
                  : "border-border bg-card hover:border-primary/30 hover:bg-secondary/50 hover:shadow-md hover:shadow-cerulean-900/10",
              ].join(" ")}
            >
              {/* Radio indicator */}
              <span
                className={[
                  "flex-none size-7 rounded-lg text-xs font-semibold flex items-center justify-center mt-0.5 transition-all",
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/40"
                    : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary",
                ].join(" ")}
              >
                {isSelected ? <CheckCircle2 className="size-4" /> : letter}
              </span>

              {/* Option text */}
              <span className="leading-snug pt-0.5 text-foreground">{opt}</span>

              {/* Active indicator line */}
              <span
                className={[
                  "absolute bottom-0 left-4 right-4 h-0.5 rounded-full transition-all",
                  isSelected ? "bg-primary scale-x-100" : "scale-x-0",
                ].join(" ")}
              />
            </button>
          );
        })}
      </div>

      {/* Status + Submit */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
          <HelpCircle className="size-3.5" />
          {selected !== null ? "Answer selected" : "Select one option"}
        </span>
        <button
          onClick={handleSubmit}
          disabled={selected === null}
          className="flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <CheckCircle2 className="size-4" />
          {t("code_question.submit_answer")} →
        </button>
      </div>
    </div>
  );
}
