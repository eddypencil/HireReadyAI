import {
  Sparkles,
  FileText,
  BarChart3,
  Check,
  X,
  AlertTriangle,
} from "lucide-react";
import { motion } from "framer-motion";
import DimensionBar from "./DimensionBar";
import { useTranslation } from "react-i18next";
function parseAIFeedback(stage) {
  if (!stage?.ai_feedback) return null;
  try {
    return JSON.parse(stage.ai_feedback);
  } catch {
    return null;
  }
}

export default function CvReviewSection({ app }) {
  if (!app) return null;
  const { t } = useTranslation();
  const allStages = (app.application_stages || [])
    .filter((s) => s.recruitment_stages)
    .sort(
      (a, b) =>
        (a.recruitment_stages.order_index || 0) -
        (b.recruitment_stages.order_index || 0),
    );
  const cvStage = allStages.find(
    (s) => s.recruitment_stages?.stage_type === "cv_review",
  );
  const cvFeedback = parseAIFeedback(cvStage);

  if (!cvFeedback) {
    return (
      <motion.div
        className="bg-card rounded-2xl border border-border p-8 shadow-sm text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, margin: "-30px" }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-muted-foreground font-medium">
          {t("cv.noDataTitle")}
        </p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          {t("cv.noDataDescription")}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-30px" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <motion.div
        className="rounded-2xl bg-gradient-to-br from-[#2a6f97] via-[#01497c] to-[#012a4a] p-8 shadow-lg relative overflow-hidden"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: false, margin: "-30px" }}
        transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-white/70" />
            <h2 className="text-lg font-bold text-white"> {t("cv.title")}</h2>
            <span
              className={`ml-auto px-3 py-1 rounded-lg text-xs font-bold ${
                cvFeedback.recommendation === "proceed"
                  ? "bg-success text-white"
                  : cvFeedback.recommendation === "review"
                    ? "bg-amber-400 text-amber-900"
                    : "bg-destructive text-white"
              }`}
            >
              {cvFeedback.recommendation?.toUpperCase() || "N/A"}
            </span>
          </div>
          <p className="text-sm text-white/80 leading-relaxed font-medium">
            {cvFeedback.feedback}
          </p>
        </div>
      </motion.div>

      {cvFeedback.dimension_scores && (
        <motion.div
          className="bg-card rounded-2xl border border-border p-6 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-30px" }}
          transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
        >
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-bold text-foreground">
              {t("cv.dimensionScores")}
            </h2>
          </div>
          <div className="space-y-3">
            {Object.entries(cvFeedback.dimension_scores).map(([key, val]) => (
              <DimensionBar
                key={key}
                label={key
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
                score={val}
              />
            ))}
          </div>
        </motion.div>
      )}

      <motion.div
        className="flex flex-col gap-4"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, margin: "-30px" }}
        transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
      >
        {cvFeedback.strengths?.length > 0 && (
          <div className="bg-success/5 dark:bg-success/15 border border-success/20 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-1.5 mb-3">
              <Check className="w-4 h-4 text-success" />
              <h3 className="text-xs font-bold text-success uppercase tracking-wider">
                {t("cv.strengths")}
              </h3>
            </div>
            <ul className="space-y-2">
              {cvFeedback.strengths.map((s, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-success"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-success/60 mt-1.5 shrink-0" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {cvFeedback.weaknesses?.length > 0 && (
          <div className="bg-destructive/5 dark:bg-destructive/15 border border-destructive/20 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-1.5 mb-3">
              <X className="w-4 h-4 text-destructive" />
              <h3 className="text-xs font-bold text-destructive uppercase tracking-wider">
                {t("cv.weaknesses")}
              </h3>
            </div>
            <ul className="space-y-2">
              {cvFeedback.weaknesses.map((w, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-destructive"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-destructive/60 mt-1.5 shrink-0" />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {cvFeedback.gaps?.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-900/25 border border-amber-200 dark:border-amber-700/40 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-1.5 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <h3 className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                {t("cv.gaps")}
              </h3>
            </div>
            <ul className="space-y-2">
              {cvFeedback.gaps.map((g, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-amber-800 dark:text-amber-200"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 dark:bg-amber-500 mt-1.5 shrink-0" />
                  <span>{g}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
