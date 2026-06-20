import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import SectionCard from "./SectionCard";
import { EmptyState, formatDateRange } from "./FormFields";
import { StarRatingDisplay } from "./StarRating";
import { SKILL_LABELS, LANG_LABELS } from "./FormFields";
import { useTranslation } from "react-i18next";
function EducationItem({ item }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground">
        {item.level}
        {item.major ? ` in ${item.major}` : ""}
      </h3>
      <p className="text-xs text-muted-foreground">{item.university}</p>
      {item.faculty && (
        <p className="text-xs text-muted-foreground/70">{item.faculty}</p>
      )}
      {(item.start_year || item.end_year) && (
        <p className="text-xs text-muted-foreground/70 mt-0.5">
          {item.start_year}
          {item.start_year ? " – " : ""}
          {item.end_year}
          {item.grade ? ` · ${item.grade}` : ""}
        </p>
      )}
    </div>
  );
}

function ExperienceItem({ item }) {
  return (
    <div className="flex-1 border-l-2 border-primary/20 pl-4">
      <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
      <p className="text-xs text-muted-foreground">
        {item.company_name}
        {item.industry ? ` · ${item.industry}` : ""}
      </p>
      {(item.from || item.to) && (
        <p className="text-xs text-muted-foreground/70 mt-0.5">
          {formatDateRange(item.from, item.to)}
        </p>
      )}
      {item.description && (
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed whitespace-pre-wrap">
          {item.description}
        </p>
      )}
    </div>
  );
}

function CertificateItem({ item, onImageClick }) {
  return (
    <div className="flex items-start gap-3 flex-1">
      <div className="w-1.5 h-1.5 rounded-full bg-primary/40 mt-1.5 shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">{item.name}</p>
        <p className="text-xs text-muted-foreground">
          {item.organization}
          {item.date
            ? ` · ${new Date(item.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}`
            : ""}
        </p>
        {item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline mt-0.5 inline-block"
          >
            View credential
          </a>
        )}
        {item.image && (
          <img
            src={item.image}
            alt={item.name}
            className="mt-2 max-w-[160px] rounded-lg border border-border/60 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onImageClick?.(item.image)}
          />
        )}
      </div>
    </div>
  );
}

function ProjectItem({ item, onImageClick }) {
  return (
    <div className="flex-1">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-foreground">{item.name}</h3>
        {item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
      {item.description && (
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
          {item.description}
        </p>
      )}
      {item.technologies?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {item.technologies.map((t, ti) => (
            <span
              key={ti}
              className="px-2 py-0.5 bg-secondary/40 text-muted-foreground rounded text-[10px] font-medium"
            >
              {t}
            </span>
          ))}
        </div>
      )}
      {item.images?.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {item.images.map((img, ii) => (
            <img
              key={ii}
              src={img}
              alt=""
              className="w-20 h-16 rounded-lg object-cover border border-border/60 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => onImageClick?.(img)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function VolunteeringItem({ item }) {
  return (
    <div className="flex-1">
      <h3 className="text-sm font-semibold text-foreground">
        {item.role}
        {item.organization ? ` @ ${item.organization}` : ""}
      </h3>
      {(item.start || item.end) && (
        <p className="text-xs text-muted-foreground/70 mt-0.5">
          {formatDateRange(item.start, item.end)}
        </p>
      )}
      {item.description && (
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
          {item.description}
        </p>
      )}
    </div>
  );
}

const ITEM_RENDERERS = {
  experience: ExperienceItem,
  education: EducationItem,
  certificates: CertificateItem,
  projects: ProjectItem,
  volunteering: VolunteeringItem,
};

export default function ArraySection({
  icon,
  title,
  section,
  items = [],
  isOwn,
  onEdit,
  onDelete,
  onAdd,
  onImageClick,
}) {
  const ItemComponent = ITEM_RENDERERS[section];
  const { t } = useTranslation();
  return (
    <SectionCard icon={icon} title={title}>
      {items.length === 0 && (
        <EmptyState message={`No ${title.toLowerCase()} added yet`} />
      )}
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="group flex items-start justify-between gap-2">
            {ItemComponent && (
              <ItemComponent item={item} onImageClick={onImageClick} />
            )}
            {isOwn && (
              <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onEdit(section, i)}
                  className="p-1 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDelete(section, i)}
                  className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      {isOwn && (
        <button
          onClick={() => onAdd(section)}
          className="mt-3 flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add {title.toLowerCase()}
        </button>
      )}
    </SectionCard>
  );
}
