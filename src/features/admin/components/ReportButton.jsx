import { useState } from "react";
import { useUser } from "@/features/auth/context/user.context";
import { submitReport } from "../services/admin.service";
import { Flag, Loader2, Send } from "lucide-react";

export default function ReportButton({
  reportType,
  targetId,
  targetDetails,
  variant = "icon",
  label = "Report",
  className = "",
}) {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setError(null);

    try {
      await submitReport({
        reporterId: user.id,
        reportType,
        targetId,
        targetDetails,
        subject,
        description,
        severity: "medium",
      });
      setSubmitted(true);
      setSubject("");
      setDescription("");
      setTimeout(() => {
        setSubmitted(false);
        setOpen(false);
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to submit report");
    } finally {
      setSubmitting(false);
    }
  }

  if (!user) return null;

  return (
    <>
      {variant === "icon" ? (
        <button
          onClick={() => setOpen(true)}
          className={`p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer ${className}`}
          title={label}
        >
          <Flag className="w-4 h-4" />
        </button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors cursor-pointer ${className}`}
        >
          <Flag className="w-3 h-3" />
          {label}
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
          <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-destructive" />
                <h3 className="text-sm font-bold text-foreground">
                  Report {reportType}
                </h3>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief title of the issue..."
                  required
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the issue in detail..."
                  required
                  rows={4}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                />
              </div>

              {error && (
                <div className="px-3 py-2 rounded-lg text-xs text-destructive bg-destructive/10 border border-destructive/20">
                  {error}
                </div>
              )}

              {submitted && (
                <div className="px-3 py-2 rounded-lg text-xs text-success bg-success/10 border border-success/20">
                  Report submitted successfully.
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 h-10 rounded-xl text-xs font-semibold bg-muted text-muted-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || submitted}
                  className="flex-1 h-10 rounded-xl text-xs font-semibold text-white bg-destructive hover:bg-destructive/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  {submitting ? "Submitting..." : submitted ? "Submitted!" : "Submit Report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
