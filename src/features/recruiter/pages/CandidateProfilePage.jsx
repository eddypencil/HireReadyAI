import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, FileText, Sparkles, BarChart3, ChevronRight, Check, X, AlertTriangle, Award } from "lucide-react";
import { getCandidateProfile, getJobScorePercentile, getPercentileTag } from "../services/candidateProfile.service";
import LoadingSpinner from "@/shared/ui/LoadingSpinner";

function getInitials(name = "") {
  return (name || "").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";
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
    <span className="text-sm font-medium text-muted-foreground w-36 shrink-0">{label}</span>
    <div className="flex-1 h-2.5 bg-secondary rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${score >= 80 ? "bg-success" : score >= 60 ? "bg-primary" : score >= 40 ? "bg-warning" : "bg-destructive"
          }`}
        style={{ width: `${score}%` }}
      />
    </div>
    <span className="text-sm font-bold text-foreground w-8 text-right">{score}</span>
  </div>
);

export default function CandidateProfilePage() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [percentile, setPercentile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getCandidateProfile(id).then(({ data, error: err }) => {
      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
      setProfile(data);
      if (data?.job_postings?.id && data.composite_score != null && data.composite_score !== 0) {
        getJobScorePercentile(data.job_postings.id, data.composite_score).then(({ percentile: p }) => {
          setPercentile(p);
        });
      }
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !profile) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive font-medium">{error || "Candidate not found"}</p>
        <Link to="../candidates" className="text-primary hover:underline mt-4 inline-block">&larr; Back to pipeline</Link>
      </div>
    );
  }

  const app = profile;
  const candidate = app.profiles || {};
  const stages = (app.application_stages || []).sort(
    (a, b) => (a.recruitment_stages?.order_index || 0) - (b.recruitment_stages?.order_index || 0)
  );
  const cvStage = stages.find(s => s.recruitment_stages?.stage_type === "cv_review");
  const cvFeedback = parseAIFeedback(cvStage);

  const scoredStages = stages.filter(s => s.score != null);
  const computedComposite = scoredStages.length > 0
    ? Math.round(scoredStages.reduce((sum, s) => sum + Number(s.score), 0) / scoredStages.length)
    : (app.composite_score ?? null);

  const percentileTag = getPercentileTag(percentile);
  const interviewStages = stages.filter(s =>
    ["assessment_test", "coding_test", "video_interview", "technical_interview", "hr_interview", "manager_interview", "ai_screening"].includes(s.recruitment_stages?.stage_type)
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
          Back to Pipeline
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
          <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
            <span className="text-accent font-bold text-xl">{getInitials(candidate.full_name)}</span>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-foreground">{candidate.full_name || "Unknown Candidate"}</h1>
              {app.is_rejected && (
                <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-destructive/10 text-destructive border border-destructive/20">
                  Rejected
                </span>
              )}
            </div>
            {candidate.headline && (
              <p className="text-sm text-muted-foreground mt-1">{candidate.headline}</p>
            )}
            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground/80 flex-wrap">
              {app.answers?.info?.email && <span>{app.answers.info.email}</span>}
              {app.answers?.info?.phone && <span>{app.answers.info.phone}</span>}
              {app.job_postings?.title && (
                <span className="flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-muted-foreground/60" />
                  Applied for: <strong className="text-foreground font-semibold">{app.job_postings.title}</strong>
                </span>
              )}
            </div>
          </div>

          {/* Composite Score + Percentile Tag */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-20 h-20 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
              <span className="text-2xl font-bold text-accent">{computedComposite ?? "--"}</span>
            </div>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Composite</span>
            {percentileTag && (
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-surface ${percentileTag.color}`}>
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
                className="rounded-2xl bg-accent/5 dark:bg-accent/10 p-8 border border-accent/20 shadow-xs relative overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-6 h-6 text-accent" />
                    <h2 className="text-lg font-bold text-foreground">AI CV Review</h2>
                    <span className={`ml-auto px-3 py-1 rounded-lg text-xs font-bold ${cvFeedback.recommendation === "proceed" ? "bg-success/20 text-success" :
                        cvFeedback.recommendation === "review" ? "bg-warning/20 text-warning" :
                          "bg-destructive/20 text-destructive"
                      }`}>
                      {cvFeedback.recommendation?.toUpperCase() || "N/A"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed font-medium">{cvFeedback.feedback}</p>
                </div>
              </motion.div>

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
                    <h2 className="text-lg font-bold text-foreground">Dimension Scores</h2>
                  </div>
                  <div className="space-y-3">
                    {Object.entries(cvFeedback.dimension_scores).map(([key, val]) => (
                      <DimensionBar key={key} label={key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())} score={val} />
                    ))}
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
                      <h3 className="text-xs font-bold text-success uppercase tracking-wider">Strengths</h3>
                    </div>
                    <ul className="space-y-2">
                      {cvFeedback.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-success/90">
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
                      <h3 className="text-xs font-bold text-destructive uppercase tracking-wider">Weaknesses</h3>
                    </div>
                    <ul className="space-y-2">
                      {cvFeedback.weaknesses.map((w, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-destructive/90">
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
                      <h3 className="text-xs font-bold text-warning uppercase tracking-wider">Gaps</h3>
                    </div>
                    <ul className="space-y-2">
                      {cvFeedback.gaps.map((g, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-warning/90">
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
              <p className="text-muted-foreground font-medium">No CV review data available</p>
              <p className="text-xs text-muted-foreground/60 mt-1">CV has not been reviewed yet.</p>
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
              <h2 className="text-sm font-bold text-foreground">Stage Scores</h2>
            </div>
            <div className="space-y-3">
              {stages.map(stage => (
                <div key={stage.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-2 h-2 rounded-full ${stage.status === "passed" ? "bg-success" :
                        stage.status === "failed" ? "bg-destructive" :
                          stage.status === "in_progress" ? "bg-primary" :
                            "bg-muted-foreground/40"
                      }`} />
                    <span className="text-sm text-foreground/90">{stage.recruitment_stages?.name || "Unknown"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {stage.score != null && (
                      <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${stage.score >= 80 ? "bg-success/10 text-success" :
                          stage.score >= 60 ? "bg-primary/10 text-primary" :
                            stage.score >= 40 ? "bg-warning/10 text-warning" :
                              "bg-destructive/10 text-destructive"
                        }`}>
                        {Math.round(stage.score)}
                      </span>
                    )}
                    <span className={`text-[10px] font-semibold ${stage.status === "passed" ? "text-success" :
                        stage.status === "failed" ? "text-destructive" :
                          stage.status === "in_progress" ? "text-primary" :
                            "text-muted-foreground/60"
                      }`}>
                      {stage.status === "in_progress" ? "In Progress" : stage.status?.charAt(0).toUpperCase() + stage.status?.slice(1) || "Pending"}
                    </span>
                  </div>
                </div>
              ))}
              {stages.length === 0 && (
                <p className="text-sm text-muted-foreground/60 italic">No stages available.</p>
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
                    <h2 className="text-sm font-bold text-foreground">Assessments & Interviews</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">{interviewStages.length} stage(s) with results</p>
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