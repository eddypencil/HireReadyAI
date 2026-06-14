import { useNavigate } from "react-router-dom";
import { XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
export default function PremiumCancelPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
      <div className="text-center max-w-sm mx-auto px-6">
        <XCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-lg font-bold text-foreground mb-1">
          {t("payment_cancelled")}
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          {t("cancelled_the_payment")}
        </p>
        <button
          onClick={() => navigate("/companies", { replace: true })}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors cursor-pointer"
        >
          {t("feedback.back_to_dashboard")}
        </button>
      </div>
    </div>
  );
}
