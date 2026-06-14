import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Sparkles,
  BarChart3,
  ChevronRight,
  ChevronDown,
  Check,
  X,
  AlertTriangle,
  Award,
  Download,
  MessageSquare,
  ExternalLink,
} from "lucide-react";
import {
  getCandidateProfile,
  getJobScorePercentile,
  getPercentileTag,
  fetchQuestionsByIds,
} from "../services/candidateProfile.service";
import LoadingSpinner from "@/shared/ui/LoadingSpinner";
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

function parseAIFeedback(stage) {
  if (!stage?.ai_feedback) return null;
  try {
    return JSON.parse(stage.ai_feedback);
  } catch {
    return null;
  }
}

const DimensionBar = ({ label, score }) => (
  <div className="flex items-center gap-3">
    <span className="text-sm font-medium text-muted-foreground w-36 shrink-0">
      {label}
    </span>
    <div className="flex-1 h-2.5 bg-secondary rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${
          score >= 80
            ? "bg-success"
            : score >= 60
              ? "bg-primary"
              : score >= 40
                ? "bg-warning"
                : "bg-destructive"
        }`}
        style={{ width: `${score}%` }}
      />
    </div>
    <span className="text-sm font-bold text-foreground w-8 text-right">
      {score}
    </span>
  </div>
);

export default function CandidateProfilePage() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [percentile, setPercentile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qaList, setQaList] = useState([]);
  const [showQA, setShowQA] = useState(false);
  const { t } = useTranslation();
  useEffect(() => {
    if (!id) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    getCandidateProfile(id).then(({ data, error: err }) => {
      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
      setProfile(data);
      if (
        data?.job_postings?.id &&
        data.composite_score != null &&
        data.composite_score !== 0
      ) {
        getJobScorePercentile(data.job_postings.id, data.composite_score).then(
          ({ percentile: p }) => {
            setPercentile(p);
          },
        );
      }
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    console.log("Profile answers:", profile?.answers);
    const questionIds = Object.keys(profile?.answers?.questions || {});
    if (questionIds.length === 0) {
      setQaList([]);
      return;
    }
    console.log("Question IDs to fetch:", questionIds);
    fetchQuestionsByIds(questionIds).then(({ data, error }) => {
      console.log("Fetched questions:", data, "Error:", error);
      const answers = profile.answers.questions;
      const list = (data || []).map((q) => ({
        question: q.question,
        answer: answers[q.id],
      }));
      console.log("Built Q&A list:", list);
      setQaList(list);
    });
  }, [profile]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !profile) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive font-medium">
          {error || t("candidate_profile.candidate_not_found")}
        </p>
        <Link
          to="../candidates"
          className="text-primary hover:underline mt-4 inline-block"
        >
          &larr; {t("candidate_profile.back_to_pipeline")}
        </Link>
      </div>
    );
  }

  const app = profile;
  const candidate = app.profiles || {};
  const stages = (app.application_stages || []).sort(
    (a, b) =>
      (a.recruitment_stages?.order_index || 0) -
      (b.recruitment_stages?.order_index || 0),
  );
  const cvStage = stages.find(
    (s) => s.recruitment_stages?.stage_type === "cv_review",
  );
  const cvFeedback = parseAIFeedback(cvStage);

  const scoredStages = stages.filter((s) => s.score != null);
  const computedComposite =
    scoredStages.length > 0
      ? Math.round(
          scoredStages.reduce((sum, s) => sum + Number(s.score), 0) /
            scoredStages.length,
        )
      : (app.composite_score ?? null);

  const percentileTag = getPercentileTag(percentile);
  const interviewStages = stages.filter((s) =>
    [
      "assessment_test",
      "coding_test",
      "video_interview",
      "technical_interview",
      "hr_interview",
      "manager_interview",
      "ai_screening",
    ].includes(s.recruitment_stages?.stage_type),
  );

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 font-sans">
      {/* Back button */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: false, margin: "-30px" }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <Link
          to="../candidates"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("candidate_profile.back_to_pipeline")}
        </Link>
      </motion.div>

      {/* Candidate Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, margin: "-30px" }}
        transition={{ duration: 0.5, delay: 0.05, ease: "easeOut" }}
        className="bg-surface rounded-2xl border border-border p-6 shadow-xs mb-6"
      >
        <div className="flex items-start gap-5">
          {/* Avatar holding initials */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
              <span className="text-accent font-bold text-xl">
                {getInitials(candidate.full_name)}
              </span>
            </div>
            {app.cv_file_url && (
              <a
                href={app.cv_file_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary/10 border border-primary/20 rounded-lg px-2.5 py-1 hover:bg-primary/20 transition-colors"
              >
                <Download className="w-3 h-3" />
                {t("candidate_profile.cv")}
              </a>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-foreground">
                {candidate.full_name ||
                  t("candidate_profile.unknown_candidate")}
              </h1>
              {app.is_rejected && (
                <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-destructive/10 text-destructive border border-destructive/20">
                  {t("candidate_profile.rejected")}
                </span>
              )}
              <Link
                to={`/companies/applicants/${candidate.id}/profile`}
                className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-primary bg-primary/5 border border-primary/15 rounded-md hover:bg-primary/10 transition-colors"
              >
                {t("candidate_profile.show_profile")}{" "}
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
            {candidate.headline && (
              <p className="text-sm text-muted-foreground mt-1">
                {candidate.headline}
              </p>
            )}
            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground/80 flex-wrap">
              {app.answers?.info?.email && (
                <span>{app.answers.info.email}</span>
              )}
              {app.answers?.info?.phone && (
                <span>{app.answers.info.phone}</span>
              )}
              {app.job_postings?.title && (
                <span className="flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-muted-foreground/60" />
                  {t("candidate_profile.applied_for")}{" "}
                  <strong className="text-foreground font-semibold">
                    {app.job_postings.title}
                  </strong>
                </span>
              )}
            </div>
          </div>

          {/* Composite Score + Percentile Tag */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-20 h-20 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
              <span className="text-2xl font-bold text-accent">
                {computedComposite ?? "--"}
              </span>
            </div>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              {t("candidate_profile.composite")}
            </span>
            {percentileTag && (
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-surface ${percentileTag.color}`}
              >
                {percentileTag.label}
              </span>
            )}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CV Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          {cvFeedback && (
            <>
              {/* AI CV Review Banner */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, margin: "-30px" }}
                transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
                className="bg-gradient-to-br from-[#012a4a] via-[#01497c] to-[#2a6f97] rounded-2xl p-8 shadow-[0_10px_30px_-12px_rgba(1,42,74,.28)] relative overflow-hidden"
              >
                {/* Decorative circles */}
                <div className="absolute -top-8 -right-8 size-[120px] rounded-full bg-white/5 pointer-events-none" />
                <div className="absolute -bottom-5 right-[80px] size-[80px] rounded-full bg-white/3 pointer-events-none" />

                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-6 h-6 text-white/70" />
                    <h2 className="text-lg font-bold text-white">
                      {t("candidate_profile.ai_cv_review")}
                    </h2>
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

              {/* Application Q&A */}
              {qaList.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, margin: "-30px" }}
                  transition={{ duration: 0.5, delay: 0.35, ease: "easeOut" }}
                  className="bg-surface rounded-2xl border border-border shadow-xs"
                >
                  <button
                    onClick={() => setShowQA(!showQA)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-primary" />
                      <span className="text-sm font-bold text-foreground">
                        {t("candidate_profile.application_questions")}
                      </span>
                      <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {qaList.length}
                      </span>
                    </div>
                    {showQA ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                  {showQA && (
                    <div className="px-6 pb-4 space-y-3">
                      {qaList.map((item, i) => (
                        <div
                          key={i}
                          className="bg-muted/50 rounded-xl p-4 border border-border"
                        >
                          <p className="text-xs font-semibold text-foreground mb-1.5">
                            {t("candidate_profile.question")}: {item.question}
                          </p>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {item.answer || (
                              <span className="italic text-muted-foreground/60">
                                {t("candidate_profile.no_answer")}
                              </span>
                            )}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Dimension Scores */}
              {cvFeedback.dimension_scores && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, margin: "-30px" }}
                  transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
                  className="bg-surface rounded-2xl border border-border p-6 shadow-xs"
                >
                  <div className="flex items-center gap-2 mb-5">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-bold text-foreground">
                      {t("candidate_profile.dimension_scores")}
                    </h2>
                  </div>
                  <div className="space-y-3">
                    {Object.entries(cvFeedback.dimension_scores).map(
                      ([key, val]) => (
                        <DimensionBar
                          key={key}
                          label={key
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                          score={val}
                        />
                      ),
                    )}
                  </div>
                </motion.div>
              )}

              {/* Strengths, Weaknesses, Gaps */}
              <div className="flex flex-col gap-4">
                {cvFeedback.strengths?.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, margin: "-30px" }}
                    transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
                    className="bg-success/5 border border-success/20 rounded-2xl p-5 shadow-xs"
                  >
                    <div className="flex items-center gap-1.5 mb-3">
                      <Check className="w-4 h-4 text-success" />
                      <h3 className="text-xs font-bold text-success uppercase tracking-wider">
                        {t("candidate_profile.strengths")}
                      </h3>
                    </div>
                    <ul className="space-y-2">
                      {cvFeedback.strengths.map((s, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-success/90"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-success mt-1.5 shrink-0" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
                {cvFeedback.weaknesses?.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, margin: "-30px" }}
                    transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
                    className="bg-destructive/5 border border-destructive/20 rounded-2xl p-5 shadow-xs"
                  >
                    <div className="flex items-center gap-1.5 mb-3">
                      <X className="w-4 h-4 text-destructive" />
                      <h3 className="text-xs font-bold text-destructive uppercase tracking-wider">
                        {t("candidate_profile.weaknesses")}
                      </h3>
                    </div>
                    <ul className="space-y-2">
                      {cvFeedback.weaknesses.map((w, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-destructive/90"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-destructive mt-1.5 shrink-0" />
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
                {cvFeedback.gaps?.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, margin: "-30px" }}
                    transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
                    className="bg-warning/5 border border-warning/20 rounded-2xl p-5 shadow-xs"
                  >
                    <div className="flex items-center gap-1.5 mb-3">
                      <AlertTriangle className="w-4 h-4 text-warning" />
                      <h3 className="text-xs font-bold text-warning uppercase tracking-wider">
                        {t("candidate_profile.gaps")}
                      </h3>
                    </div>
                    <ul className="space-y-2">
                      {cvFeedback.gaps.map((g, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-warning/90"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-warning mt-1.5 shrink-0" />
                          <span>{g}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </div>
            </>
          )}

          {!cvFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-30px" }}
              transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
              className="bg-surface rounded-2xl border border-border p-8 shadow-xs text-center"
            >
              <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">
                {t("candidate_profile.no_cv_review")}
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                {t("candidate_profile.cv_not_reviewed")}
              </p>
            </motion.div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Stage Scores */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-30px" }}
            transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
            className="bg-surface rounded-2xl border border-border p-6 shadow-xs"
          >
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold text-foreground">
                {t("candidate_profile.stage_scores")}
              </h2>
            </div>
            <div className="space-y-3">
              {stages.map((stage) => (
                <div
                  key={stage.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        stage.status === "passed"
                          ? "bg-success"
                          : stage.status === "failed"
                            ? "bg-destructive"
                            : stage.status === "in_progress"
                              ? "bg-primary"
                              : "bg-muted-foreground/40"
                      }`}
                    />
                    <span className="text-sm text-foreground/90">
                      {stage.recruitment_stages?.name ||
                        t("candidate_profile.unknown")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {stage.score != null && (
                      <span
                        className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                          stage.score >= 80
                            ? "bg-success/10 text-success"
                            : stage.score >= 60
                              ? "bg-primary/10 text-primary"
                              : stage.score >= 40
                                ? "bg-warning/10 text-warning"
                                : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {Math.round(stage.score)}
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-semibold ${
                        stage.status === "passed"
                          ? "text-success"
                          : stage.status === "failed"
                            ? "text-destructive"
                            : stage.status === "in_progress"
                              ? "text-primary"
                              : "text-muted-foreground/60"
                      }`}
                    >
                      {stage.status === "in_progress"
                        ? "In Progress"
                        : stage.status?.charAt(0).toUpperCase() +
                            stage.status?.slice(1) || "Pending"}
                    </span>
                  </div>
                </div>
              ))}
              {stages.length === 0 && (
                <p className="text-sm text-muted-foreground/60 italic">
                  {t("candidate_profile.no_stages")}
                </p>
              )}
            </div>
          </motion.div>

          {/* Interview Results Link */}
          {interviewStages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-30px" }}
              transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            >
              <Link
                to={`/companies/candidates/${id}/assessments`}
                className="block bg-surface rounded-2xl border border-border p-6 shadow-xs hover:shadow-md hover:border-primary transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-foreground">
                      {t("candidate_profile.assessments")}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {interviewStages.length} stage(s) with results
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
