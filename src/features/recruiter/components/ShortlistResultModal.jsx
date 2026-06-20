import { CheckCircle2, XCircle, X } from "lucide-react";

export default function ShortlistResultModal({ result, onClose }) {
  const isSuccess = result && "passed" in result && "total" in result;

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/40">
          <h3 className="font-bold text-foreground text-lg">
            Shortlist Result
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground rounded-lg p-1 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 flex flex-col items-center text-center gap-4">
          {isSuccess ? (
            <>
              <CheckCircle2 className="w-16 h-16 text-emerald-500" />
              <div>
                <p className="text-lg font-bold text-foreground">
                  Evaluation Complete
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {result.passed}/{result.total} candidates advanced to
                  shortlist
                </p>
              </div>
            </>
          ) : (
            <>
              <XCircle className="w-16 h-16 text-red-500" />
              <div>
                <p className="text-lg font-bold text-foreground">
                  Evaluation Failed
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {result?.error || "An unexpected error occurred"}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex justify-center bg-muted/20">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
