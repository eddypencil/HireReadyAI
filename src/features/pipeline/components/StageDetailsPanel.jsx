// src\features\pipeline\components\StageDetailsPanel.jsx
import React, { useState, useEffect } from "react";
import { STAGE_TYPE_OPTIONS, STAGE_LIBRARY } from "../constants/stageLibrary";
import { useTranslation } from "react-i18next";
import {
  Save,
  Settings,
  Crown,
  Plus,
  X,
  Loader2,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { generateEvaluationCriteria } from "../services/pipeline.service";

// Stage types with AI evaluation criteria
const AI_STAGE_TYPES = new Set([
  "hr_interview",
  "technical_interview",
  "assessment",
  "assessment_test",
  "coding_test",
]);

export default function StageDetailsPanel({
  stage,
  stages,
  onUpdate,
  isCompanyPremium,
}) {
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

  // Evaluation criteria local state
  const [localCriteria, setLocalCriteria] = useState([]);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [criteriaHasChanges, setCriteriaHasChanges] = useState(false);
  const [newConceptInputs, setNewConceptInputs] = useState({});

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
      // Load evaluation criteria
      setLocalCriteria(
        Array.isArray(stage.evaluation_criteria)
          ? stage.evaluation_criteria
          : [],
      );
      setCriteriaHasChanges(false);
      setNewConceptInputs({});
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
      // Include criteria if there are criteria changes too
      const payload = criteriaHasChanges
        ? { ...updateData, evaluation_criteria: localCriteria }
        : updateData;
      await onUpdate(stage.id, payload);
      setHasChanges(false);
      setCriteriaHasChanges(false);
    } catch (err) {
      console.error("Failed to save stage:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // ── Criteria helpers ────────────────────────────────────────────────────────
  const weightTotal = localCriteria.reduce(
    (s, c) => s + (Number(c.weight) || 0),
    0,
  );
  const weightValid = weightTotal === 100;
  const hasZeroWeight = localCriteria.some((c) => Number(c.weight) === 0);

  const updateCriterion = (idx, field, value) => {
    setLocalCriteria((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, [field]: value } : c)),
    );
    setCriteriaHasChanges(true);
  };

  const deleteCriterion = (idx) => {
    setLocalCriteria((prev) => prev.filter((_, i) => i !== idx));
    setCriteriaHasChanges(true);
  };

  const addCriterion = () => {
    setLocalCriteria((prev) => [
      ...prev,
      {
        competency: "",
        weight: 0,
        required: true,
        min_questions: 1,
        concepts: [],
      },
    ]);
    setCriteriaHasChanges(true);
  };

  const addConcept = (idx) => {
    const val = (newConceptInputs[idx] || "").trim();
    if (!val) return;
    setLocalCriteria((prev) =>
      prev.map((c, i) =>
        i === idx ? { ...c, concepts: [...(c.concepts || []), val] } : c,
      ),
    );
    setNewConceptInputs((prev) => ({ ...prev, [idx]: "" }));
    setCriteriaHasChanges(true);
  };

  const removeConcept = (cIdx, conceptIdx) => {
    setLocalCriteria((prev) =>
      prev.map((c, i) =>
        i === cIdx
          ? { ...c, concepts: c.concepts.filter((_, ci) => ci !== conceptIdx) }
          : c,
      ),
    );
    setCriteriaHasChanges(true);
  };

  const handleRegenerate = async () => {
    if (
      !window.confirm(t("stage_details.evaluation_criteria.regenerate_confirm"))
    )
      return;
    setIsRegenerating(true);
    try {
      const newCriteria = await generateEvaluationCriteria(stage.id);
      setLocalCriteria(newCriteria || []);
      setCriteriaHasChanges(false);
    } catch (err) {
      console.error("Regenerate criteria failed:", err);
    } finally {
      setIsRegenerating(false);
    }
  };

  const maxWeightForIndex = (idx) => {
    const othersTotal = localCriteria.reduce(
      (s, c, i) => (i === idx ? s : s + (Number(c.weight) || 0)),
      0,
    );
    return Math.max(0, 100 - othersTotal);
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
              <option
                key={opt.value}
                value={opt.value}
                className="dark:bg-slate-800"
              >
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
        {/* <div>
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
        </div> */}

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
            {t("stage_details.fields.num_questions", {
              defaultValue: "Number of Questions",
            })}
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
            placeholder={t("stage_details.placeholders.num_questions", {
              defaultValue: "Enter number of questions…",
            })}
          />
        </div>

        {/* Evaluation Criteria Editor — only for AI stage types */}
        {AI_STAGE_TYPES.has(form.stage_type) && (
          <div className="space-y-3 pt-4 border-t border-border">
            {/* Header row */}
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  {t("stage_details.evaluation_criteria.title")}
                </p>
                <p className="text-[10px] text-muted-foreground/70 truncate">
                  {t("stage_details.evaluation_criteria.subtitle")}
                </p>
              </div>
              <button
                onClick={handleRegenerate}
                disabled={isRegenerating || stage.is_locked}
                className="shrink-0 flex items-center gap-1 px-2 py-1.5 text-[10px] font-semibold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                title={t("stage_details.evaluation_criteria.regenerate")}
              >
                {isRegenerating ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <RefreshCw className="w-3 h-3" />
                )}
                {isRegenerating
                  ? t("stage_details.evaluation_criteria.regenerating")
                  : t("stage_details.evaluation_criteria.regenerate")}
              </button>
            </div>

            {/* Weight total badge */}
            {localCriteria.length > 0 && (
              <div
                className={`flex items-center justify-between px-3 py-1 rounded-lg border text-[11px] font-bold ${
                  weightValid
                    ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400"
                    : "bg-destructive/10 border-destructive/20 text-destructive"
                }`}
              >
                <span>
                  {t("stage_details.evaluation_criteria.weight_total")}
                </span>
                <span>{weightTotal} / 100</span>
              </div>
            )}

            {/* Competency list */}
            {localCriteria.length === 0 ? (
              <p className="text-xs text-muted-foreground italic text-center py-4">
                {t("stage_details.evaluation_criteria.empty")}
              </p>
            ) : (
              <div className="space-y-3">
                {localCriteria.map((criterion, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-card shadow-sm border border-border/80 rounded-xl space-y-3 relative"
                  >
                    {/* Header Row: Competency Name + Delete Button */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-1.5">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                          {t(
                            "stage_details.evaluation_criteria.competency_name",
                            { defaultValue: "Competency Name" },
                          )}
                        </label>
                        <input
                          type="text"
                          value={criterion.competency}
                          disabled={stage.is_locked}
                          onChange={(e) =>
                            updateCriterion(idx, "competency", e.target.value)
                          }
                          className="w-full px-3 py-2 text-sm bg-surface dark:bg-slate-800/60 border border-border rounded-lg text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all disabled:opacity-60"
                          placeholder="e.g. Problem Solving"
                        />
                      </div>

                      <button
                        onClick={() => deleteCriterion(idx)}
                        disabled={stage.is_locked}
                        className="mt-6 p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                        title={t(
                          "stage_details.evaluation_criteria.delete_competency",
                        )}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {Number(criterion.weight) === 0 && (
                      <div className="flex items-center gap-1.5 px-3 py-2 bg-warning/10 border border-warning/20 text-warning rounded-lg text-xs font-medium">
                        <AlertTriangle className="w-4 h-4" />
                        {t(
                          "stage_details.evaluation_criteria.weight_zero_warning",
                        )}
                      </div>
                    )}

                    {/* Weight & Settings stacked vertically */}
                    <div className="space-y-3 p-3 bg-secondary/30 rounded-lg border border-border/50">
                      {/* Weight slider - full width */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                            Weight
                          </label>
                          <span className="text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                            {criterion.weight}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max={
                            maxWeightForIndex(idx) + Number(criterion.weight)
                          }
                          step="1"
                          value={Number(criterion.weight)}
                          disabled={stage.is_locked}
                          onChange={(e) =>
                            updateCriterion(
                              idx,
                              "weight",
                              parseInt(e.target.value),
                            )
                          }
                          className="w-full h-1.5 accent-primary bg-surface border border-border rounded cursor-pointer disabled:opacity-50"
                        />
                      </div>

                      {/* Required */}
                      <div className="pt-1 border-t border-border/40">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={criterion.required}
                            disabled={stage.is_locked}
                            onChange={(e) =>
                              updateCriterion(idx, "required", e.target.checked)
                            }
                            className="w-4 h-4 accent-primary rounded cursor-pointer"
                          />
                          <span className="text-xs font-semibold text-muted-foreground">
                            {t(
                              "stage_details.evaluation_criteria.required_label",
                            )}
                          </span>
                        </label>
                      </div>

                      {/* Min Qs alone */}
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={criterion.min_questions}
                          disabled={stage.is_locked}
                          onChange={(e) =>
                            updateCriterion(
                              idx,
                              "min_questions",
                              parseInt(e.target.value) || 1,
                            )
                          }
                          className="w-14 px-2 py-1 text-xs text-center bg-surface border border-border rounded-lg font-bold focus:outline-none focus:ring-1 focus:ring-primary/40 disabled:opacity-60"
                        />
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                          Min Qs
                        </label>
                      </div>
                    </div>

                    {/* Bottom Row: Concepts */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                        {t("stage_details.evaluation_criteria.concepts_label")}
                      </p>

                      <div className="flex flex-wrap gap-1.5">
                        {(criterion.concepts || []).map((concept, ci) => (
                          <span
                            key={ci}
                            className="flex items-center gap-1 px-2 py-0.5 bg-primary/5 hover:bg-primary/10 border border-primary/20 text-primary rounded-md text-[11px] font-medium transition-colors"
                          >
                            {concept}
                            {!stage.is_locked && (
                              <button
                                onClick={() => removeConcept(idx, ci)}
                                className="text-primary/50 hover:text-destructive rounded-sm transition-colors cursor-pointer"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            )}
                          </span>
                        ))}
                      </div>

                      {!stage.is_locked && (
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={newConceptInputs[idx] || ""}
                            onChange={(e) =>
                              setNewConceptInputs((prev) => ({
                                ...prev,
                                [idx]: e.target.value,
                              }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                addConcept(idx);
                              }
                            }}
                            className="min-w-0 flex-1 px-2 py-1 text-[11px] bg-surface dark:bg-slate-800/60 border border-border rounded-md text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 font-medium transition-all"
                            placeholder={t(
                              "stage_details.evaluation_criteria.add_concept_placeholder",
                            )}
                          />
                          <button
                            onClick={() => addConcept(idx)}
                            className="flex items-center justify-center w-7 h-6 bg-secondary text-foreground hover:bg-secondary/80 border border-border rounded-md transition-colors cursor-pointer shrink-0"
                            title="Add concept"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add competency button */}
            {!stage.is_locked && localCriteria.length < 4 && (
              <button
                onClick={addCriterion}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-bold text-primary bg-primary/5 hover:bg-primary/10 border-2 border-primary/20 border-dashed rounded-lg transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                {t("stage_details.evaluation_criteria.add_competency")}
              </button>
            )}

            {/* Weight error */}
            {criteriaHasChanges && !weightValid && (
              <p className="text-xs text-destructive font-semibold">
                {t("stage_details.evaluation_criteria.weight_error")}
              </p>
            )}
          </div>
        )}

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
              <span className="text-xs text-muted-foreground font-medium">
                {label}
              </span>
              <div className="w-8 h-4 bg-secondary-foreground/20 dark:bg-slate-700 rounded-full border border-border dark:border-slate-600" />
            </div>
          ))}
        </div>
      </div>

      {/* Save Button Interactive Footer */}
      <div className="px-5 py-4 border-t border-border bg-surface flex gap-2 sticky bottom-0">
        <button
          onClick={handleSave}
          disabled={
            (!hasChanges && !criteriaHasChanges) ||
            stage.is_locked ||
            isSaving ||
            (criteriaHasChanges && (!weightValid || hasZeroWeight))
          }
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 focus:outline-hidden focus:ring-2 focus:ring-primary/40 disabled:bg-secondary dark:disabled:bg-slate-800 disabled:text-muted-foreground/40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <Save className="w-4 h-4 stroke-[2.2]" />
          {isSaving
            ? t("stage_details.actions.saving", { defaultValue: "Saving..." })
            : t("stage_details.actions.save", { defaultValue: "Save Changes" })}
        </button>
      </div>
    </div>
  );
}
