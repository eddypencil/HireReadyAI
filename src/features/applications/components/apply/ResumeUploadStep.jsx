import { useTranslation } from "react-i18next";

export default function ResumeUploadStep({ form, errors, onChange, clearFieldError }) {
  const { t } = useTranslation();

  return (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
        {t("apply_job.labels.resume")} *
      </label>
      <label
        className={`block border border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
          errors.resume
            ? "border-destructive/60 bg-destructive/5"
            : "border-border bg-card hover:border-accent/40 hover:bg-surface-hover"
        }`}
      >
        <input
          type="file"
          accept=".pdf"
          hidden
          onChange={(e) => {
            onChange("resume", e.target.files[0]);
            if (errors.resume) clearFieldError("resume");
          }}
        />
        <p className="text-sm text-foreground font-semibold">
          {form.resume
            ? form.resume.name
            : t("apply_job.placeholders.upload_resume")}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {t("apply_job.placeholders.drag_drop")}
        </p>
      </label>
      {errors.resume && (
        <p className="text-xs text-destructive font-medium mt-1.5 pl-0.5">
          {errors.resume}
        </p>
      )}
    </div>
  );
}
