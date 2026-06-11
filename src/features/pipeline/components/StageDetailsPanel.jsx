// src\features\pipeline\components\StageDetailsPanel.jsx
import React, { useState, useEffect } from "react";
import { STAGE_TYPE_OPTIONS, STAGE_LIBRARY } from "../constants/stageLibrary";
import { useTranslation } from "react-i18next";
import { Save, Settings, Crown } from "lucide-react";

export default function StageDetailsPanel({ stage, stages, onUpdate, isCompanyPremium }) {
  const { t } = useTranslation();

  const premiumKeys = new Set(
    STAGE_LIBRARY.filter((s) => s.isPremium).map((s) => s.key),
  );
  const filteredOptions = STAGE_TYPE_OPTIONS.filter(
    (opt) => isCompanyPremium || !premiumKeys.has(opt.value),
  );
  const [form, setForm] = useState({
    name: "",
    stage_type: "",
    weight: 1,
    description: "",
    num_questions: 0,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (stage) {
      setForm({
        name: stage.name || "",
        stage_type: stage.stage_type || "",
        weight: stage.weight ?? 1,
        description: stage.description || "",
        num_questions: stage.num_questions || 0,
      });
      setHasChanges(false);
    }
  }, [stage]);

  if (!stage) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6 bg-surface">
        <div className="w-12 h-12 bg-secondary dark:bg-slate-800 rounded-xl flex items-center justify-center mb-4 border border-border dark:border-slate-700">
          <Settings className="text-muted-foreground w-5 h-5 animate-spin-slow" />
        </div>
        <p className="text-sm font-bold text-foreground mb-1">
          {t("stage_details.title")}
        </p>
        <p className="text-xs text-muted-foreground max-w-[220px] leading-relaxed">
          {t("stage_details.empty_description")}
        </p>
      </div>
    );
  }

  const handleChange = (field, value) => {
    const updated = { ...form, [field]: value };
    setForm(updated);
    setHasChanges(true);
  };

  const handleWeightChange = (value) => {
    const numVal = parseFloat(value);
    handleChange("weight", numVal);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { ...updateData } = form;
      await onUpdate(stage.id, updateData);
      setHasChanges(false);
    } catch (err) {
      console.error("Failed to save stage:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const weightPct = Math.round((form.weight ?? 0) * 100);

  const totalOtherWeights = (stages || [])
    .filter((s) => s.id !== stage.id)
    .reduce((sum, s) => sum + (parseFloat(s.weight) || 0), 0);

  const maxAllowedWeight = Math.max(
    0,
    Math.round((1 - totalOtherWeights) * 100) / 100,
  );

  return (
    <div
      className="flex flex-col h-full overflow-y-auto bg-surface border-l border-border
        [&::-webkit-scrollbar]:w-1.5
        [&::-webkit-scrollbar-track]:bg-transparent
        [&::-webkit-scrollbar-thumb]:rounded-full
        [&::-webkit-scrollbar-thumb]:bg-gray-200
        dark:[&::-webkit-scrollbar-thumb]:bg-slate-800
        dark:[&::-webkit-scrollbar-thumb]:hover:bg-slate-700"
    >
      {/* Header Panel Layer */}
      <div className="px-5 pt-5 pb-4 border-b border-border bg-surface sticky top-0 z-10">
        <p className="text-[10px] font-bold text-primary tracking-widest uppercase mb-1">
          {t("stage_details.title")}
        </p>
        <p className="text-sm font-bold text-foreground leading-tight truncate flex items-center gap-1.5">
          {form.name || t("stage_details.untitled_stage")}
          {stage.is_locked && (
            <span className="text-[10px] bg-secondary dark:bg-slate-800 border border-border dark:border-slate-700 text-muted-foreground px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
              {t("stage_details.locked")}
            </span>
          )}
        </p>
        <p className="text-xs text-muted-foreground font-medium mt-0.5 truncate capitalize">
          {form.stage_type?.replace(/_/g, " ")}
        </p>
      </div>

      <div className="flex-1 px-5 py-5 space-y-5">
        {/* Stage Name Section */}
        <div>
          <label className="block text-xs font-bold text-muted-foreground mb-1.5">
            {t("stage_details.fields.stage_name")}
          </label>
          <input
            type="text"
            value={form.name}
            disabled={stage.is_locked}
            onChange={(e) => handleChange("name", e.target.value)}
            className="w-full px-3 py-2 text-sm bg-surface dark:bg-slate-800/50 border border-border dark:border-slate-700/60 rounded-lg text-foreground placeholder-muted-foreground/50 focus:outline-hidden focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all disabled:bg-secondary/60 dark:disabled:bg-slate-800/30 disabled:text-muted-foreground/60 disabled:cursor-not-allowed font-medium"
          />
        </div>

        {/* Stage Type Config */}
        <div>
          <label className="block text-xs font-bold text-muted-foreground mb-1.5">
            {t("stage_details.fields.stage_type")}
          </label>
          <select
            value={form.stage_type}
            disabled={stage.is_locked}
            onChange={(e) => handleChange("stage_type", e.target.value)}
            className="w-full px-3 py-2 text-sm bg-surface dark:bg-slate-800/50 border border-border dark:border-slate-700/60 rounded-lg text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all disabled:bg-secondary/60 dark:disabled:bg-slate-800/30 disabled:text-muted-foreground/60 cursor-pointer disabled:cursor-not-allowed font-medium"
          >
            <option value="">
              {t("stage_details.placeholders.select_type")}
            </option>
            {filteredOptions.map((opt) => (
              <option key={opt.value} value={opt.value} className="dark:bg-slate-800">
                {opt.label}
                {premiumKeys.has(opt.value) ? " ★" : ""}
              </option>
            ))}
            {stage.is_locked &&
              !filteredOptions.some((o) => o.value === form.stage_type) && (
                <option value={form.stage_type} className="dark:bg-slate-800">
                  {form.stage_type.replace(/_/g, " ")}
                </option>
              )}
          </select>
        </div>

        {/* Dynamic Weight Range Slider */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-muted-foreground">
              {t("stage_details.fields.weight")}
            </label>
            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
              {weightPct}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max={maxAllowedWeight}
            step="0.01"
            value={form.weight ?? 0}
            disabled={stage.is_locked}
            onChange={(e) => handleWeightChange(e.target.value)}
            className="w-full h-1.5 accent-primary bg-secondary dark:bg-slate-800 border border-border dark:border-slate-700 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Text Description Box */}
        <div>
          <label className="block text-xs font-bold text-muted-foreground mb-1.5">
            {t("stage_details.fields.description")}
          </label>
          <textarea
            rows={3}
            value={form.description}
            disabled={stage.is_locked}
            onChange={(e) => handleChange("description", e.target.value)}
            className="w-full px-3 py-2 text-sm bg-surface dark:bg-slate-800/50 border border-border dark:border-slate-700/60 rounded-lg text-foreground placeholder-muted-foreground/50 focus:outline-hidden focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all resize-none disabled:bg-secondary/60 dark:disabled:bg-slate-800/30 disabled:text-muted-foreground/60 disabled:cursor-not-allowed font-medium"
            placeholder={t("stage_details.placeholders.description")}
          />
        </div>

        {/* Dynamic Number of Questions Input */}
        <div>
          <label className="block text-xs font-bold text-muted-foreground mb-1.5">
            {t("stage_details.fields.num_questions", { defaultValue: "Number of Questions" })}
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={form.num_questions || 0}
            disabled={stage.is_locked}
            onChange={(e) =>
              handleChange("num_questions", parseInt(e.target.value) || 0)
            }
            className="w-full px-3 py-2 text-sm bg-surface dark:bg-slate-800/50 border border-border dark:border-slate-700/60 rounded-lg text-foreground placeholder-muted-foreground/50 focus:outline-hidden focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all disabled:bg-secondary/60 dark:disabled:bg-slate-800/30 disabled:text-muted-foreground/60 disabled:cursor-not-allowed font-medium"
            placeholder={t("stage_details.placeholders.num_questions", { defaultValue: "Enter number of questions…" })}
          />
        </div>

        {/* Out-of-scope Advanced Toggles */}
        <div className="space-y-3 pt-4 border-t border-border">
          <p className="text-[10px] font-bold text-muted-foreground/60 tracking-widest uppercase">
            {t("stage_details.advanced.title")}
          </p>
          {[
            t("stage_details.advanced.ai_evaluation"),
            t("stage_details.advanced.manual_review"),
            t("stage_details.advanced.auto_advance"),
            t("stage_details.advanced.auto_reject"),
          ].map((label) => (
            <div
              key={label}
              className="flex items-center justify-between opacity-40 cursor-not-allowed select-none"
            >
              <span className="text-xs text-muted-foreground font-medium">{label}</span>
              <div className="w-8 h-4 bg-secondary-foreground/20 dark:bg-slate-700 rounded-full border border-border dark:border-slate-600" />
            </div>
          ))}
        </div>
      </div>

      {/* Save Button Interactive Footer */}
      <div className="px-5 py-4 border-t border-border bg-surface flex gap-2 sticky bottom-0">
        <button
          onClick={handleSave}
          disabled={!hasChanges || stage.is_locked || isSaving}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-lg hover:bg-primary/90 focus:outline-hidden focus:ring-2 focus:ring-primary/40 disabled:bg-secondary dark:disabled:bg-slate-800 disabled:text-muted-foreground/40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <Save className="w-4 h-4 stroke-[2.2]" />
          {isSaving ? t("stage_details.actions.saving", { defaultValue: "Saving..." }) : t("stage_details.actions.save", { defaultValue: "Save Changes" })}
        </button>
      </div>
    </div>
  );
}