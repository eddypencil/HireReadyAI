import { useState, useEffect, useCallback } from "react";
import {
  getPipeline,
  createStage,
  updateStage,
  deleteStage,
  reorderStages,
} from "../services/pipeline.service";

export const usePipeline = (jobId) => {
  const [job, setJob] = useState(null);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);

  const fetchPipeline = useCallback(async () => {
    if (!jobId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getPipeline(jobId);
      setJob(data);
      // Sort stages by order_index on load
      const sorted = (data.recruitment_stages || []).sort(
        (a, b) => a.order_index - b.order_index,
      );
      setStages(sorted);
    } catch (err) {
      console.error("Failed to load pipeline:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchPipeline();
  }, [fetchPipeline]);

  // Add a stage from the library — optimistic local update then persist
  const handleAddStage = async (libraryItem) => {
    // Separate locked and unlocked stages
    const unlockedStages = stages.filter((s) => !s.is_locked);

    // Find the maximum order_index among unlocked stages
    const maxUnlockedIndex =
      unlockedStages.length > 0
        ? Math.max(...unlockedStages.map((s) => s.order_index))
        : 10; // After CV Review (10)

    // Next index is one more than the max, but cap at 9998 (before Offer at 9999)
    const nextIndex = Math.min(maxUnlockedIndex + 1, 9998);

    const totalWeight = stages.reduce(
      (sum, s) => sum + (parseFloat(s.weight) || 0),
      0,
    );
    // Use an epsilon for floating point comparison issues (e.g. 0.9000000000000001)
    const isFull = totalWeight > 0.901;
    let newWeight = isFull ? 0 : 0.1;

    if (isFull) {
      setWarning(
        "The composite weight can't exceed 100%. Stage added with 0% weight. Please free up weight from other stages to add weight to this one.",
      );
      setTimeout(() => setWarning(null), 5000);
    }

    const stageData = {
      name: libraryItem.label,
      stage_type: libraryItem.key,
      description: libraryItem.subtitle || null,
      order_index: nextIndex,
      weight: newWeight,
      pass_score: null,
      num_questions: 0,
    };

    try {
      const created = await createStage(jobId, stageData);
      setStages((prev) =>
        [...prev, created].sort((a, b) => a.order_index - b.order_index),
      );
    } catch (err) {
      console.error("Failed to add stage:", err);
      setError(err.message);
    }
  };

  // Update a stage's fields and sync local state
  const handleUpdateStage = async (stageId, updates) => {
    try {
      const updated = await updateStage(stageId, updates);
      setStages((prev) =>
        prev.map((s) => (s.id === stageId ? { ...s, ...updated } : s)),
      );
    } catch (err) {
      console.error("Failed to update stage:", err);
      setError(err.message);
    }
  };

  // Delete a stage, recompute order_index for remaining, persist via two-phase upsert (Fix 2)
  const handleDeleteStage = async (stageId) => {
    const deleted = stages.find((s) => s.id === stageId);
    const remaining = stages.filter((s) => s.id !== stageId);

    // Separate locked and unlocked stages
    const lockedStages = remaining.filter((s) => s.is_locked);
    const unlockedStages = remaining.filter((s) => !s.is_locked);

    // Reassign indices to unlocked stages starting from 11 (after CV Review at 10)
    const unlockedWithNewIndex = unlockedStages.map((s, idx) => ({
      ...s,
      order_index: 11 + idx,
    }));

    // Combine them back sorted by order_index
    const finalStages = [...lockedStages, ...unlockedWithNewIndex].sort(
      (a, b) => a.order_index - b.order_index,
    );

    // Optimistic update
    setStages(finalStages);

    try {
      await deleteStage(stageId);
      // Only reorder if there are unlocked stages that changed their indices
      if (unlockedWithNewIndex.length > 0 && !deleted.is_locked) {
        await reorderStages(unlockedWithNewIndex);
      }
    } catch (err) {
      console.error("Failed to delete stage:", err);
      setError(err.message);
      // Revert on failure
      fetchPipeline();
    }
  };

  // Reorder stages after drag-and-drop, persist with two-phase upsert (Fix 1)
  const handleReorderStages = async (reorderedList) => {
    // We only reorder the UNLOCKED stages, keeping the locked ones fixed at their indexes
    const unlockedOnly = reorderedList.filter((s) => !s.is_locked);
    const lockedOnly = stages.filter((s) => s.is_locked);

    // Assign new indexes to unlocked stages starting from 11 (after CV Review)
    const withNewIndex = unlockedOnly.map((s, idx) => ({
      ...s,
      order_index: 11 + idx,
    }));

    // Combine them back for optimistic update
    const finalStages = [...lockedOnly, ...withNewIndex].sort(
      (a, b) => a.order_index - b.order_index,
    );

    // Optimistic update
    setStages(finalStages);

    try {
      await reorderStages(withNewIndex); // Only send the changed ones
    } catch (err) {
      console.error("Failed to reorder stages:", err);
      setError(err.message);
      // Revert on failure
      fetchPipeline();
    }
  };

  return {
    job,
    stages,
    loading,
    error,
    warning,
    handleAddStage,
    handleUpdateStage,
    handleDeleteStage,
    handleReorderStages,
    refetch: fetchPipeline,
  };
};
