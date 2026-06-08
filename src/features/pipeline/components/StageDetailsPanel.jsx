//src\features\pipeline\components\StageDetailsPanel.jsx
import React, { useState, useEffect } from "react";
import { STAGE_TYPE_OPTIONS } from "../constants/stageLibrary";
import { useTranslation } from "react-i18next";
import { Save } from "lucide-react";

export default function StageDetailsPanel({ stage, stages, onUpdate }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    name: "",
    stage_type: "",
    weight: 1,
    description: "",
    num_questions: 0,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Sync local form state when selected stage changes
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
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
          <span className="text-gray-400 text-lg">⚙</span>
        </div>
        <p className="text-sm font-medium text-gray-600 mb-1">
          {" "}
          {t("stage_details.title")}
        </p>
        <p className="text-xs text-gray-400">
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
      // Explicitly exclude order_index to prevent unique constraint violations
      const { order_index, ...updateData } = form;
      await onUpdate(stage.id, updateData);
      setHasChanges(false);
    } catch (err) {
      console.error("Failed to save stage:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const weightPct = Math.round((form.weight ?? 0) * 100);

  // Calculate maximum allowed weight for this stage based on other stages
  const totalOtherWeights = (stages || [])
    .filter((s) => s.id !== stage.id)
    .reduce((sum, s) => sum + (parseFloat(s.weight) || 0), 0);

  // Use a tiny epsilon offset because of floating point math (e.g. 0.8 + 0.2000000000000001)
  const maxAllowedWeight = Math.max(
    0,
    Math.round((1 - totalOtherWeights) * 100) / 100,
  );

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-gray-100">
        <p className="text-[10px] font-semibold text-dark-amethyst-600 tracking-widest uppercase mb-0.5">
          {t("stage_details.title")}
        </p>
        <p className="text-sm font-semibold text-gray-900 leading-tight truncate flex items-center gap-1.5">
          {form.name || t("stage_details.untitled_stage")}
          {stage.is_locked && (
            <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-medium">
              {t("stage_details.locked")}
            </span>
          )}
        </p>
        <p className="text-xs text-gray-400 truncate">
          {form.stage_type?.replace(/_/g, " ")}
        </p>
      </div>

      <div className="flex-1 px-5 py-5 space-y-5">
        {/* Stage Name */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            {t("stage_details.fields.stage_name")}
          </label>
          <input
            type="text"
            value={form.name}
            disabled={stage.is_locked}
            onChange={(e) => handleChange("name", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-amethyst-400 focus:border-transparent transition-shadow disabled:bg-gray-50 disabled:text-gray-500"
          />
        </div>

        {/* Stage Type */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            {t("stage_details.fields.stage_type")}
          </label>
          <select
            value={form.stage_type}
            disabled={stage.is_locked}
            onChange={(e) => handleChange("stage_type", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-amethyst-400 focus:border-transparent transition-shadow disabled:bg-gray-50 disabled:text-gray-500 cursor-pointer disabled:cursor-not-allowed"
          >
            <option value="">
              {" "}
              {t("stage_details.placeholders.select_type")}
            </option>
            {STAGE_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
            {stage.is_locked &&
              !STAGE_TYPE_OPTIONS.some((o) => o.value === form.stage_type) && (
                <option value={form.stage_type}>
                  {form.stage_type.replace(/_/g, " ")}
                </option>
              )}
            {stage.is_locked &&
              !STAGE_TYPE_OPTIONS.some((o) => o.value === form.stage_type) && (
                <option value={form.stage_type}>
                  {form.stage_type.replace(/_/g, " ")}
                </option>
              )}
          </select>
        </div>

        {/* Weight */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-gray-600">
              {t("stage_details.fields.weight")}
            </label>
            <span className="text-xs font-bold text-dark-amethyst-600">
              {weightPct}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max={maxAllowedWeight}
            step="0.01"
            value={form.weight ?? 0}
            onChange={(e) => handleWeightChange(e.target.value)}
            className="w-full h-1.5 accent-dark-amethyst-600 cursor-pointer"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            {t("stage_details.fields.description")}
          </label>
          <textarea
            rows={3}
            value={form.description}
            disabled={stage.is_locked}
            onChange={(e) => handleChange("description", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-amethyst-400 focus:border-transparent transition-shadow resize-none disabled:bg-gray-50 disabled:text-gray-500"
            placeholder={t("stage_details.placeholders.description")}
          />
        </div>

        {/* Number of Questions */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Number of Questions
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
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-amethyst-400 focus:border-transparent transition-shadow disabled:bg-gray-50 disabled:text-gray-500"
            placeholder="Enter number of questions…"
          />
        </div>

        {/* Number of Questions */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Number of Questions
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
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-amethyst-400 focus:border-transparent transition-shadow disabled:bg-gray-50 disabled:text-gray-500"
            placeholder="Enter number of questions…"
          />
        </div>

        {/* Out-of-scope fields — rendered disabled as placeholders */}
        <div className="space-y-3 pt-2 border-t border-gray-100">
          <p className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase">
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
              className="flex items-center justify-between opacity-40 cursor-not-allowed"
            >
              <span className="text-xs text-gray-500">{label}</span>
              <div className="w-8 h-4 bg-gray-200 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Save Button Footer */}
      <div className="px-5 py-4 border-t border-gray-100 bg-white flex gap-2">
        <button
          onClick={handleSave}
          disabled={!hasChanges || stage.is_locked || isSaving}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-dark-amethyst-600 text-white text-sm font-semibold rounded-lg hover:bg-dark-amethyst-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <Save className="w-4 h-4" />
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
