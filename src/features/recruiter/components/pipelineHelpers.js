export function getInitials(name = "") {
  return (
    (name || "")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?"
  );
}

export function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days > 0) return `${days}d ago`;
  const hours = Math.floor(diff / 3600000);
  if (hours > 0) return `${hours}h ago`;
  const mins = Math.floor(diff / 60000);
  return `${mins}m ago`;
}

export const scoreColor = (s) => {
  if (s >= 85) return "bg-success/10 text-success border-success/20";
  if (s >= 70) return "bg-primary/10 text-primary border-primary/20";
  if (s >= 55) return "bg-warning/10 text-warning border-warning/20";
  return "bg-destructive/10 text-destructive border-destructive/20";
};

export function getFit(score, isRejected, t) {
  if (isRejected) {
    return {
      key: "rejected",
      label: t("candidate_pipeline.fit.rejected"),
      cls: "bg-destructive/10 text-destructive border-destructive/20",
    };
  }
  if (score >= 85)
    return {
      key: "strong_fit",
      label: t("candidate_pipeline.fit.strong_fit"),
      cls: "bg-success/10 text-success border-success/20",
    };
  if (score >= 70)
    return {
      key: "good_fit",
      label: t("candidate_pipeline.fit.good_fit"),
      cls: "bg-primary/10 text-primary border-primary/20",
    };
  if (score >= 55)
    return {
      key: "needs_review",
      label: t("candidate_pipeline.fit.needs_review"),
      cls: "bg-warning/10 text-warning border-warning/20",
    };
  return {
    key: "low_fit",
    label: t("candidate_pipeline.fit.low_fit"),
    cls: "bg-destructive/10 text-destructive border-destructive/20",
  };
}

export const stageScore = (as) => {
  if (as.score != null) return Math.round(Number(as.score));
  const evals = as.application_stage_evaluations;
  const list = evals ? (Array.isArray(evals) ? evals : [evals]) : [];
  if (list.length > 0 && list[0].ai_score != null)
    return Math.round(Number(list[0].ai_score));
  return null;
};

export const statusStyle = (status) => {
  switch (status) {
    case "passed":
      return "bg-success/10 text-success border-success/20";
    case "in_progress":
      return "bg-warning/10 text-warning border-warning/20";
    case "failed":
      return "bg-destructive/10 text-destructive border-destructive/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

export const statusLabel = (status) => {
  switch (status) {
    case "passed":
      return "Passed";
    case "in_progress":
      return "In Progress";
    case "failed":
      return "Failed";
    default:
      return "Pending";
  }
};

// Shared mapping function used in initial fetch and both realtime handlers
export function mapApplicationToCandidate(app, t) {
  const allStages = app.application_stages || [];
  let currentStageId = app.current_stage_id;
  const currentStage = currentStageId
    ? allStages.find((s) => s.recruitment_stages?.id === currentStageId)
    : null;

  let score = 0;
  let evaluation = null;
  if (currentStage) {
    evaluation = currentStage.application_stage_evaluations?.[0] ?? null;
    if (evaluation?.ai_score != null) {
      score = Math.round(Number(evaluation.ai_score));
    } else if (currentStage.score != null) {
      score = Math.round(Number(currentStage.score));
    }
  }

  const hasEvaluation = evaluation !== null || currentStage?.score != null;
  const isRejected = app.is_rejected || evaluation?.recommendation === "reject";

  return {
    id: app.id,
    jobId: app.job_postings?.id,
    name: app.profiles?.full_name || t("candidate_pipeline.unknown_candidate"),
    applied_at: app.applied_at,
    score,
    hasEvaluation,
    is_rejected: isRejected,
    currentStageId,
    cvScore: app.cv_score,
    compositeScore: app.composite_score,
    profile: app.profiles,
    answers: app.answers,
    stagesData: allStages,
  };
}
