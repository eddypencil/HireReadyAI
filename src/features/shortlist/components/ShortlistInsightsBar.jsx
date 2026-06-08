//src\features\shortlist\components\ShortlistInsightsBar.jsx
import { ThumbsUp, ThumbsDown, Minus, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ShortlistInsightsBar({ insightsSummary }) {
  const { up, neutral, down, awaitingVote, total } = insightsSummary;
  const topAdvanceCount = Math.max(1, Math.round(total * 0.3));
  const { t } = useTranslation();

  return (
    <div className="bg-background border-b border-border px-6 py-3 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-5 text-sm">
        {/* Up Votes - Success State */}
        <div className="flex items-center gap-1.5 text-success font-medium">
          <ThumbsUp className="w-3.5 h-3.5" />
          <span>
            {t("shortlistInsights.upVotes")}{" "}
            <span className="font-bold">{up}</span>
          </span>
        </div>

        <span className="text-border">—</span>

        {/* Neutral - Muted/Secondary Text */}
        <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
          <Minus className="w-3.5 h-3.5" />
          <span>
            {t("shortlistInsights.neutral")}{" "}
            <span className="font-bold">{neutral}</span>
          </span>
        </div>

        <span className="text-border">—</span>

        {/* Down Votes - Destructive State */}
        <div className="flex items-center gap-1.5 text-destructive font-medium">
          <ThumbsDown className="w-3.5 h-3.5" />
          <span>
            {t("shortlistInsights.downVotes")}{" "}
            <span className="font-bold">{down}</span>
          </span>
        </div>

        <span className="text-border hidden sm:block">|</span>

        {/* Meta info - Muted & Foreground Text */}
        <span className="text-muted-foreground text-xs hidden sm:block">
          <span className="font-semibold text-foreground">{total}</span>{" "}
          {t("shortlistInsights.shortlisted")}
          {awaitingVote > 0 && (
            <>
              {" "}
              ·{" "}
              <span className="font-semibold text-[#8a5a00]">
                {awaitingVote}
              </span>{" "}
              {t("shortlistInsights.awaitingVote")}
            </>
          )}
        </span>
      </div>

      {/* AI Suggestion - Accent Pill Variant */}
      <div className="flex items-center gap-1.5 text-xs font-medium text-accent bg-accent/10 border border-accent/20 px-3 py-1.5 rounded-full">
        <Sparkles className="w-3.5 h-3.5" />
        {t("shortlistInsights.aiSuggestion", { count: topAdvanceCount })}
      </div>
    </div>
  );
}
