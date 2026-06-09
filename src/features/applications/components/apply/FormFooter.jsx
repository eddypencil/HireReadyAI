import { useTranslation } from "react-i18next";

export default function FormFooter({ currentStep, totalSteps, onBack, onNext, onSubmit, loading }) {
  const { t } = useTranslation();

  return (
    <div className="p-4 border-t border-border flex justify-between bg-card">
      {currentStep > 0 ? (
        <button
          className="px-3.5 py-1.5 rounded-lg border border-border text-foreground font-semibold bg-card hover:bg-surface-hover transition-colors text-sm cursor-pointer select-none"
          onClick={onBack}
        >
          {t("apply_job.buttons.back")}
        </button>
      ) : (
        <div />
      )}

      {currentStep < totalSteps - 1 ? (
        <button
          className="px-4 py-1.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors cursor-pointer select-none"
          onClick={onNext}
        >
          {t("apply_job.buttons.next")}
        </button>
      ) : (
        <button
          onClick={onSubmit}
          disabled={loading}
          className="px-4 py-1.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50 cursor-pointer select-none"
        >
          {loading
            ? t("apply_job.buttons.submitting")
            : t("apply_job.buttons.submit")}
        </button>
      )}
    </div>
  );
}
