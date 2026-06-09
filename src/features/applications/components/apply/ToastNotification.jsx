import { XCircle, CheckCircle } from "lucide-react";

export default function ToastNotification({ toast }) {
  if (!toast) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
      <div
        className={`px-3.5 py-2 rounded-xl shadow-xs text-sm font-semibold border flex items-center gap-2 ${
          toast.type === "success"
            ? "bg-success/10 text-success border-success/20"
            : "bg-destructive/10 text-destructive border-destructive/20"
        }`}
      >
        {toast.type === "success" ? (
          <CheckCircle size={16} />
        ) : (
          <XCircle size={16} />
        )}
        <span>{toast.message}</span>
      </div>
    </div>
  );
}
