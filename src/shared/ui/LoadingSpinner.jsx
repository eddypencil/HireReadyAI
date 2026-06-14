import { useTranslation } from "react-i18next";
export default function LoadingSpinner({ message }) {
  const { t } = useTranslation();
  const text = message || t("common.loading");
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-muted relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 30% 30%, rgba(15,41,74,0.04), transparent 60%),
            radial-gradient(circle at 70% 70%, rgba(15,41,74,0.03), transparent 55%)
          `,
        }}
      />
      <div className="relative z-10 bg-card border border-border rounded-xl shadow-sm flex flex-col items-center gap-4 px-10 py-8 w-full max-w-[260px]">
        <div className="size-9 rounded-full border-3 border-muted border-t-primary animate-spin" />
        <p className="text-muted-foreground font-medium text-xs text-center">
          {text}
        </p>
      </div>
    </div>
  );
}
