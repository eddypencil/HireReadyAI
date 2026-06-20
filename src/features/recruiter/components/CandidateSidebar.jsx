import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  X,
  Mail,
  Briefcase,
  Sparkles,
  Check,
  ChevronRight,
  Loader2,
  ExternalLink,
} from "lucide-react";
import {
  rejectApplication,
  unrejectApplication,
} from "../../shortlist/services/shortlist.service";
import { moveToStage } from "../services/candidatesPipline.service";
import { useTranslation } from "react-i18next";
import { supabase } from "@/shared/services/supabase";

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

const StatusBadge = ({ status, isRejected }) => {
  if (isRejected)
    return (
      <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-destructive/10 text-destructive">
        Reject
      </span>
    );
  if (status === "passed")
    return (
      <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-success/10 text-success">
        Passed
      </span>
    );
  if (status === "in_progress")
    return (
      <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-primary/10 text-primary">
        In Progress
      </span>
    );
  if (status === "failed")
    return (
      <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-destructive/10 text-destructive">
        Failed
      </span>
    );
  return (
    <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-muted border border-border text-muted-foreground">
      Pending
    </span>
  );
};

export default function CandidateSidebar({ candidate, onClose, onUpdate, recruiterName = "", recruiterEmail = "", companyName = "" }) {
  const navigate = useNavigate();
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const { t } = useTranslation();
  if (!candidate) return null;

  const { profile, stagesData = [], answers } = candidate;

  const sortedStages = [...stagesData].sort(
    (a, b) =>
      (a.recruitment_stages?.order_index || 0) -
      (b.recruitment_stages?.order_index || 0),
  );

  const currentStage = sortedStages.find(
    (s) => s.recruitment_stages?.id === candidate.currentStageId,
  );
  const hasCurrentStageScore = currentStage?.score != null;

  const stagesWithEvals = sortedStages.filter((s) => {
    const raw = s.application_stage_evaluations;
    const d = Array.isArray(raw) ? raw[0] : raw;
    return d?.reasoning || d?.recommendation;
  });
  const lastEvalStage =
    stagesWithEvals[stagesWithEvals.length - 1] || sortedStages[0];
  const evalsRaw = lastEvalStage?.application_stage_evaluations;
  const currentEval = Array.isArray(evalsRaw) ? evalsRaw[0] : evalsRaw;

  


  const currentStageIndex = sortedStages.findIndex(
    (s) => s.recruitment_stages?.id === candidate.currentStageId,
  );
  const nextStage =
    currentStageIndex >= 0 && currentStageIndex < sortedStages.length - 1
      ? sortedStages[currentStageIndex + 1]
      : null;
  const nextStageType = nextStage?.recruitment_stages?.stage_type;
  const canAdvance =
    hasCurrentStageScore &&
    nextStage &&
    nextStageType !== "offer" &&
    nextStageType !== "shortlist";

  // const handleReject = async () => {
  //   console.log("Reject debug:", {
  //   id: candidate.id,
  //   job_id: candidate.job_id,
  //   email: answers?.info?.email,
  //   name: candidate.name,
  //   });
  //   setActionLoading(true);
  //   setActionError("");
  //   try {
  //     await rejectApplication(candidate.id, currentEval?.reasoning || "");
  //     onUpdate?.(candidate.id, { is_rejected: true });
  //   } catch (err) {
  //     setActionError(err.message || "Failed to reject candidate");
  //   } finally {
  //     setActionLoading(false);
  //   }
  // };

  const handleReject = async () => {
    setActionLoading(true);
    setActionError("");
    try {
      const candidateEmail = answers?.info?.email;
      if (candidateEmail) {
        supabase.functions
          .invoke("send-offer-email", {
            body: {
              to: candidateEmail,
              fromName: recruiterName || "Hiring Team",
              fromEmail: recruiterEmail || "",
              subject: `Update on Your Application - ${companyName || "Our Company"}`,
              body:
                `Dear ${candidate.name || "Candidate"},\n\n` +
                `Thank you for your interest in joining ${companyName || "our company"} and for taking the time to go through our hiring process.\n\n` +
                `After careful consideration, we have decided to move forward with other candidates whose qualifications more closely match the requirements of the role.\n` +
                (currentEval?.reasoning ? `\nFeedback: ${currentEval.reasoning}\n` : "") +
                `\nWe appreciate your effort and wish you the very best in your future endeavors.\n\n` +
                `Sincerely,\n${recruiterName || "The Hiring Team"}`,
              applicationId: candidate.id,
              action: "reject",
            },
          })
          .catch((err) =>
            console.warn("[Rejection email] failed silently:", err?.message)
          );
      }

      await rejectApplication(candidate.id, currentEval?.reasoning || "");
      onUpdate?.(candidate.id, { is_rejected: true });
    } catch (err) {
      setActionError(err.message || "Failed to reject candidate");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnreject = async () => {
    setActionLoading(true);
    setActionError("");
    try {
      await unrejectApplication(candidate.id);
      onUpdate?.(candidate.id, { is_rejected: false });
    } catch (err) {
      setActionError(err.message || "Failed to un-reject candidate");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdvance = async () => {
    if (!nextStage) return;
    setActionLoading(true);
    setActionError("");
    try {
      await moveToStage(candidate.id, nextStage.recruitment_stages.id);
      onUpdate?.(candidate.id, {
        currentStageId: nextStage.recruitment_stages.id,
      });
      onClose();
    } catch (err) {
      setActionError(err.message || "Failed to advance candidate");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="fixed inset-0 bg-black/30 backdrop-blur-xs z-40"
        onClick={onClose}
      />

      {/* Sliding Panel Wrapper */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed top-0 right-0 h-screen w-full max-w-115 bg-surface border-l border-border shadow-2xl z-50 flex flex-col overflow-hidden font-sans"
      >
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
          className="flex-none bg-surface px-6 py-5 border-b border-border flex items-start justify-between shrink-0"
        >
          <div className="flex gap-4 items-center">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0 overflow-hidden">
              {profile?.profile_pic ? (
                <img
                  src={profile.profile_pic}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-accent font-bold text-lg">
                  {getInitials(candidate.name)}
                </span>
              )}
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-foreground">
                  {candidate.name}
                </h2>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/companies/applicants/${profile?.id}/profile`);
                  }}
                  className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-primary bg-primary/5 border border-primary/15 rounded-md hover:bg-primary/10 transition-colors shrink-0"
                >
                  {t("candidate_sidebar.show_profile")}{" "}
                  <ExternalLink className="w-3 h-3" />
                </button>
                {candidate.is_rejected && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-destructive/10 text-destructive border border-destructive/20">
                    {t("candidate_sidebar.rejected")}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground font-medium flex-wrap">
                {answers?.info?.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-muted-foreground/60" />
                    {answers.info.email}
                  </span>
                )}
                {answers?.info?.phone && (
                  <span className="flex items-center gap-1.5">
                    {answers.info.phone}
                  </span>
                )}
                {profile?.headline && (
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-muted-foreground/60" />
                    {profile.headline}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </motion.div>

        {/* SCROLLABLE BODY */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false }}
          transition={{ duration: 0.3, delay: 0.15, ease: "easeOut" }}
          className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-8 bg-background/40"
        >
          {/* Top Section */}
          <div className="flex flex-col gap-6">            

            {/* AI Recommendation Card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-30px" }}
              transition={{ duration: 0.4, delay: 0.25, ease: "easeOut" }}
              className="bg-accent/5 dark:bg-accent/10 rounded-2xl border border-accent/20 p-5 shadow-xs"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span className="text-xs font-bold text-accent tracking-wide uppercase">
                    {t("candidate_sidebar.ai_recommendation")}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                    {t("candidate_sidebar.confidence")}
                  </span>
                  <span className="text-sm font-bold text-accent leading-none mt-0.5">
                    {currentEval?.confidence != null
                      ? `${Math.round(Number(currentEval.confidence) * 100)}%`
                      : "N/A"}
                  </span>
                </div>
              </div>

              <h3 className="text-lg font-bold text-foreground mb-2">
                {currentEval?.recommendation === "reject"
                  ? t("candidate_sidebar.politely_reject")
                  : t("candidate_sidebar.advance_next_stage")}
              </h3>

              <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                {currentEval?.reasoning || t("candidate_sidebar.no_reasoning")}
              </p>

              <div className="flex gap-3 items-center">
                {!candidate.is_rejected && canAdvance && (
                  <button
                    onClick={handleAdvance}
                    disabled={actionLoading}
                    className="flex items-center gap-2 bg-primary text-primary-foreground font-semibold text-sm px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {actionLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    {t("candidate_sidebar.advance_next_stage")}
                  </button>
                )}
                {candidate.is_rejected ? (
                  <button
                    onClick={handleUnreject}
                    disabled={actionLoading}
                    className="flex items-center gap-2 bg-success text-success-foreground font-semibold text-sm px-4 py-2 rounded-xl hover:bg-success/90 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {actionLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : null}
                    {t("candidate_sidebar.unreject")}
                  </button>
                ) : (
                  <button
                    onClick={handleReject}
                    disabled={actionLoading}
                    className="bg-surface border border-border text-foreground font-semibold text-sm px-4 py-2 rounded-xl hover:bg-secondary transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {actionLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : null}
                    {t("candidate_sidebar.reject")}
                  </button>
                )}
              </div>
              {actionError && (
                <p className="text-xs text-destructive mt-2">{actionError}</p>
              )}
            </motion.div>

            {/* Pipeline Progress */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-30px" }}
              transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-wider">
                  {t("candidate_sidebar.pipeline_progress")}
                </h3>
              </div>

              <div className="flex flex-col gap-3.5">
                {sortedStages.map((stage) => {
                  const isPassed = stage.status === "passed";
                  const isFailed = stage.status === "failed";
                  const isInProgress = stage.status === "in_progress";
                  const isPending = !isPassed && !isInProgress && !isFailed;

                  return (
                    <div
                      key={stage.id}
                      className="flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        {isPassed ? (
                          <div className="w-2 h-2 rounded-full bg-success ml-1" />
                        ) : isInProgress ? (
                          <div className="w-2.5 h-2.5 rounded-full bg-primary ml-0.5 ring-2 ring-primary/30" />
                        ) : (
                          <div className="w-2 h-2 rounded-full border-2 border-border ml-1" />
                        )}
                        <span
                          className={`text-sm ${isInProgress ? "font-bold text-foreground" : isPending ? "font-medium text-muted-foreground/60" : "font-medium text-foreground/80"}`}
                        >
                          {stage.recruitment_stages?.name ||
                            t("candidate_sidebar.unknown_stage")}
                        </span>
                      </div>
                      <StatusBadge
                        status={stage.status}
                        isRejected={isFailed}
                      />
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          <div className="w-full h-px bg-border" />

          {/* STAGE RESULTS SECTION */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-30px" }}
            transition={{ duration: 0.4, delay: 0.35, ease: "easeOut" }}
          >
            <h3 className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-wider mb-4">
              {t("candidate_sidebar.stage_results")}
            </h3>
            <div className="flex flex-col gap-4">
              {sortedStages.map((stage) => {
                const stageEvalsRaw = stage.application_stage_evaluations;
                const evalData = Array.isArray(stageEvalsRaw)
                  ? stageEvalsRaw[0]
                  : stageEvalsRaw;

                if (!evalData && stage.status === "pending") return null;

                return (
                  <div
                    key={stage.id}
                    className="bg-surface border border-border rounded-2xl p-5 shadow-xs"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-foreground text-sm">
                        {stage.recruitment_stages?.name}
                      </h4>
                      <div className="flex items-center gap-2">
                        {stage.score !== null && (
                          <span
                            className={`px-2 py-0.5 rounded-md text-xs font-bold ${stage.score >= 80 ? "bg-success/10 text-success" : stage.score >= 60 ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"}`}
                          >
                            {Math.round(stage.score)}
                          </span>
                        )}
                        <StatusBadge
                          status={stage.status}
                          isRejected={stage.status === "failed"}
                        />
                      </div>
                    </div>

                    {/* Strengths & Weaknesses Cards */}
                    {evalData &&
                    (evalData.strengths?.length > 0 ||
                      evalData.weaknesses?.length > 0) ? (
                      <div className="flex flex-col gap-3">
                        {evalData.strengths?.length > 0 && (
                          <div className="bg-success/5 border border-success/20 rounded-xl p-4">
                            <h5 className="text-[10px] font-bold text-success uppercase tracking-wider mb-2">
                              {t("candidate_sidebar.strengths")}
                            </h5>
                            <ul className="space-y-1.5">
                              {evalData.strengths.map((s, i) => (
                                <li
                                  key={`s-${i}`}
                                  className="flex items-start gap-2 text-sm text-success/90"
                                >
                                  <Check className="w-3.5 h-3.5 text-success mt-0.5 shrink-0" />
                                  <span>{s}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {evalData.weaknesses?.length > 0 && (
                          <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4">
                            <h5 className="text-[10px] font-bold text-destructive uppercase tracking-wider mb-2">
                              {t("candidate_sidebar.weaknesses")}
                            </h5>
                            <ul className="space-y-1.5">
                              {evalData.weaknesses.map((w, i) => (
                                <li
                                  key={`w-${i}`}
                                  className="flex items-start gap-2 text-sm text-destructive/90"
                                >
                                  <X className="w-3.5 h-3.5 text-destructive mt-0.5 shrink-0" />
                                  <span>{w}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <ul className="space-y-2.5">
                        {stage.status === "in_progress" ? (
                          <>
                            <li className="flex items-start gap-2.5 text-sm text-primary">
                              <div className="w-1 h-1 rounded-full bg-primary mt-2 shrink-0" />
                              <span className="leading-snug">
                                {t("candidate_sidebar.currently_evaluating")}
                              </span>
                            </li>
                            <li className="flex items-start gap-2.5 text-sm text-primary">
                              <div className="w-1 h-1 rounded-full bg-primary mt-2 shrink-0" />
                              <span className="leading-snug">
                                {t("candidate_sidebar.live_session_scheduled")}
                              </span>
                            </li>
                          </>
                        ) : (
                          <li className="flex items-start gap-2.5 text-sm text-muted-foreground/60 italic">
                            <span className="leading-snug">
                              {t("candidate_sidebar.no_feedback")}
                            </span>
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* View Profile Button */}
          <button
            onClick={() => {
              navigate(`/companies/candidates/${candidate.id}`);
              onClose();
            }}
            className="w-full bg-primary text-white font-semibold text-sm px-4 py-3 rounded-xl hover:bg-primary/90 transition-colors shadow-xs flex items-center justify-center gap-2 mt-4 cursor-pointer"
          >
            {t("candidate_sidebar.view_profile")}{" "}
            <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>
      </motion.div>
    </>
  );
}
