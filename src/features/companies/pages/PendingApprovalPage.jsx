import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, ArrowLeft, LogOut, XCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { logOut } from "@/features/auth/services/auth.service";
import { useTranslation } from "react-i18next";
import { useUser } from "@/features/auth/context/user.context";
import { removeCompanyMember } from "@/features/admin/services/admin.service";

export default function PendingApprovalPage({ companyName, companyId }) {
  const { t } = useTranslation();
  const { profile } = useUser();
  const navigate = useNavigate();
  const [dismissing, setDismissing] = useState(false);

  async function handleDismiss() {
    if (!profile?.id || !companyId) return;
    setDismissing(true);
    try {
      await removeCompanyMember(profile.id, companyId);
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Failed to dismiss membership:", err);
    } finally {
      setDismissing(false);
    }
  }

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-background border-b border-border/60 px-5 py-3 flex items-center justify-between shrink-0 shadow-xs"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
            <Clock className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            HireReadyAI
          </span>
        </div>
        <button
          onClick={logOut}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground bg-background border border-border rounded-md hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          {t("no_company_view.sign_out")}
        </button>
      </motion.header>

      <main className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-warning/20 rounded-full flex items-center justify-center mx-auto mb-5">
            <Clock className="w-8 h-8 text-warning" />
          </div>
          <h1 className="text-xl font-bold text-foreground mb-2">
            {t("pending_approval.title")}
          </h1>
          <p className="text-sm text-muted-foreground mb-1">
            {t("pending_approval.subtitle", {
              company: companyName || "the company",
            })}
          </p>
          <p className="text-xs text-muted-foreground/70 mb-6">
            {t("pending_approval.contact_hr")}
          </p>
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-md text-xs font-medium hover:bg-primary/90 transition-colors cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {t("pending_approval.back_to_home")}
            </button>
            <button
              onClick={handleDismiss}
              disabled={dismissing}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-destructive/10 text-destructive rounded-md text-xs font-medium hover:bg-destructive/20 transition-colors cursor-pointer disabled:opacity-50"
            >
              {dismissing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <XCircle className="w-3.5 h-3.5" />
              )}
              Dismiss Request
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
