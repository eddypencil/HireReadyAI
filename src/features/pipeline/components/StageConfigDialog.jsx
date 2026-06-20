// src/features/pipeline/components/StageConfigDialog.jsx
import { useState } from "react";
import { X, Sparkles, Loader2, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

// Stage types that require num_questions field
const QUESTION_STAGE_TYPES = new Set([
  "hr_interview", "technical_interview",
  "assessment", "assessment_test", "coding_test",
]);

export default function StageConfigDialog({ libraryItem, onConfirm, onCancel }) {
  const { t } = useTranslation();

  const [form, setForm] = useState({
    name: libraryItem?.label ?? "",
    description: "",
    num_questions: 5,
    pass_score: 70,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [criteriaState, setCriteriaState] = useState("idle"); // idle | generating | warning
  const [errors, setErrors] = useState({});

  const needsQuestions = QUESTION_STAGE_TYPES.has(libraryItem?.key);

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = t("stage_config_dialog.errors.name_required");
    if (!form.description.trim()) next.description = t("stage_config_dialog.errors.description_required");
    if (needsQuestions && (!form.num_questions || form.num_questions < 1)) {
      next.num_questions = t("stage_config_dialog.errors.num_questions_min");
    }
    if (form.pass_score < 0 || form.pass_score > 100) {
      next.pass_score = t("stage_config_dialog.errors.pass_score_range");
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      await onConfirm(libraryItem, {
        name: form.name.trim(),
        description: form.description.trim(),
        num_questions: needsQuestions ? Number(form.num_questions) : null,
        pass_score: Number(form.pass_score),
      }, setCriteriaState);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") onCancel();
    if (e.key === "Enter" && e.target.tagName !== "TEXTAREA" && !isSubmitting) handleSubmit();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                {t("stage_config_dialog.title")}
              </h2>
              <p className="text-xs text-muted-foreground font-medium">
                {libraryItem?.label}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
            aria-label={t("stage_config_dialog.buttons.cancel")}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-4">
          {/* Stage Name */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1.5">
              {t("stage_config_dialog.fields.name")}
              <span className="text-destructive ml-0.5">*</span>
            </label>
            <input
              id="stage-config-name"
              type="text"
              value={form.name}
              onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
              className={`w-full px-3 py-2 text-sm bg-surface dark:bg-slate-800/50 border rounded-lg text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all font-medium ${errors.name ? "border-destructive/60" : "border-border dark:border-slate-700/60"}`}
              placeholder={libraryItem?.label}
              autoFocus
            />
            {errors.name && <p className="text-xs text-destructive mt-1 font-medium">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1.5">
              {t("stage_config_dialog.fields.description")}
              <span className="text-destructive ml-0.5">*</span>
            </label>
            <textarea
              id="stage-config-description"
              rows={3}
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              className={`w-full px-3 py-2 text-sm bg-surface dark:bg-slate-800/50 border rounded-lg text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all resize-none font-medium ${errors.description ? "border-destructive/60" : "border-border dark:border-slate-700/60"}`}
              placeholder={t("stage_config_dialog.placeholders.description")}
            />
            {errors.description && <p className="text-xs text-destructive mt-1 font-medium">{errors.description}</p>}
          </div>

          {/* num_questions + pass_score — side by side */}
          <div className="grid grid-cols-2 gap-3">
            {needsQuestions && (
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1.5">
                  {t("stage_config_dialog.fields.num_questions")}
                  <span className="text-destructive ml-0.5">*</span>
                </label>
                <input
                  id="stage-config-num-questions"
                  type="number"
                  min={1}
                  max={30}
                  value={form.num_questions}
                  onChange={(e) => setForm(f => ({ ...f, num_questions: parseInt(e.target.value) || 1 }))}
                  className={`w-full px-3 py-2 text-sm bg-surface dark:bg-slate-800/50 border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all font-medium ${errors.num_questions ? "border-destructive/60" : "border-border dark:border-slate-700/60"}`}
                  placeholder={t("stage_config_dialog.placeholders.num_questions")}
                />
                {errors.num_questions && <p className="text-xs text-destructive mt-1 font-medium">{errors.num_questions}</p>}
              </div>
            )}
            <div className={needsQuestions ? "" : "col-span-2"}>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5">
                {t("stage_config_dialog.fields.pass_score")}
              </label>
              <input
                id="stage-config-pass-score"
                type="number"
                min={0}
                max={100}
                value={form.pass_score}
                onChange={(e) => setForm(f => ({ ...f, pass_score: parseInt(e.target.value) || 0 }))}
                className={`w-full px-3 py-2 text-sm bg-surface dark:bg-slate-800/50 border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all font-medium ${errors.pass_score ? "border-destructive/60" : "border-border dark:border-slate-700/60"}`}
                placeholder={t("stage_config_dialog.placeholders.pass_score")}
              />
              {errors.pass_score && <p className="text-xs text-destructive mt-1 font-medium">{errors.pass_score}</p>}
            </div>
          </div>

          {/* Criteria generation status */}
          {criteriaState === "generating" && (
            <div className="flex items-center gap-2.5 px-3 py-2.5 bg-primary/5 border border-primary/20 rounded-xl">
              <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" />
              <p className="text-xs text-primary font-semibold">
                {t("stage_config_dialog.generating_criteria")}
              </p>
            </div>
          )}
          {criteriaState === "warning" && (
            <div className="flex items-start gap-2.5 px-3 py-2.5 bg-warning/10 border border-warning/20 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
              <p className="text-xs text-warning font-semibold leading-relaxed">
                {t("stage_config_dialog.criteria_warning")}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 px-5 py-4 border-t border-border bg-surface">
          <button
            id="stage-config-cancel"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 text-sm font-bold text-muted-foreground bg-secondary hover:bg-secondary/80 border border-border rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("stage_config_dialog.buttons.cancel")}
          </button>
          <button
            id="stage-config-confirm"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                {t("stage_config_dialog.buttons.adding")}
              </>
            ) : (
              t("stage_config_dialog.buttons.confirm")
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
