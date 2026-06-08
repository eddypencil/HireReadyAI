//src\features\recruiter\pages\PipelineCandidatesPage.jsx
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Lock,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  getPipelineCandidates,
  getJobStages,
  moveToStage,
  autoAdvanceToShortlist,
  updateStageMinScore,
} from "../services/candidatesPipline.service";
import { useTranslation } from "react-i18next";
import CandidateSidebar from "../components/CandidateSidebar";
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

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days > 0) return `${days}d ago`;
  const hours = Math.floor(diff / 3600000);
  if (hours > 0) return `${hours}h ago`;
  const mins = Math.floor(diff / 60000);
  return `${mins}m ago`;
}

const scoreColor = (s) => {
  if (s >= 85)
    return "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20";
  if (s >= 70) return "bg-primary/10 text-primary border border-primary/20";
  if (s >= 55)
    return "bg-amber-500/10 text-amber-600 border border-amber-500/20";
  return "bg-destructive/10 text-destructive border border-destructive/20";
};

function getFit(score, isRejected, t) {
  if (isRejected) {
    return {
      label: t("candidate_pipeline.fit.rejected"),
      cls: "bg-destructive/10 text-destructive border-destructive/20",
    };
  }

  if (score >= 85)
    return {
      label: t("candidate_pipeline.fit.strong_fit"),
      cls: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    };

  if (score >= 70)
    return {
      label: t("candidate_pipeline.fit.good_fit"),
      cls: "bg-primary/10 text-primary border-primary/20",
    };

  if (score >= 55)
    return {
      label: t("candidate_pipeline.fit.needs_review"),
      cls: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    };

  return {
    label: t("candidate_pipeline.fit.low_fit"),
    cls: "bg-destructive/10 text-destructive border-destructive/20",
  };
}

const stageScore = (as) => {
  if (as.score != null) return Math.round(Number(as.score));
  const evals = as.application_stage_evaluations;
  const list = evals ? (Array.isArray(evals) ? evals : [evals]) : [];
  if (list.length > 0 && list[0].ai_score != null)
    return Math.round(Number(list[0].ai_score));
  return null;
};

const statusStyle = (status) => {
  switch (status) {
    case "passed":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "in_progress":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "failed":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-gray-100 text-gray-500 border-gray-200";
  }
};

