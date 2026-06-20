// src\features\pipeline\components\StageCard.jsx
import React from "react";
import { GripVertical, Trash2, Lock } from "lucide-react";

export default function StageCard({
  stage,
  isSelected,
  onSelect,
  onDelete,
  provided,
  snapshot,
}) {
  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      style={provided.draggableProps.style}
      onClick={() => onSelect(stage)}
      className={`group relative flex items-center gap-3 rounded-xl border px-4 py-4 cursor-pointer transition-colors duration-150 select-none ${isSelected
        ? "border-primary bg-primary/10 dark:bg-primary/20 shadow-sm ring-1 ring-primary/40"
        : snapshot.isDragging
          ? "border-primary/50 bg-white dark:bg-background shadow-lg dark:shadow-black/50" : "border-gray-200 dark:border-slate-700/50 bg-white dark:bg-background hover:border-primary/40 dark:hover:border-primary/40 hover:shadow-sm"}`}
    >
      {/* Drag Handle or Lock */}
      <div
        {...provided.dragHandleProps}
        onClick={(e) => e.stopPropagation()}
        className={`shrink-0 ${stage.is_locked
          ? "text-gray-300 dark:text-slate-600 cursor-not-allowed"
          : "text-gray-300 dark:text-slate-500 hover:text-gray-500 dark:hover:text-slate-300 cursor-grab active:cursor-grabbing"
          }`}
      >
        {stage.is_locked ? (
          <Lock className="w-4 h-4" />
        ) : (
          <GripVertical className="w-4 h-4" />
        )}
      </div>

      {/* Stage Info */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-semibold leading-tight truncate ${isSelected
            ? "text-gray-900 dark:text-slate-50"
            : "text-gray-900 dark:text-slate-200"
            }`}
        >
          {stage.name}
        </p>
        <p className="text-xs text-gray-400 dark:text-slate-400 mt-0.5 truncate capitalize">
          {stage.stage_type?.replace(/_/g, " ")}
        </p>
      </div>

      {/* Weight badge */}
      {/* {stage.weight != null && (
        <span className="text-xs text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 rounded-md px-2 py-0.5 shrink-0">
          {Math.round(stage.weight * 100)}% wt
        </span>
      )} */}

      {/* Delete button — visible on hover or when selected (only if not locked) */}
      {!stage.is_locked && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(stage.id);
          }}
          className="shrink-0 p-1.5 rounded-lg text-gray-300 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
          title="Delete stage"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}