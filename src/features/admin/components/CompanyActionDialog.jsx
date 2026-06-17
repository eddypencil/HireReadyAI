import { useState } from "react";
import { X, Loader2, ShieldAlert } from "lucide-react";

const actionOptions = [
  { value: "warn", label: "Warn" },
  { value: "closing_warning", label: "Schedule Closure (7 days)" },
  { value: "ban", label: "Ban" },
  { value: "active", label: "Set Active" },
];

export default function CompanyActionDialog({ company, onClose, onApply, initialActionType = "" }) {
  const [actionType, setActionType] = useState(initialActionType);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!actionType) return;
    setSubmitting(true);
    try {
      await onApply({ actionType, reason });
      onClose();
    } catch (err) {
      console.error("Action failed:", err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" />
            Company Action — {company?.name}
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted text-muted-foreground cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Action Type</label>
            <select
              value={actionType}
              onChange={(e) => setActionType(e.target.value)}
              required
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="">Select action...</option>
              {actionOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {actionType === "closing_warning" && (
              <p className="text-[10px] text-warning">
                Sets closing_deadline = now + 7 days. Company members will see a warning banner.
              </p>
            )}
            {actionType === "ban" && (
              <p className="text-[10px] text-destructive">
                Immediately bans the company and closes all active job postings.
              </p>
            )}
            {actionType === "active" && (
              <p className="text-[10px] text-success">
                Reinstates the company to active status and clears warning/ban state.
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Reason</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for this action..."
              rows={3}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 rounded-xl text-xs font-semibold bg-muted text-muted-foreground hover:bg-muted/80 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !actionType}
              className="flex-1 h-10 rounded-xl text-xs font-semibold text-white bg-primary hover:bg-primary-hover transition-colors disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ShieldAlert className="w-3.5 h-3.5" />
              )}
              {submitting ? "Applying..." : "Apply"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
