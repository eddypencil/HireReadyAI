//src\features\shortlist\components\ShortlistInsightsBar.jsx
import { motion } from "framer-motion";
import { ThumbsUp, ThumbsDown, Minus, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ShortlistInsightsBar({ insightsSummary }) {
  const { up, neutral, down, awaitingVote, total } = insightsSummary;
  const topAdvanceCount = Math.max(1, Math.round(total * 0.3));
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="bg-background border-b border-border px-6 py-3 flex flex-wrap items-center justify-between gap-4"
    >
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
            {t("shortlistInsights.down")}{" "}
            <span className="font-bold">{down}</span>
          </span>
        </div>
        <span className="text-border hidden sm:block">|</span>
        <span className="text-muted-foreground text-xs hidden sm:block">
          <span className="font-semibold text-foreground">{total}</span>
          shortlisted
          {awaitingVote > 0 && (
            <>
              ·
              <span className="font-semibold text-warning">{awaitingVote}</span>
              {t("shortlistInsights.awaitingVote")}
            </>
          )}
        </span>
      </div>
    </motion.div>
  );
}