const statusLabel = (status) => {
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

const CandidateCard = ({
  candidate,
  onDragStart,
  isDragging,
  onClick,
  allStages,
}) => {
  const [expanded, setExpanded] = useState(false);
  const { t } = useTranslation();
  const fit = getFit(candidate.score, candidate.is_rejected, t);

  const currentStageOrder =
    allStages?.find((s) => s.id === candidate.currentStageId)?.order_index ??
    Infinity;

  const previousStages = (candidate.stagesData || [])
    .filter((as) => {
      const order = as.recruitment_stages?.order_index ?? Infinity;
      return order < currentStageOrder;
    })
    .sort(
      (a, b) =>
        (a.recruitment_stages?.order_index ?? 0) -
        (b.recruitment_stages?.order_index ?? 0),
    );

  return (
    <div
      draggable
      onDragStart={() => onDragStart(candidate)}
      className={`bg-background rounded-2xl border border-border p-4 cursor-grab active:cursor-grabbing select-none transition-all duration-200 hover:shadow-[var(--shadow-lift)] hover:-translate-y-0.5 group ${isDragging ? "opacity-40 scale-95" : ""}`}
      onClick={onClick}
      style={{ boxShadow: "0 1px 4px rgba(1,73,124,0.1)" }}
    >
      <div className="p-4 cursor-grab active:cursor-grabbing select-none">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm shrink-0"
            style={{
              background: "linear-gradient(135deg, #01497c 0%, #012a4a 100%)",
            }}
          >
            {getInitials(candidate.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-deep-space-blue truncate">
              {candidate.name}

              {candidate.is_rejected && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-red-100 text-red-600 border border-red-200 ml-1">
                  Rejected
                </span>
              )}
            </p>
            <p className="text-xs text-air-force-blue mt-0.5">
              {timeAgo(candidate.applied_at)}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center font-bold text-white text-sm shrink-0 font-display">
            {getInitials(candidate.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground truncate font-display">
              {candidate.name}
              {candidate.is_rejected && (
                <span className="ml-1.5 text-[10px] px-2 py-0.5 rounded bg-destructive/10 text-destructive border border-destructive/20 font-sans font-medium">
                  {t("candidate_pipeline.fit.rejected")}
                </span>
              )}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {timeAgo(candidate.applied_at)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          {candidate.hasEvaluation ? (
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${fit.cls}`}
            >
              {fit.label}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border bg-amber-100 text-amber-700 border-amber-200">
              In Progress
            </span>
          )}
          {candidate.hasEvaluation ? (
            <span
              className={`px-2 py-0.5 rounded-lg text-xs font-bold font-display ${scoreColor(candidate.score)}`}
            >
              {candidate.score}
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-gray-100 text-gray-500">
              -/100
            </span>
          )}
        </div>

        {/* Score bar */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-cerulean">Stage score</span>
            <span className="text-xs font-semibold text-rich-cerulean-600">
              {candidate.hasEvaluation ? `${candidate.score}/100` : "-/100"}
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-cerulean-900 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                candidate.score >= 85
                  ? "bg-emerald-500"
                  : candidate.score >= 70
                    ? "bg-yale-blue-600"
                    : candidate.score >= 55
                      ? "bg-air-force-blue-600"
                      : "bg-destructive"
              }`}
              style={{ width: `${candidate.score || 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Expand button — only show if there are previous stages */}
      {previousStages.length > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded((s) => !s);
          }}
          className="w-full flex items-center justify-center gap-1 py-2 text-xs font-semibold text-cerulean hover:text-rich-cerulean border-t border-cerulean-900 transition"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              Hide previous stages
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              {previousStages.length} previous stage
              {previousStages.length > 1 ? "s" : ""}
            </>
          )}
        </button>
      )}

      {/* Expanded previous stages */}
      {expanded && previousStages.length > 0 && (
        <div className="px-4 pb-4 space-y-2 border-t border-cerulean-900 pt-3">
          <p className="text-[10px] font-semibold text-cerulean uppercase tracking-wide mb-2">
            Previous stages
          </p>
          {previousStages.map((as) => {
            const ss = stageScore(as);
            const name = as.recruitment_stages?.name || "Unknown";
            return (
              <div
                key={as.id}
                className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-sky-blue-900/60"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-medium text-deep-space-blue truncate">
                    {name}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {ss != null ? (
                    <span
                      className={`text-xs font-bold px-1.5 py-0.5 rounded ${scoreColor(ss)}`}
                    >
                      {ss}/100
                    </span>
                  ) : null}
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${statusStyle(as.status)}`}
                  >
                    {statusLabel(as.status)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const PipelineColumn = ({
  stage,
  candidates,
  onDragStart,
  dragOverStage,
  onDragOver,
  onDrop,
  draggingCandidate,
  handleStageAutoAdvance,
  onCardClick,
  allStages,
}) => {
  const { t } = useTranslation();
  const isOver = dragOverStage === stage.id;
  const isLocked = stage.is_locked;
  const [openMenu, setOpenMenu] = useState(false);
  const [localMinScore, setLocalMinScore] = useState(stage.min_score ?? 70);

  useEffect(() => {
    setLocalMinScore(stage.min_score ?? 70);
  }, [stage.min_score]);

  return (
    <div
      className={`flex flex-col min-w-[270px] w-[270px] shrink-0 rounded-2xl transition-all duration-200 ${
        isOver && !isLocked ? "ring-2 ring-air-force-blue ring-offset-2" : ""
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        if (!isLocked) onDragOver(stage.id);
      }}
      onDrop={() => {
        if (!isLocked) onDrop(stage.id);
      }}
    >
      <div className="flex items-center justify-between px-4 py-3 mb-3">
        <div className="flex items-center gap-2 min-w-0 min-w-0 flex-1">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{
              background: `hsl(${210 - stage.order_index * 10}, 70%, ${55 - stage.order_index * 3}%)`,
            }}
          />
          <span className="text-sm font-bold text-foreground font-display truncate">
            {stage.name}
          </span>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-secondary text-muted-foreground border border-border ml-1 shrink-0">
            {candidates.length}
          </span>
          {isLocked && (
            <Lock
              className="w-3 h-3 text-muted-foreground/60 ml-0.5 shrink-0"
              title={t("candidate_pipeline.locked_stage")}
            />
          )}

          {!isLocked && (
            <div className="relative ml-2 shrink-0">
              <button
                onClick={() => setOpenMenu((s) => !s)}
                className="text-muted-foreground hover:text-foreground font-bold transition-colors"
              >
                ⋯
              </button>

              {openMenu && (
                <div className="absolute left-0 mt-2 w-44 bg-background border border-border rounded-xl shadow-[var(--shadow-lift)] p-2 z-50">
                  <div className="p-2">
                    <p className="text-xs mb-1 text-muted-foreground font-medium">
                      {t("candidate_pipeline.min_score")}
                    </p>
                    <input
                      type="number"
                      value={localMinScore}
                      onChange={(e) => setLocalMinScore(Number(e.target.value))}
                      className="w-full px-2 py-1 text-xs border border-border rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <button
                      onClick={async () => {
                        await updateStageMinScore(stage.id, localMinScore);
                        setOpenMenu(false);
                      }}
                      className="w-full text-center text-xs mt-2 bg-primary text-white px-2 py-1 rounded font-medium hover:opacity-90 transition-opacity"
                    >
                      {t("candidate_pipeline.save")}
                    </button>
                  </div>
                  <button
                    className="w-full text-left text-xs p-2 hover:bg-sky-blue-900 rounded"
                    onClick={() => handleStageAutoAdvance(stage.id)}
                  >
                    {t("candidate_pipeline.auto_advance")}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div
        className={`flex-1 overflow-y-auto space-y-3 px-1 pb-4 pr-2 transition-all duration-200 ${
          isOver && !isLocked ? "bg-secondary/40 rounded-xl" : ""
        }`}
        style={{ maxHeight: "calc(100vh - 230px)", minHeight: 120 }}
      >
        {candidates.length === 0 ? (
          <div
            className={`rounded-xl border-2 border-dashed h-24 flex items-center justify-center transition-all ${
              isLocked
                ? "border-border bg-secondary/30 text-muted-foreground/50"
                : isOver
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border text-muted-foreground/40"
            }`}
          >
            <p className="text-xs font-medium">
              {isLocked
                ? t("candidate_pipeline.auto_managed")
                : t("candidate_pipeline.drop_here")}
            </p>
          </div>
        ) : (
          candidates.map((c) => (
            <CandidateCard
              key={c.id}
              candidate={c}
              onDragStart={onDragStart}
              isDragging={draggingCandidate?.id === c.id}
              onClick={() => onCardClick(c)}
              allStages={allStages}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default function PipelineCandidatesPage({ company, jobs = [] }) {
  const { t } = useTranslation();
  const [candidates, setCandidates] = useState([]);
  const [stages, setStages] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [search, setSearch] = useState("");
  const [filterFit, setFilterFit] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [draggingCandidate, setDraggingCandidate] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingDrop, setLoadingDrop] = useState(false);
  const searchRef = useRef(null);
  const [stageSettings, setStageSettings] = useState({});
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Shortlist modal
  const [showShortlistModal, setShowShortlistModal] = useState(false);
  const [criteria, setCriteria] = useState("");
  const [minScore, setMinScore] = useState(70);
  const [generatingCriteria, setGeneratingCriteria] = useState(false);
  const [scoreReasoning, setScoreReasoning] = useState("");
  const [advancingToShortlist, setAdvancingToShortlist] = useState(false);

  async function handleAutoGenerateCriteria() {
    if (!selectedJobId) return;
    setGeneratingCriteria(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "auto-generate-criteria",
        {
          body: { jobId: selectedJobId },
        },
      );
      if (error)
        throw new Error(error.message || "Failed to generate criteria");
      if (data.criteria) setCriteria(data.criteria);
      if (data.suggestedMinScore) setMinScore(data.suggestedMinScore);
      if (data.scoreReasoning) setScoreReasoning(data.scoreReasoning);
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingCriteria(false);
    }
  }

  async function handleAdvanceToShortlist() {
    if (!selectedJobId || !criteria.trim()) return;
    setAdvancingToShortlist(true);
    try {
      const shortlistStage = stages.find((s) => s.stage_type === "shortlist");
      if (!shortlistStage) throw new Error("No Shortlist stage found");

      const precedingStage = stages
        .filter((s) => s.order_index < shortlistStage.order_index)
        .sort((a, b) => b.order_index - a.order_index)[0];
      if (!precedingStage) throw new Error("No stage before Shortlist found");

      const candidateIds = candidates
        .filter((c) => c.currentStageId === precedingStage.id)
        .map((c) => c.id);

      if (candidateIds.length === 0) {
        alert("No candidates in the stage before Shortlist");
        setAdvancingToShortlist(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke(
        "evaluate-shortlist",
        {
          body: {
            applicationIds: candidateIds,
            evaluationCriteria: criteria.trim(),
            minScore,
          },
        },
      );

      if (error) throw new Error(error.message || "Evaluation failed");

      const results = data?.results || [];
      const passed = results.filter((r) => r.passed).length;
      alert(
        `Evaluation complete: ${passed}/${candidateIds.length} candidates advanced to shortlist`,
      );

      setShowShortlistModal(false);
      setCriteria("");
      setMinScore(70);
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to advance to shortlist: " + err.message);
    } finally {
      setAdvancingToShortlist(false);
    }
  }

  // Initialize selected job from URL param or first job
  const [searchParams] = useSearchParams();
  useEffect(() => {
    if (jobs.length === 0) return;
    const urlJobId = searchParams.get("jobId");
    if (urlJobId && jobs.some((j) => j.id === urlJobId)) {
      setSelectedJobId(urlJobId);
    } else if (!selectedJobId) {
      setSelectedJobId(jobs[0].id);
    }
  }, [jobs, selectedJobId, searchParams]);

  useEffect(() => {
    if (!selectedJobId) return;
    getJobStages(selectedJobId).then(({ data }) => {
      setStages(data || []);
    });
  }, [selectedJobId]);

  useEffect(() => {
    if (!company?.id) return;
    setLoading(true);
    getPipelineCandidates(company.id)
      .then(async ({ data, error }) => {
        if (error) {
          console.error(error);
          return;
        }

        const stagesToFix = [];

        const mapped = (data || []).map((app) => {
          const allStages = app.application_stages || [];

          let currentStageId = app.current_stage_id;

          if (!currentStageId && allStages.length > 0) {
            // current_stage_id cascade-nulled (stage deleted) or never set
            // Find the last stage with an evaluation score
            const scored = allStages
              .filter(
                (s) =>
                  s.recruitment_stages &&
                  s.application_stage_evaluations?.length > 0 &&
                  s.application_stage_evaluations[0].ai_score != null,
              )
              .sort(
                (a, b) =>
                  (a.recruitment_stages.order_index || 0) -
                  (b.recruitment_stages.order_index || 0),
              );

            const lastScored = scored[scored.length - 1];
            if (lastScored) {
              currentStageId = lastScored.recruitment_stages.id;
            } else {
              // No evaluated stage — put them at the first available stage
              const sorted = [...allStages]
                .filter((s) => s.recruitment_stages)
                .sort(
                  (a, b) =>
                    (a.recruitment_stages.order_index || 0) -
                    (b.recruitment_stages.order_index || 0),
                );
              currentStageId = sorted[0]?.recruitment_stages?.id || null;
            }

            if (currentStageId) {
              stagesToFix.push({ id: app.id, newStageId: currentStageId });
            }
          }

          const currentStage = currentStageId
            ? allStages.find((s) => s.recruitment_stages?.id === currentStageId)
            : null;

          let evaluation = null;
          let score = 0;

          if (currentStage) {
            evaluation =
              currentStage.application_stage_evaluations?.[0] ?? null;

            if (evaluation?.ai_score != null) {
              score = Math.round(Number(evaluation.ai_score));
            } else if (currentStage.score != null) {
              score = Math.round(Number(currentStage.score));
            }
          }

          const hasEvaluation =
            evaluation !== null || currentStage?.score != null;

          const isRejected =
            app.is_rejected || evaluation?.recommendation === "reject";

          return {
            id: app.id,
            jobId: app.job_postings?.id,
            name:
              app.profiles?.full_name ||
              t("candidate_pipeline.unknown_candidate"),
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
        });

        setCandidates(mapped);

        // Persist fixed current_stage_id back to DB
        for (const fix of stagesToFix) {
          await supabase
            .from("applications")
            .update({ current_stage_id: fix.newStageId })
            .eq("id", fix.id);
        }
      })
      .finally(() => setLoading(false));
  }, [company?.id]);

  const filtered = candidates.filter((c) => {
    if (selectedJobId && c.jobId !== selectedJobId) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()))
      return false;

    if (filterFit === t("candidate_pipeline.fit.rejected"))
      return c.is_rejected;
    if (filterFit !== t("candidate_pipeline.filters.all")) {
      const fitLabel = c.hasEvaluation
        ? getFit(c.score, c.is_rejected, t).label
        : "In Progress";
      if (fitLabel !== filterFit) return false;
    }

    return true;
  });

  const byStage = (stageId) =>
    filtered.filter((c) => {
      if (c.currentStageId === stageId) return true;
      if (c.currentStageId === null && stageId === stages[0]?.id) return true;
      return false;
    });
  const totalInFlight = filtered.length;

  const handleDragStart = (candidate) => setDraggingCandidate(candidate);

  const handleDrop = async (targetStageId) => {
    console.log("DROP FIRED", { targetStageId, draggingCandidate });
    if (!draggingCandidate || loadingDrop) return;

    const candidateId = draggingCandidate.id;

    const candidate = candidates.find((c) => c.id === candidateId);
    console.log("CANDIDATE FOUND", candidate);
    if (!candidate) return;

    const targetStage = stages.find((s) => s.id === targetStageId);
    console.log("TARGET STAGE", targetStage);
    if (!targetStage || targetStage.is_locked) return;

    const currentStage = stages.find((s) => s.id === candidate.currentStageId);
    console.log("CURRENT STAGE", currentStage);
    if (!currentStage) return;

    const sorted = [...stages].sort((a, b) => a.order_index - b.order_index);
    const currentIndex = sorted.findIndex((s) => s.id === currentStage.id);
    const targetIndex = sorted.findIndex((s) => s.id === targetStage.id);
    console.log("INDICES", { currentIndex, targetIndex });

    if (targetIndex !== currentIndex + 1) {
      console.log("BLOCKED: not forward +1");
      return;
    }

    setLoadingDrop(true);
    const prevState = [...candidates];

    setCandidates((prev) =>
      prev.map((c) =>
        c.id === candidateId ? { ...c, currentStageId: targetStageId } : c,
      ),
    );

    try {
      const { error } = await moveToStage(candidateId, targetStageId);
      if (error) throw error;
    } catch (err) {
      console.error("DROP FAILED:", err);
      setCandidates(prevState);
    } finally {
      setDraggingCandidate(null);
      setDragOverStage(null);
      setLoadingDrop(false);
    }
  };

  const handleStageAutoAdvance = async (stageId) => {
    if (!selectedJobId) return;
    try {
      const minScore =
        stageSettings[stageId]?.min_score ??
        stages.find((s) => s.id === stageId)?.min_score ??
        70;

      const { advancedCount } = await autoAdvanceToShortlist(
        selectedJobId,
        minScore,
      );

      if (advancedCount > 0) {
        alert(
          t("candidate_pipeline.alerts.advanced_success", {
            count: advancedCount,
          }),
        );
      } else {
        alert(t("candidate_pipeline.alerts.no_match"));
      }
    } catch (err) {
      console.error(err);
      alert(t("candidate_pipeline.alerts.auto_advance_failed"));
    }
  };
  const handleAutoAdvance = async () => {
    if (!selectedJobId) return;
    setIsAdvancing(true);
    try {
      const { advancedCount } = await autoAdvanceToShortlist(selectedJobId, 70);
      if (advancedCount > 0) {
        alert(
          t("candidate_pipeline.alerts.shortlist_success", {
            count: advancedCount,
          }),
        );
        loadCandidates(selectedJobId);
      } else {
        alert(t("candidate_pipeline.alerts.no_candidates"));
      }
    } catch (err) {
      console.error("Auto advance error:", err);
      alert(t("candidate_pipeline.alerts.failed"));
    } finally {
      setIsAdvancing(false);
    }
  };
  console.log(stages);
  return (
    <div
      className="flex flex-col h-[calc(100vh-64px)] bg-secondary/20 overflow-hidden"
      onDragEnd={() => {
        if (!loadingDrop) {
          setDraggingCandidate(null);
          setDragOverStage(null);
        }
      }}
    >
      <div className="bg-background border-b border-border px-6 py-4 sticky top-0 z-30">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-foreground font-display">
              {t("candidate_pipeline.title")}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <select
                value={selectedJobId || ""}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="text-xs font-bold text-primary bg-secondary border border-border rounded-lg px-2 py-1 outline-none cursor-pointer focus:ring-2 focus:ring-primary/20"
              >
                {jobs.length === 0 && (
                  <option value="">{t("candidate_pipeline.no_jobs")}</option>
                )}
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title}
                  </option>
                ))}
              </select>
              <span className="text-xs text-muted-foreground">
                ·{" "}
                <span className="font-bold text-primary font-display">
                  {totalInFlight}
                </span>{" "}
                {t("candidate_pipeline.candidates_in_flight")}
              </span>
            </div>
          </div>

          <div className="flex-1 max-w-sm relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("candidate_pipeline.search_placeholder")}
              className="w-full h-10 rounded-xl pl-9 pr-4 text-sm text-foreground bg-secondary border border-border outline-none placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/30 focus:border-transparent transition-all"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowShortlistModal(true);
                setScoreReasoning("");
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition bg-deep-space-blue text-white border-deep-space-blue hover:bg-yale-blue-600"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Advance to Shortlist
            </button>
            <button
              onClick={() => setShowFilters((s) => !s)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all ${
                showFilters
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "border-border text-foreground bg-background hover:bg-secondary"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              {t("candidate_pipeline.filters.title")}
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-border flex items-center gap-3 flex-wrap">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide font-display">
              {t("candidate_pipeline.filters.fit")}
            </span>
            {[
              t("candidate_pipeline.filters.all"),
              "In Progress",
              t("candidate_pipeline.fit.strong_fit"),
              t("candidate_pipeline.fit.good_fit"),
              t("candidate_pipeline.fit.needs_review"),
              t("candidate_pipeline.fit.low_fit"),
              t("candidate_pipeline.fit.rejected"),
            ].map((f) => (
              <button
                key={f}
                onClick={() => setFilterFit(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  filterFit === f
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-background text-foreground border-border hover:bg-secondary"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-32">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && candidates.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-16 h-16 rounded-full bg-secondary border border-border flex items-center justify-center mb-4">
            <Search className="w-7 h-7 text-muted-foreground/60" />
          </div>
          <h2 className="text-foreground text-lg font-bold mb-1 font-display">
            {t("candidate_pipeline.empty.title")}
          </h2>
          <p className="text-muted-foreground text-sm max-w-xs">
            {t("candidate_pipeline.empty.subtitle")}
          </p>
        </div>
      )}

      {!loading && candidates.length > 0 && (
        <>
          <div className="px-6 py-4 flex items-center gap-3 overflow-x-auto shrink-0">
            {stages.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-background border border-border shrink-0 shadow-sm"
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{
                    background: `hsl(${220 - s.order_index * 15}, 70%, 50%)`,
                  }}
                />
                <span className="text-xs font-bold text-foreground font-display">
                  {s.name}
                </span>
                {s.is_locked && (
                  <Lock className="w-2.5 h-2.5 text-muted-foreground/60" />
                )}
                <span className="px-1.5 py-0.5 rounded-full text-xs font-bold bg-secondary text-muted-foreground border border-border/60">
                  {byStage(s.id).length}
                </span>
              </div>
            ))}
          </div>

          <div className="flex-1 overflow-x-auto overflow-y-hidden px-6 pb-6 mt-2">
            <div className="flex gap-4 w-max h-full">
              {stages.map((stage) => (
                <PipelineColumn
                  key={stage.id}
                  stage={stage}
                  candidates={byStage(stage.id)}
                  onDragStart={handleDragStart}
                  draggingCandidate={draggingCandidate}
                  dragOverStage={dragOverStage}
                  onDragOver={setDragOverStage}
                  onDrop={handleDrop}
                  stageSettings={stageSettings}
                  setStageSettings={setStageSettings}
                  handleStageAutoAdvance={handleStageAutoAdvance}
                  onCardClick={setSelectedCandidate}
                  allStages={stages}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {selectedCandidate && (
        <CandidateSidebar
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          onUpdate={(id, updates) => {
            setCandidates((prev) =>
              prev.map((c) => (c.id === id ? { ...c, ...updates } : c)),
            );
            setSelectedCandidate((prev) =>
              prev?.id === id ? { ...prev, ...updates } : prev,
            );
          }}
        />
      )}

      {/* ── Advance to Shortlist Modal ── */}
      {showShortlistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-cerulean-900">
              <div>
                <h2 className="text-lg font-bold text-deep-space-blue">
                  Advance to Shortlist
                </h2>
                <p className="text-xs text-cerulean mt-0.5">
                  Set criteria and minimum score for AI evaluation
                </p>
              </div>
              <button
                onClick={() => setShowShortlistModal(false)}
                className="p-1.5 rounded-lg text-cerulean hover:text-rich-cerulean hover:bg-sky-blue-900 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-5">
              {/* Evaluation Criteria */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-cerulean uppercase tracking-wide">
                    Evaluation Criteria
                  </label>
                  <button
                    onClick={handleAutoGenerateCriteria}
                    disabled={generatingCriteria}
                    className="flex items-center gap-1 text-xs font-semibold text-rich-cerulean hover:text-yale-blue-600 transition disabled:opacity-50"
                  >
                    {generatingCriteria ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3" />
                    )}
                    Auto-generate
                  </button>
                </div>
                <textarea
                  value={criteria}
                  onChange={(e) => setCriteria(e.target.value)}
                  placeholder="Describe what makes a strong candidate for this role..."
                  rows={5}
                  className="w-full rounded-xl px-4 py-3 text-sm text-deep-space-blue bg-sky-blue-900 border border-cerulean-900 outline-none focus:border-rich-cerulean transition placeholder:text-steel-blue resize-none"
                />
              </div>

              {/* Min Score */}
              <div>
                <label className="block text-xs font-semibold text-cerulean uppercase tracking-wide mb-2">
                  Minimum Score
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={minScore}
                    onChange={(e) => {
                      setMinScore(Number(e.target.value));
                      setScoreReasoning("");
                    }}
                    className="flex-1 accent-rich-cerulean"
                  />
                  <span className="text-lg font-bold text-deep-space-blue w-10 text-right">
                    {minScore}
                  </span>
                </div>
                <p className="text-xs text-cerulean mt-1">
                  Candidates below this score will be rejected
                </p>
                {scoreReasoning && (
                  <p className="text-xs text-rich-cerulean mt-1.5 italic">
                    {scoreReasoning}
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-cerulean-900 bg-sky-blue-900 rounded-b-2xl">
              <button
                onClick={() => setShowShortlistModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-cerulean bg-white border border-cerulean-900 hover:bg-sky-blue-900 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAdvanceToShortlist}
                disabled={advancingToShortlist || !criteria.trim()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-deep-space-blue hover:bg-yale-blue-600 transition disabled:opacity-50"
              >
                {advancingToShortlist ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Evaluating...
                  </>
                ) : (
                  "Confirm & Advance"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
