//src\features\shortlist\components\SideBySideComparison.jsx
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import ComparisonCard from "./ComparisonCard";
import { useTranslation } from "react-i18next";
export default function SideBySideComparison({
  selectedCandidates,
  onReorder,
}) {
  const { t } = useTranslation();

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    const reordered = Array.from(selectedCandidates);
    const [removed] = reordered.splice(sourceIndex, 1);
    reordered.splice(destinationIndex, 0, removed);

    onReorder(reordered);
  };

  if (!selectedCandidates || selectedCandidates.length === 0) {
    return (
      <div className="bg-background rounded-2xl shadow-[var(--shadow-lift)] border border-border p-8 text-center text-muted-foreground">
        <p className="text-sm">{t("shortlist.compare.emptyState")}</p>
      </div>
    );
  }

  return (
    <div className="bg-background rounded-2xl shadow-[var(--shadow-lift)] border border-border p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-foreground font-display mb-1">
          Side-by-side comparison
        </h3>
        <p className="text-sm text-muted-foreground">
          {t("shortlist.compare.description")}
        </p>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="comparison-board" direction="horizontal">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex flex-wrap gap-6 pb-4 min-h-[200px]"
            >
              {selectedCandidates.map((candidate, index) => (
                <Draggable
                  key={candidate.id}
                  draggableId={candidate.id}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <ComparisonCard
                      application={candidate}
                      provided={provided}
                      isDragging={snapshot.isDragging}
                    />
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
