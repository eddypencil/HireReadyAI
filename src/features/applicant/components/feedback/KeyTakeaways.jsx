import { Check, X, AlertTriangle, Lightbulb } from "lucide-react";
import { useTranslation } from "react-i18next";
function collectStrings(arrays) {
  const map = new Map();
  arrays.forEach((arr) => {
    (arr || []).forEach((item) => {
      const key = item.toLowerCase().trim();
      map.set(key, (map.get(key) || 0) + 1);
    });
  });
  return [...map.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k);
}

export default function KeyTakeaways({ cvFeedback, stages }) {
  const allStrengths = [cvFeedback?.strengths || []];
  const allWeaknesses = [cvFeedback?.weaknesses || []];
  const allGaps = [cvFeedback?.gaps || []];
  const { t } = useTranslation();
  (stages || []).forEach((stage) => {
    const evals = stage.application_stage_evaluations;
    const evalData = Array.isArray(evals) ? evals[0] : evals;
    if (evalData) {
      allStrengths.push(evalData.strengths || []);
      allWeaknesses.push(evalData.weaknesses || []);
    }
    (stage.questions || []).forEach((q) => {
      const ans = q.application_answers;
      const ansData = Array.isArray(ans) ? ans[0] : ans;
      if (ansData) {
        allStrengths.push(ansData.strengths || []);
        allWeaknesses.push(ansData.weaknesses || []);
      }
    });
  });

  const topStrengths = collectStrings(allStrengths);
  const topWeaknesses = collectStrings(allWeaknesses);
  const topGaps = collectStrings(allGaps);

  const hasData =
    topStrengths.length > 0 || topWeaknesses.length > 0 || topGaps.length > 0;

  if (!hasData && !cvFeedback?.feedback) {
    return null;
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-4 h-4 text-accent" />
        <h2 className="text-sm font-bold text-foreground">
          {t("takeaways.title")}
        </h2>
      </div>

      <div className="space-y-2.5">
        {cvFeedback?.feedback && (
          <p className="text-sm text-foreground/80 leading-relaxed">
            {cvFeedback.feedback}
          </p>
        )}

        {topStrengths.length > 0 && (
          <div className="flex items-start gap-2 text-sm">
            <Check className="w-4 h-4 text-success mt-0.5 shrink-0" />
            <span className="text-foreground/80">
              <strong className="text-success">
                {t("takeaways.strength")}{" "}
              </strong>
              {topStrengths[0]}
              {topStrengths.length > 1 && (
                <span className="text-muted-foreground/60">
                  {" "}
                  (also noted: {topStrengths.slice(1, 3).join(", ")})
                </span>
              )}
            </span>
          </div>
        )}

        {topWeaknesses.length > 0 && (
          <div className="flex items-start gap-2 text-sm">
            <X className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
            <span className="text-foreground/80">
              <strong className="text-destructive">
                {t("takeaways.improve")}{" "}
              </strong>
              {topWeaknesses[0]}
              {topWeaknesses.length > 1 && (
                <span className="text-muted-foreground/60">
                  {" "}
                  (also: {topWeaknesses.slice(1, 3).join(", ")})
                </span>
              )}
            </span>
          </div>
        )}

        {topGaps.length > 0 && (
          <div className="flex items-start gap-2 text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <span className="text-foreground/80">
              <strong className="text-amber-600"> {t("takeaways.gap")} </strong>
              {topGaps.slice(0, 2).join(", ")}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
