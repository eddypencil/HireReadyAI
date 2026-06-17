import { useState } from "react";
import { useUser } from "@/features/auth/context/user.context";
import { applyUserAction } from "../services/admin.service";
import { X, Loader2 } from "lucide-react";

const actionConfig = {
  warn: { label: "Warn User", color: "bg-warning" },
  freeze: { label: "Freeze User", color: "bg-blue-500" },
  ban: { label: "Ban User", color: "bg-destructive" },
  active: { label: "Restore User", color: "bg-success" },
};

export default function UserActionDialog({ user, actionType, onClose, onComplete }) {
  const { profile } = useUser();
  const [reason, setReason] = useState("");
  const [days, setDays] = useState("");
  const [hours, setHours] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const config = actionConfig[actionType];

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await applyUserAction({
        userId: user.id,
        actionType,
        reason,
        durationDays: actionType === "freeze" ? parseInt(days) || 0 : undefined,
        durationHours: actionType === "freeze" ? parseInt(hours) || 0 : undefined,
        adminId: profile?.id,
      });
      onComplete();
    } catch (err) {
      setError(err.message || "Failed to apply action");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
      <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-sm font-bold text-foreground">{config.label}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-muted text-muted-foreground cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="bg-muted rounded-xl p-3 space-y-1">
            <p className="text-xs font-semibold text-foreground">
              {user.full_name || "Unknown User"}
            </p>
            <p className="text-[10px] text-muted-foreground">{user.email}</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Reason</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for this action..."
              rows={3}
              required
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
          </div>

          {actionType === "freeze" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Days</label>
                <input
                  type="number"
                  min="0"
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  placeholder="0"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Hours</label>
                <input
                  type="number"
                  min="0"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  placeholder="0"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="px-3 py-2 rounded-lg text-xs text-destructive bg-destructive/10 border border-destructive/20">
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 rounded-xl text-xs font-semibold bg-muted text-muted-foreground hover:bg-muted/80 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`flex-1 h-10 rounded-xl text-xs font-semibold text-white ${config.color} hover:opacity-90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer`}
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {submitting ? "Applying..." : "Confirm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
