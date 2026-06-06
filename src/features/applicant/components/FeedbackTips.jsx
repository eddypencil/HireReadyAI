// /components/applicant/FeedbackTips.jsx

export default function FeedbackTips() {
  return (
    <div className="bg-background rounded-2xl border border-border p-7 shadow-xs space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-sidebar">
          Feedback & tips
        </h2>

        <p className="text-sm text-muted-foreground/80 mt-1">
          From your last submission
        </p>
      </div>

      <div className="p-4 rounded-xl border border-border bg-secondary/60">
        <div className="flex items-center gap-2">
          <span className="text-accent text-sm font-bold tracking-wide">
            87%
          </span>

          <span className="text-sm font-semibold text-sidebar">
            Strong pattern recognition
          </span>
        </div>

        <p className="text-xs text-muted-foreground mt-1">
          You scored in the top 15% for logical sequences.
        </p>
      </div>

      <div className="p-4 rounded-xl border border-border bg-background">
        <div className="flex items-center gap-2">
          <span className="text-accent text-sm font-bold">
            Pacing
          </span>

          <span className="text-sm font-medium text-sidebar/80">
            could improve
          </span>
        </div>

        <p className="text-xs text-muted-foreground mt-1">
          Try not to spend more than 90s per question on the next test.
        </p>
      </div>
    </div>
  );
}