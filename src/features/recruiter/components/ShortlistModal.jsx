import { Sparkles, X, Loader2 } from "lucide-react";

export default function ShortlistModal({
  onClose,
  criteria,
  setCriteria,
  minScore,
  setMinScore,
  scoreReasoning,
  generatingCriteria,
  onAutoGenerate,
  advancingToShortlist,
  onRunEvaluation,
  selectedJobId,
}) {
  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/40">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-foreground text-lg">
              AI Shortlist Advancement
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground rounded-lg p-1 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Evaluation Criteria Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                Evaluation Criteria
              </label>
              <button
                onClick={onAutoGenerate}
                disabled={generatingCriteria || !selectedJobId}
                className="flex items-center gap-1.5 text-[11px] font-bold text-primary bg-primary/10 border border-primary/20 hover:bg-primary/15 px-2.5 py-1.5 rounded-lg transition-all disabled:opacity-50 cursor-pointer"
              >
                {generatingCriteria ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3" />
                )}
                Auto-generate from JD
              </button>
            </div>

            <textarea
              value={criteria}
              onChange={(e) => setCriteria(e.target.value)}
              placeholder="Describe the skills, experience levels, or qualifications required for shortlisting..."
              className="w-full h-32 px-3 py-2 text-sm text-foreground bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/40 resize-none"
            />
          </div>

          {/* Min Score Range Slider */}
          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                Min Score
              </label>
              <span className="text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-lg">
                {minScore}
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary border border-border focus:outline-none [&::-webkit-slider-runnable-track]:bg-muted [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
            />
          </div>

          {scoreReasoning && (
            <div className="p-3 bg-primary/5 border border-primary/10 rounded-xl text-xs text-muted-foreground animate-fade-in">
              <span className="font-bold text-primary block mb-0.5">
                AI Suggestion Note:
              </span>
              {scoreReasoning}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3 bg-muted/20">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-border rounded-xl transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onRunEvaluation}
            disabled={!criteria.trim() || advancingToShortlist}
            className="px-5 py-2 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-xl shadow-xs transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            {advancingToShortlist && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            Run Evaluation
          </button>
        </div>
      </div>
    </div>
  );
}
