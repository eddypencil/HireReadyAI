import { useState } from "react";
import { useTranslation } from "react-i18next";
import { X, Loader2, ShieldAlert } from "lucide-react";

const actionOptions = [
  { value: "warn", labelKey: "admin.companies.warn" },
  { value: "closing_warning", labelKey: "admin.companies.close" },
  { value: "ban", labelKey: "admin.companies.ban" },
  { value: "active", labelKey: "admin.companies.restore" },
];

export default function CompanyActionDialog({ company, onClose, onApply, initialActionType = "" }) {
  const { t } = useTranslation();
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
            {t("admin.company_action.title", { name: company?.name })}
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted text-muted-foreground cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">{t("admin.company_action.action_type")}</label>
            <select
              value={actionType}
              onChange={(e) => setActionType(e.target.value)}
              required
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="">{t("admin.company_action.select_action")}</option>
              {actionOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {t(opt.labelKey)}
                </option>
              ))}
            </select>
            {actionType === "closing_warning" && (
              <p className="text-[10px] text-warning">
                {t("admin.company_action.closing_hint")}
              </p>
            )}
            {actionType === "ban" && (
              <p className="text-[10px] text-destructive">
                {t("admin.company_action.ban_hint")}
              </p>
            )}
            {actionType === "active" && (
              <p className="text-[10px] text-success">
                {t("admin.company_action.active_hint")}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">{t("admin.reason")}</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t("admin.company_action.reason_placeholder")}
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
              {t("admin.company_action.cancel")}
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
              {submitting ? t("admin.company_action.applying") : t("admin.company_action.apply")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
