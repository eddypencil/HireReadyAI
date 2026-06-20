import { useTranslation } from "react-i18next";
export default function ScoreRing({
  score,
  size = 80,
  strokeWidth = 6,
  percentileTag,
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(score || 0, 0), 100);
  const offset = circumference - (progress / 100) * circumference;
  const { t } = useTranslation();
  const color =
    progress >= 80
      ? "stroke-success"
      : progress >= 60
        ? "stroke-accent"
        : progress >= 40
          ? "stroke-amber-500"
          : "stroke-destructive";

  const textColor =
    progress >= 80
      ? "text-success"
      : progress >= 60
        ? "text-accent"
        : progress >= 40
          ? "text-amber-500"
          : "text-destructive";

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted/50"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={`${color} transition-all duration-700`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-xl font-bold ${textColor}`}>
            {score != null ? Math.round(score) : "--"}
          </span>
        </div>
      </div>
      <span className="text-[10px] font-semibold text-muted-foreground uppercase">
        {t("scoreRing.overall")}
      </span>
      {percentileTag && (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border text-accent`}
        >
          {percentileTag.label}
        </span>
      )}
    </div>
  );
}
