export default function QuestionCard({ question, value, onChange, error }) {
  return (
    <div className="border border-border/80 rounded-xl p-4 bg-background space-y-2.5 shadow-xs hover:border-accent/40 transition-colors duration-200">
      <p className="font-semibold text-sidebar text-sm flex items-center gap-0.5">
        {question.question}
        <span className="text-destructive">*</span>
      </p>

      {question.type === "yes_no" && (
        <div className="flex gap-5 pt-0.5">
          <label className="flex items-center gap-2 text-sm font-medium text-sidebar cursor-pointer select-none">
            <input
              type="radio"
              className="w-4 h-4 text-primary border-border focus:ring-primary/10 accent-primary cursor-pointer"
              checked={value === "yes"}
              onChange={() => onChange("yes")}
            />
            <span>Yes</span>
          </label>

          <label className="flex items-center gap-2 text-sm font-medium text-sidebar cursor-pointer select-none">
            <input
              type="radio"
              className="w-4 h-4 text-primary border-border focus:ring-primary/10 accent-primary cursor-pointer"
              checked={value === "no"}
              onChange={() => onChange("no")}
            />
            <span>No</span>
          </label>
        </div>
      )}

      {question.type === "text" && (
        <input
          type="text"
          className={`w-full h-10 px-3 rounded-lg border text-sm font-medium bg-background text-sidebar transition-all placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary ${error ? "border-destructive focus:ring-destructive/10 focus:border-destructive" : "border-border"
            }`}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {question.type === "textarea" && (
        <textarea
          rows={3}
          className={`w-full p-3 rounded-lg border text-sm font-medium bg-background text-sidebar transition-all placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary resize-y ${error ? "border-destructive focus:ring-destructive/10 focus:border-destructive" : "border-border"
            }`}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {error && <p className="text-destructive text-xs font-medium pl-0.5 animate-in fade-in duration-150">{error}</p>}
    </div>
  );
}