import { XCircle, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ToastNotification({ toast, onDismiss }) {
  const navigate = useNavigate();
  if (!toast) return null;

  const handleClick = () => {
    if (toast.route) {
      navigate(toast.route);
      onDismiss?.();
    }
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200 ${toast.route ? "cursor-pointer" : ""}`}
      onClick={handleClick}
      title={toast.route ? "Click to view" : undefined}
    >
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
        {toast.route && (
          <span className="ml-1 text-xs opacity-60 underline underline-offset-2">View</span>
        )}
      </div>
    </div>
  );
}
