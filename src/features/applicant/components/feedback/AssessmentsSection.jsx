import { Brain } from "lucide-react";
import { motion } from "framer-motion";
import StageSelector from "./StageSelector";
import ExpandableQuestion from "./ExpandableQuestion";
import { useTranslation } from "react-i18next";
function getInitials(name = "") {
  return (
    (name || "")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?"
  );
}

export default function AssessmentsSection({
  stagesWithQuestions,
  activeStage,
  onSelectStage,
  candidateName,
  jobTitle,
}) {
  const isEmpty =
    stagesWithQuestions.length === 0 ||
    stagesWithQuestions.every((s) => s.questions.length === 0);
  const { t } = useTranslation();
  return (
    <motion.div
      className="mt-8"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-30px" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <motion.div
        className="rounded-2xl bg-gradient-to-br from-[#2a6f97] via-[#01497c] to-[#012a4a] p-8 shadow-lg relative overflow-hidden mb-6"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: false, margin: "-30px" }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {t("assessments.title")}
            </h1>
            <p className="text-sm text-white/70 mt-1 font-medium">
              {candidateName || jobTitle}
            </p>
          </div>
          {!isEmpty && (
            <div className="text-right">
              <span className="text-xs text-white/70 font-semibold bg-white/15 px-3 py-1.5 rounded-lg">
                {stagesWithQuestions.reduce(
                  (a, s) => a + s.questions.length,
                  0,
                )}{" "}
                {t("assessments.totalQuestions")}
              </span>
            </div>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, margin: "-30px" }}
        transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
      >
        <StageSelector
          stages={stagesWithQuestions}
          activeStage={activeStage}
          onSelect={onSelectStage}
        />
      </motion.div>

      {isEmpty ? (
        <motion.div
          className="bg-card rounded-2xl border border-border p-12 text-center mt-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-30px" }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <Brain className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-foreground/80 mb-1">
            {t("assessments.noDataTitle")}
          </h2>
          <p className="text-sm text-muted-foreground/60">
            {t("assessments.noDataDescription")}
          </p>
        </motion.div>
      ) : activeStage ? (
        <motion.div
          className="mt-6 space-y-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-30px" }}
          transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
        >
          <motion.div
            className="bg-card rounded-2xl border border-border p-5 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-30px" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#2a6f97] to-[#012a4a] text-white">
                  {(() => {
                    const icons = {
                      hr_interview: Brain,
                      technical_interview: Brain,
                      assessment: Brain,
                      assessment_test: Brain,
                      coding_test: Brain,
                      video_interview: Brain,
                      manager_interview: Brain,
                      ai_screening: Brain,
                    };
                    const StageIcon =
                      icons[activeStage.recruitment_stages?.stage_type] ||
                      Brain;
                    return <StageIcon className="w-5 h-5" />;
                  })()}
                </div>
                <div>
                  <h2 className="font-bold text-foreground">
                    {activeStage.recruitment_stages?.name}
                  </h2>
                  <p className="text-xs text-muted-foreground capitalize">
                    {activeStage.recruitment_stages?.stage_type?.replace(
                      /_/g,
                      " ",
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {activeStage.score != null && (
                  <span
                    className={`px-3 py-1 rounded-lg text-sm font-bold ${
                      activeStage.score >= 80
                        ? "bg-success/10 text-success"
                        : activeStage.score >= 60
                          ? "bg-accent/10 text-accent"
                          : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {Math.round(activeStage.score)}/100
                  </span>
                )}
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
                    activeStage.status === "passed"
                      ? "bg-success/10 text-success"
                      : activeStage.status === "failed"
                        ? "bg-destructive/10 text-destructive"
                        : activeStage.status === "in_progress"
                          ? "bg-accent/10 text-accent"
                          : "bg-muted text-muted-foreground"
                  }`}
                >
                  {activeStage.status?.charAt(0).toUpperCase() +
                    activeStage.status?.slice(1)}
                </span>
              </div>
            </div>
            {(() => {
              const evals = activeStage.application_stage_evaluations;
              const evalData = Array.isArray(evals) ? evals[0] : evals;
              if (!evalData) return null;
              return (
                <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      {t("assessments.recommendation")}
                    </span>
                    <p
                      className={`text-sm font-bold mt-0.5 ${
                        evalData.recommendation === "proceed"
                          ? "text-success"
                          : evalData.recommendation === "review"
                            ? "text-amber-700"
                            : "text-destructive"
                      }`}
                    >
                      {evalData.recommendation?.charAt(0).toUpperCase() +
                        evalData.recommendation?.slice(1) || "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      {t("assessments.confidence")}
                    </span>
                    <p className="text-sm font-bold text-foreground/80 mt-0.5">
                      {evalData.confidence != null
                        ? `${Math.round(Number(evalData.confidence) * 100)}%`
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      {t("assessments.questions")}
                    </span>
                    <p className="text-sm font-bold text-foreground/80 mt-0.5">
                      {activeStage.questions?.length || 0}
                    </p>
                  </div>
                </div>
              );
            })()}
          </motion.div>

          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-30px" }}
            transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
          >
            {activeStage.questions.map((q, i) => (
              <ExpandableQuestion key={q.id} question={q} index={i} />
            ))}
          </motion.div>
        </motion.div>
      ) : null}
    </motion.div>
  );
}
