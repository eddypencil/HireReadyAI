import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useUser } from "@/features/auth/context/user.context";
import { confirmPayment } from "@/features/premium/services/premium.service";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function PremiumSuccessPage() {
  const { t } = useTranslation();

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshProfile, loading } = useUser();
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      setStatus("error");
      return;
    }

    (async () => {
      try {
        await confirmPayment(sessionId);
        await refreshProfile();
        setStatus("success");
      } catch {
        setStatus("error");
      }
    })();
  }, []);

  useEffect(() => {
    if (status === "success" && !loading) {
      const timer = setTimeout(() => {
        navigate("/companies", { replace: true });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [status, loading, navigate]);

  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
      <div className="text-center max-w-sm mx-auto px-6">
        {status === "loading" && (
          <>
            <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
            <h1 className="text-lg font-bold text-foreground mb-1">
              {t("premium.loading_title")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("premium.loading_description")}
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
            <h1 className="text-lg font-bold text-foreground mb-1">
              {t("premium.success_title")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("premium.success_description")}
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h1 className="text-lg font-bold text-foreground mb-1">
              {t("premium.error_title")}
            </h1>
            <p className="text-sm text-muted-foreground mb-6">
              {t("premium.error_description")}
            </p>
            <button
              onClick={() => navigate("/companies", { replace: true })}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors cursor-pointer"
            >
              {t("premium.back_to_dashboard")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
