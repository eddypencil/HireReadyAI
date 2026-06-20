import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ItemDialog({
  open,
  onClose,
  title,
  children,
  onSave,
  saving,
}) {
  if (!open) return null;
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-background rounded-2xl border border-border/60 shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 shrink-0">
          <h2 className="text-base font-bold text-foreground">{title}</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-4 overflow-y-auto flex-1">{children}</div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border/60 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-muted-foreground border border-border/70 rounded-lg hover:bg-secondary/50 transition-colors"
          >
            {t("avatar_modal.cancel")}
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {saving
              ? t("job_detail_header.saving")
              : t("job_detail_header.save")}
          </button>
        </div>
      </div>
    </div>
  );
}
