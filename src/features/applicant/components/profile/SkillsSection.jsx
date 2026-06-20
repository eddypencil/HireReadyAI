import { Plus, Pencil, X } from "lucide-react";
import SectionCard from "./SectionCard";
import { EmptyState, SKILL_LABELS } from "./FormFields";
import { StarRatingDisplay } from "./StarRating";
import { useTranslation } from "react-i18next";
export default function SkillsSection({
  items = [],
  isOwn,
  onEdit,
  onDelete,
  onAdd,
}) {
  const { t } = useTranslation();
  return (
    <SectionCard icon={null} title="Skills">
      {items.length === 0 && <EmptyState message="No skills added yet" />}
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <span
            key={i}
            className="group relative inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/5 border border-primary/10 text-primary rounded-full text-xs font-medium"
          >
            {item.name}
            {item.level ? (
              <StarRatingDisplay level={item.level} labels={SKILL_LABELS} />
            ) : (
              ""
            )}
            {isOwn && (
              <span className="flex items-center gap-0.5 ml-1">
                <button
                  onClick={() => onEdit("skills", i)}
                  className="text-primary/50 hover:text-primary transition-colors"
                >
                  <Pencil className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onDelete("skills", i)}
                  className="text-primary/50 hover:text-destructive transition-colors"
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
          onClick={() => onAdd("skills")}
          className="mt-3 flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add skill
        </button>
      )}
    </SectionCard>
  );
}
