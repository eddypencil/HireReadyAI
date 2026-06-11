// src\features\pipeline\components\PipelineBuilder.jsx
import { useState, useEffect, useCallback } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";
import { Plus, X, Library, Settings } from "lucide-react";
import StageLibrary from "./StageLibrary";
import StageCard from "./StageCard";
import StageDetailsPanel from "./StageDetailsPanel";
import { useTranslation } from "react-i18next";

function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => window.matchMedia(query).matches,
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

export default function PipelineBuilder({
  job,
  stages,
  isCompanyPremium,
  onAddStage,
  onUpdateStage,
  onDeleteStage,
  onReorderStages,
}) {
  const [selectedStageId, setSelectedStageId] = useState(null);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { t } = useTranslation();
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const selectedStage = stages.find((s) => s.id === selectedStageId) || null;

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    if (result.source.index === result.destination.index) return;

    const reordered = Array.from(stages);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    onReorderStages(reordered);
  };

  const handleAddFromLibrary = useCallback(
    async (libraryItem) => {
      await onAddStage(libraryItem);
      if (!isDesktop) setLibraryOpen(false);
    },
    [onAddStage, isDesktop],
  );

  const handleStageSelect = useCallback(
    (stage) => {
      setSelectedStageId((prev) => {
        const next = prev === stage.id ? null : stage.id;
        if (!isDesktop && next) setDetailsOpen(true);
        return next;
      });
    },
    [isDesktop],
  );

  const handleDelete = useCallback(
    (id) => {
      if (selectedStageId === id) {
        setSelectedStageId(null);
        setDetailsOpen(false);
      }
      onDeleteStage(id);
    },
    [selectedStageId, onDeleteStage],
  );

  const closeAll = useCallback(() => {
    setLibraryOpen(false);
    setDetailsOpen(false);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") closeAll();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [closeAll]);

  useEffect(() => {
    if (!isDesktop && (libraryOpen || detailsOpen)) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [libraryOpen, detailsOpen, isDesktop]);

  // Desktop: 3-column layout
  if (isDesktop) {
    return (
      <div className="flex h-full font-sans overflow-hidden">
        <div
          className="w-56 shrink-0 border-r border-gray-100 dark:border-slate-800 bg-white dark:bg-background overflow-y-auto
            [&::-webkit-scrollbar]:w-1.5
            [&::-webkit-scrollbar-track]:bg-transparent
            [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-thumb]:bg-gray-200
            dark:[&::-webkit-scrollbar-thumb]:bg-slate-800
            dark:[&::-webkit-scrollbar-thumb]:hover:bg-slate-700"
        >
          <StageLibrary onAddStage={handleAddFromLibrary} isCompanyPremium={isCompanyPremium} />
        </div>


        <div
          className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-background px-8 py-6
            [&::-webkit-scrollbar]:w-1.5
            [&::-webkit-scrollbar-track]:bg-transparent
            [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-thumb]:bg-gray-200
            dark:[&::-webkit-scrollbar-thumb]:bg-slate-800
            dark:[&::-webkit-scrollbar-thumb]:hover:bg-slate-700"
        >
          <div className="max-w-xl mx-auto">
            <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-1">
              {job?.title || t("pipeline_builder.title")}
            </h2>
            <p className="text-xs text-gray-400 dark:text-slate-400 mb-6">
              {t("pipeline_builder.desktop.subtitle")}
            </p>

            {stages.length === 0 ? (
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-2xl py-16 text-center bg-white/50 dark:bg-[#111c2a]/30">
                <div className="w-10 h-10 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
                  <Plus className="w-5 h-5 text-gray-400 dark:text-slate-500" />
                </div>
                <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">
                  {t("pipeline_builder.empty.title")}
                </p>
                <p className="text-xs text-gray-400 dark:text-slate-500">
                  {t("pipeline_builder.desktop.empty_desc")}
                </p>
              </div>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="pipeline-canvas">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="flex flex-col gap-3"
                    >
                      {stages.map((stage, index) => (
                        <Draggable
                          key={stage.id}
                          draggableId={stage.id}
                          index={index}
                          isDragDisabled={stage.is_locked}
                        >
                          {(provided, snapshot) => (
                            <StageCard
                              stage={stage}
                              isSelected={stage.id === selectedStageId}
                              onSelect={handleStageSelect}
                              onDelete={handleDelete}
                              provided={provided}
                              snapshot={snapshot}
                            />
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </div>
        </div>

        {/* Right Column: Stage Details */}
        <div
          className="w-64 shrink-0 border-l border-gray-100 dark:border-slate-800 bg-white dark:bg-background overflow-y-auto
            [&::-webkit-scrollbar]:w-1.5
            [&::-webkit-scrollbar-track]:bg-transparent
            [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-thumb]:bg-gray-200
            dark:[&::-webkit-scrollbar-thumb]:bg-slate-800
            dark:[&::-webkit-scrollbar-thumb]:hover:bg-slate-700"
        >
          <StageDetailsPanel
            stage={selectedStage}
            stages={stages}
            onUpdate={onUpdateStage}
          />
        </div>
      </div>
    );
  }

  // Mobile / Tablet: single column + slide-over drawers
  return (
    <div className="flex h-full font-sans overflow-hidden relative">
      {/* Library toggle */}
      <button
        onClick={() => setLibraryOpen(true)}
        className="absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-[#111c2a] border border-gray-200 dark:border-slate-800 rounded-xl shadow-sm text-sm text-gray-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary-hover transition-all cursor-pointer"
      >
        <Library className="w-4 h-4" />
        <span className="text-xs font-medium hidden sm:inline">Library</span>
      </button>

      {/* Pipeline canvas */}
      <div
        className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-[#0b131f] px-4 py-6 pt-16
          [&::-webkit-scrollbar]:w-1.5
          [&::-webkit-scrollbar-track]:bg-transparent
          [&::-webkit-scrollbar-thumb]:rounded-full
          [&::-webkit-scrollbar-thumb]:bg-gray-200
          dark:[&::-webkit-scrollbar-thumb]:bg-slate-800
          dark:[&::-webkit-scrollbar-thumb]:hover:bg-slate-700"
      >
        <div className="max-w-xl mx-auto">
          <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-1">
            {job?.title || "Pipeline"}
          </h2>
          <p className="text-xs text-gray-400 dark:text-slate-400 mb-6">
            {t("pipeline_builder.mobile.subtitle")}
          </p>

          {stages.length === 0 ? (
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-2xl py-16 text-center bg-white dark:bg-[#111c2a]/30">
              <div className="w-10 h-10 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
                <Plus className="w-5 h-5 text-gray-400 dark:text-slate-500" />
              </div>
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">
                {t("pipeline_builder.empty.title")}
              </p>
              <p className="text-xs text-gray-400 dark:text-slate-500">
                {t("pipeline_builder.mobile.empty_desc")}
              </p>
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="pipeline-canvas">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="flex flex-col gap-3"
                  >
                    {stages.map((stage, index) => (
                      <Draggable
                        key={stage.id}
                        draggableId={stage.id}
                        index={index}
                        isDragDisabled={stage.is_locked}
                      >
                        {(provided, snapshot) => (
                          <StageCard
                            stage={stage}
                            isSelected={stage.id === selectedStageId}
                            onSelect={handleStageSelect}
                            onDelete={handleDelete}
                            provided={provided}
                            snapshot={snapshot}
                          />
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>
      </div>

      {/* Details toggle - only when a stage is selected */}
      {selectedStage && (
        <button
          onClick={() => setDetailsOpen(true)}
          className="absolute right-3 bottom-3 z-10 inline-flex items-center gap-1.5 px-3 py-2 bg-primary text-white border border-primary/80 rounded-xl shadow-lg text-sm hover:bg-primary-hover transition-all cursor-pointer"
        >
          <span className="text-xs font-medium hidden sm:inline">
            {t("pipeline_builder.settings")}
          </span>
          <Settings className="w-4 h-4" />
        </button>
      )}

      {/* Library drawer overlay */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-300 ease-out ${libraryOpen
          ? "visible opacity-100"
          : "invisible opacity-0 pointer-events-none"
          }`}
      >
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setLibraryOpen(false)}
        />
        <div
          className={`absolute left-0 top-0 bottom-0 w-72 max-w-[80vw] bg-white dark:bg-[#0b131f] shadow-2xl transition-transform duration-300 ease-out ${libraryOpen ? "translate-x-0" : "-translate-x-full"
            }`}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-slate-800">
            <span className="text-[10px] font-semibold text-gray-400 dark:text-slate-400 tracking-widest uppercase">
              {t("pipeline_builder.library.title")}
            </span>
            <button
              onClick={() => setLibraryOpen(false)}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label={t("pipeline_builder.library.close")}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <StageLibrary onAddStage={handleAddFromLibrary} isCompanyPremium={isCompanyPremium} />
        </div>
      </div>

      {/* Details drawer overlay */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-300 ease-out ${detailsOpen
          ? "visible opacity-100"
          : "invisible opacity-0 pointer-events-none"
          }`}
      >
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setDetailsOpen(false)}
        />
        <div
          className={`absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white dark:bg-[#0b131f] shadow-2xl overflow-y-auto transition-transform duration-300 ease-out 
            ${detailsOpen ? "translate-x-0" : "translate-x-full"}
            [&::-webkit-scrollbar]:w-1.5
            [&::-webkit-scrollbar-track]:bg-transparent
            [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-thumb]:bg-gray-200
            dark:[&::-webkit-scrollbar-thumb]:bg-slate-800
            dark:[&::-webkit-scrollbar-thumb]:hover:bg-slate-700`}
        >
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-slate-800">
            <span className="text-sm font-semibold text-gray-900 dark:text-slate-100 truncate">
              {selectedStage?.name || t("pipeline_builder.details.title")}
            </span>
            <button
              onClick={() => setDetailsOpen(false)}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label={t("pipeline_builder.close_settings")}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <StageDetailsPanel
            stage={selectedStage}
            stages={stages}
            onUpdate={onUpdateStage}
            isCompanyPremium={isCompanyPremium}
          />
        </div>
      </div>
    </div>
  );
}