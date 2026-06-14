import { BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";

function collectSkills(arrays) {
  const seen = new Set();
  const result = [];
  arrays.forEach((arr) => {
    (arr || []).forEach((item) => {
      const key = item.toLowerCase().trim();
      if (!seen.has(key)) {
        seen.add(key);
        result.push(item);
      }
    });
  });
  return result;
}

export default function SkillsToDevelop({ cvFeedback, stages }) {
  const allWeaknesses = [cvFeedback?.weaknesses || []];
  const allGaps = [cvFeedback?.gaps || []];
  const { t } = useTranslation();
  (stages || []).forEach((stage) => {
    const evals = stage.application_stage_evaluations;
    const evalData = Array.isArray(evals) ? evals[0] : evals;
    if (evalData) {
      allWeaknesses.push(evalData.weaknesses || []);
    }
    (stage.questions || []).forEach((q) => {
      const ans = q.application_answers;
      const ansData = Array.isArray(ans) ? ans[0] : ans;
      if (ansData) {
        allWeaknesses.push(ansData.weaknesses || []);
      }
    });
  });

  const skills = collectSkills([...allWeaknesses, ...allGaps]);

  if (skills.length === 0) return null;

  return (
    <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <BookOpen className="w-4 h-4 text-accent" />
        <h2 className="text-sm font-bold text-foreground">
          {t("skills.title")}
        </h2>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        {t("skills.subtitle")}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {skills.slice(0, 8).map((skill, i) => (
          <span
            key={i}
            className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-surface-muted text-foreground border border-border"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}
