import { Plus, Pencil, X } from "lucide-react";
import SectionCard from "./SectionCard";
import { EmptyState, LANG_LABELS } from "./FormFields";
import { StarRatingDisplay } from "./StarRating";
import { useTranslation } from "react-i18next";
export default function LanguagesSection({
  items = [],
  isOwn,
  onEdit,
  onDelete,
  onAdd,
}) {
  const { t } = useTranslation();
  return (
    <SectionCard icon={null} title="Languages">
      {items.length === 0 && <EmptyState message="No languages added yet" />}
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <span
            key={i}
            className="group relative inline-flex items-center gap-1.5 px-2.5 py-1 bg-secondary/50 border border-border/50 text-foreground rounded-full text-xs font-medium"
          >
            {item.name}
            {item.level ? (
              <StarRatingDisplay level={item.level} labels={LANG_LABELS} />
            ) : (
              ""
            )}
            {isOwn && (
              <span className="flex items-center gap-0.5 ml-1">
                <button
                  onClick={() => onEdit("languages", i)}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Pencil className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onDelete("languages", i)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </span>
        ))}
      </div>
      {isOwn && (
        <button
          onClick={() => onAdd("languages")}
          className="mt-3 flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add language
        </button>
      )}
    </SectionCard>
  );
}
