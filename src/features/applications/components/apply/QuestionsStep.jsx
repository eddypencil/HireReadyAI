import { ClipboardList } from "lucide-react";
import QuestionCard from "./QuestionCard";

export default function QuestionsStep({ questions, answers, errors, onAnswer }) {
  if (!questions || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 bg-surface-muted rounded-xl border border-border">
        <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
          <ClipboardList size={24} className="text-primary" />
        </div>
        <p className="text-sm font-semibold text-foreground">No questions for this job</p>
        <p className="text-xs text-muted-foreground mt-1 text-center">
          The employer hasn't added any screening questions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1 bg-surface-muted p-4 rounded-xl border border-border">
      {questions.map((q) => (
        <QuestionCard
          key={q.id}
          question={q}
          value={answers[q.id]}
          error={errors[`question_${q.id}`]}
          onChange={(val) => onAnswer(q.id, val)}
        />
      ))}
    </div>
  );
}
