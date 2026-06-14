import { Star } from "lucide-react";
import { useTranslation } from "react-i18next";

export function StarRatingInput({ value, onChange, labels }) {
  const { t } = useTranslation();
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1.5">
        {t("proficiency")}
      </label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`p-0.5 transition-colors ${star <= (value || 0) ? "text-amber-400" : "text-muted-foreground/20"}`}
          >
            <Star
              className={`w-5 h-5 ${star <= (value || 0) ? "fill-amber-400" : ""}`}
            />
          </button>
        ))}
      </div>
      {value > 0 && (
        <p className="text-xs text-muted-foreground mt-1">
          {value} – {labels?.[value] || ""}
        </p>
      )}
    </div>
  );
}

export function StarRatingDisplay({ level, labels }) {
  const val = parseInt(level, 10);
  if (!val || val < 1 || val > 5)
    return <span className="text-muted-foreground">· {level}</span>;
  return (
    <span className="inline-flex items-center gap-0.5 ml-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3 h-3 ${s <= val ? "text-amber-400 fill-amber-400" : "text-muted-foreground/20"}`}
        />
      ))}
      <span className="text-[10px] text-muted-foreground ml-1">
        {labels?.[val] || ""}
      </span>
    </span>
  );
}
