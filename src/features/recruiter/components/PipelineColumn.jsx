import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import CandidateCard from "./CandidateCard";

export default function PipelineColumn({
  stage,
  candidates,
  onDragStart,
  dragOverStage,
  onDragOver,
  onDrop,
  draggingCandidate,
  handleStageAutoAdvance,
  handleAdvanceAll,
  loadingDrop,
  onCardClick,
  allStages,
}) {
  const { t } = useTranslation();
  const isOver = dragOverStage === stage.id;
  const isLocked = stage.is_locked && stage.name !== "CV Review";
  const [openMenu, setOpenMenu] = useState(false);
  const [localMinScore, setLocalMinScore] = useState(stage.min_score ?? 70);

  useEffect(() => {
    setLocalMinScore(stage.min_score ?? 70);
  }, [stage.min_score]);

  return (
    <div
      className={`flex flex-col min-w-[280px] w-[280px] shrink-0 rounded-2xl transition-all duration-200 ${
        isOver && !isLocked
          ? "ring-2 ring-primary ring-offset-2 dark:ring-offset-black"
          : ""
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        if (!isLocked) onDragOver(stage.id);
      }}
      onDrop={() => {
        if (!isLocked) onDrop(stage.id);
      }}
    >
      <div className="flex items-center justify-between px-2 py-2.5 mb-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{
              background: `hsl(${210 - stage.order_index * 12}, 80%, 45%)`,
            }}
          />
          <span className="text-xs font-bold text-foreground font-display truncate">
            {stage.name}
          </span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-muted text-muted-foreground border border-border/80 ml-1 shrink-0">
            {candidates.length}
          </span>
          {isLocked && (
            <Lock
              className="w-3 h-3 text-muted-foreground/60 ml-1 shrink-0"
              title={t("candidate_pipeline.locked_stage")}
            />
          )}

          {!isLocked && (
            <button
              onClick={() => handleAdvanceAll(stage.id)}
              disabled={loadingDrop}
              className="ml-auto shrink-0 text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 hover:bg-primary/15 px-2 py-1 rounded-lg transition-all disabled:opacity-50 cursor-pointer"
            >
              Advance All
            </button>
          )}
        </div>
      </div>

      <div
        className={`flex-1 overflow-y-auto space-y-3 px-1.5 pb-4 transition-all duration-200 scrollbar-thin ${
          isOver && !isLocked ? "bg-muted/40 rounded-xl" : ""
        }`}
        style={{ maxHeight: "calc(100vh - 240px)", minHeight: 150 }}
      >
        {candidates.length === 0 ? (
          <div
            className={`rounded-xl border-2 border-dashed h-28 flex items-center justify-center transition-all ${
              isLocked
                ? "border-border/60 bg-muted/10 text-muted-foreground/30"
                : isOver
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border text-muted-foreground/20"
            }`}
          >
            <p className="text-[11px] font-medium tracking-wide">
              {isLocked
                ? t("candidate_pipeline.auto_managed")
                : t("candidate_pipeline.drop_here")}
            </p>
          </div>
        ) : (
          candidates.map((c, cIdx) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.35,
                delay: cIdx * 0.04,
                ease: "easeOut",
              }}
            >
              <CandidateCard
                candidate={c}
                onDragStart={onDragStart}
                isDragging={draggingCandidate?.id === c.id}
                onClick={() => onCardClick(c)}
                allStages={allStages}
              />
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
