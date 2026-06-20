import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import {
  getPipelineCandidates,
  getJobStages,
  moveToStage,
  autoAdvanceToShortlist,
  updateStageMinScore,
} from "../services/candidatesPipline.service";
import { useTranslation } from "react-i18next";
import { useUser } from "@/features/auth/context/user.context";
import CandidateSidebar from "../components/CandidateSidebar";
import PipelineHeader from "../components/PipelineHeader";
import PipelineColumn from "../components/PipelineColumn";
import ShortlistModal from "../components/ShortlistModal";
import ShortlistResultModal from "../components/ShortlistResultModal";
import {
  getFit,
  mapApplicationToCandidate,
} from "../components/pipelineHelpers";
import { supabase } from "@/shared/services/supabase";

export default function PipelineCandidatesPage({ company, jobs = [] }) {
  const { t } = useTranslation();
  const { user } = useUser();
  const recruiterName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "";
  const recruiterEmail = user?.email || "";
  const companyName = company?.name || "";
  const [candidates, setCandidates] = useState([]);
  const [stages, setStages] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [search, setSearch] = useState("");
  const [filterFit, setFilterFit] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [draggingCandidate, setDraggingCandidate] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingDrop, setLoadingDrop] = useState(false);
  const searchRef = useRef(null);
  const [stageSettings, setStageSettings] = useState({});
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const [showShortlistModal, setShowShortlistModal] = useState(false);
  const [criteria, setCriteria] = useState("");
  const [minScore, setMinScore] = useState(70);
  const [generatingCriteria, setGeneratingCriteria] = useState(false);
  const [scoreReasoning, setScoreReasoning] = useState("");
  const [advancingToShortlist, setAdvancingToShortlist] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [shortlistResult, setShortlistResult] = useState(null);

  async function handleAutoGenerateCriteria() {
    if (!selectedJobId) return;
    setGeneratingCriteria(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "auto-generate-criteria",
        { body: { jobId: selectedJobId } },
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
        setShowShortlistModal(false);
        setShortlistResult({ error: "No candidates in the stage before Shortlist" });
        setShowResultModal(true);
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

      setShowShortlistModal(false);
      setCriteria("");
      setMinScore(70);
      setShortlistResult({ passed, total: candidateIds.length });
      setShowResultModal(true);
    } catch (err) {
      console.error(err);
      setShowShortlistModal(false);
      setShortlistResult({ error: err.message });
      setShowResultModal(true);
    } finally {
      setAdvancingToShortlist(false);
    }
  }

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

          // Re-derive currentStageId-based fields via shared mapper, but
          // mapApplicationToCandidate uses app.current_stage_id directly,
          // so build a shallow copy with the resolved currentStageId.
          return mapApplicationToCandidate(
            { ...app, current_stage_id: currentStageId },
            t,
          );
        });

        setCandidates(mapped);

        for (const fix of stagesToFix) {
          await supabase
            .from("applications")
            .update({ current_stage_id: fix.newStageId })
            .eq("id", fix.id);
        }
      })
      .finally(() => setLoading(false));
  }, [company?.id, t]);

  // ------- Realtime: auto-refresh pipeline when applications change -------
  useEffect(() => {
    if (!company?.id) return;

    const refetchAndMap = () => {
      getPipelineCandidates(company.id).then(({ data, error }) => {
        if (error || !data) return;
        const mapped = (data || []).map((app) =>
          mapApplicationToCandidate(app, t),
        );
        setCandidates(mapped);
      });
    };

    const channel = supabase
      .channel(`pipeline-page-${company.id}-${Date.now()}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "applications" },
        refetchAndMap,
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "applications" },
        refetchAndMap,
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [company?.id, t]);
  // -------------------------------------------------------------------------

  const filtered = candidates.filter((c) => {
    if (selectedJobId && c.jobId !== selectedJobId) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()))
      return false;
    if (filterFit === "rejected") return c.is_rejected;
    if (filterFit !== "all") {
      const fitKey = c.hasEvaluation
        ? getFit(c.score, c.is_rejected, t).key
        : "in_progress";
      if (fitKey !== filterFit) return false;
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
    if (!draggingCandidate || loadingDrop) return;

    const candidateId = draggingCandidate.id;
    const candidate = candidates.find((c) => c.id === candidateId);
    if (!candidate) return;

    const targetStage = stages.find((s) => s.id === targetStageId);
    if (!targetStage || targetStage.is_locked) return;

    const currentStage = stages.find((s) => s.id === candidate.currentStageId);
    if (!currentStage) return;

    const sorted = [...stages].sort((a, b) => a.order_index - b.order_index);
    const currentIndex = sorted.findIndex((s) => s.id === currentStage.id);
    const targetIndex = sorted.findIndex((s) => s.id === targetStage.id);

    if (targetIndex !== currentIndex + 1) return;

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
      const minScoreVal =
        stageSettings[stageId]?.min_score ??
        stages.find((s) => s.id === stageId)?.min_score ??
        70;
      const { advancedCount } = await autoAdvanceToShortlist(
        selectedJobId,
        minScoreVal,
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

  const handleAdvanceAll = async (stageId) => {
    const currentStage = stages.find((s) => s.id === stageId);
    if (!currentStage) return;

    const sorted = [...stages].sort((a, b) => a.order_index - b.order_index);

    const currentIndex = sorted.findIndex((s) => s.id === stageId);
    const nextStage = sorted[currentIndex + 1];

    if (!nextStage) return;

    const shortlistStage = stages.find((s) => s.stage_type === "shortlist");

    const isBeforeShortlist =
      shortlistStage && nextStage.id === shortlistStage.id;

    if (isBeforeShortlist) {
      setShowShortlistModal(true);
      return;
    }

    if (nextStage.is_locked) return;

    const stageCandidates = byStage(stageId);
    if (stageCandidates.length === 0) return;

    const eligible = stageCandidates.filter((c) => {
      const stageData = c.stagesData?.find(
        (as) =>
          as.recruitment_stages?.id === stageId ||
          as.recruitment_stages?.id === currentStage.id,
      );

      const score =
        stageData?.score ??
        stageData?.application_stage_evaluations?.[0]?.ai_score ??
        null;

      const hasScore = score != null;
      const minScoreVal = currentStage?.min_score ?? 0;

      return hasScore && Number(score) >= minScoreVal;
    });

    if (eligible.length === 0) return;

    setLoadingDrop(true);

    const prevState = [...candidates];

    // optimistic UI update
    setCandidates((prev) =>
      prev.map((c) =>
        eligible.find((ec) => ec.id === c.id)
          ? { ...c, currentStageId: nextStage.id }
          : c,
      ),
    );

    try {
      await Promise.all(eligible.map((c) => moveToStage(c.id, nextStage.id)));
    } catch (err) {
      console.error("Advance all failed:", err);
      setCandidates(prevState);
    } finally {
      setLoadingDrop(false);
    }
  };

  return (
    <div
      className="flex flex-col h-[calc(100vh-64px)] bg-muted/20 text-foreground overflow-hidden"
      onDragEnd={() => {
        if (!loadingDrop) {
          setDraggingCandidate(null);
          setDragOverStage(null);
        }
      }}
    >
      <PipelineHeader
        selectedJobId={selectedJobId}
        setSelectedJobId={setSelectedJobId}
        jobs={jobs}
        totalInFlight={totalInFlight}
        search={search}
        setSearch={setSearch}
        searchRef={searchRef}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        filterFit={filterFit}
        setFilterFit={setFilterFit}
        onOpenShortlistModal={() => {
          setShowShortlistModal(true);
          setScoreReasoning("");
        }}
      />

      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-center py-32"
        >
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </motion.div>
      )}

      {!loading && candidates.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col items-center justify-center py-32 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-muted border border-border flex items-center justify-center mb-4">
            <Search className="w-7 h-7 text-muted-foreground/60" />
          </div>
          <h2 className="text-foreground text-lg font-bold mb-1 font-display">
            {t("candidate_pipeline.empty.title")}
          </h2>
          <p className="text-muted-foreground text-sm max-w-xs">
            {t("candidate_pipeline.empty.subtitle")}
          </p>
        </motion.div>
      )}

      {!loading && candidates.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className="px-6 py-6 flex flex-col md:flex-row items-start gap-5 overflow-y-auto md:overflow-x-auto flex-1 h-full scrollbar-thin"
        >
          {stages.map((s, idx) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.4,
                delay: 0.25 + idx * 0.08,
                ease: "easeOut",
              }}
            >
              <PipelineColumn
                stage={s}
                candidates={byStage(s.id)}
                onDragStart={handleDragStart}
                dragOverStage={dragOverStage}
                onDragOver={setDragOverStage}
                onDrop={handleDrop}
                draggingCandidate={draggingCandidate}
                handleStageAutoAdvance={handleStageAutoAdvance}
                handleAdvanceAll={handleAdvanceAll}
                loadingDrop={loadingDrop}
                allStages={stages}
                onCardClick={(c) => setSelectedCandidate(c)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {selectedCandidate && (
        <CandidateSidebar
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          allStages={stages}
          recruiterName={recruiterName}
          recruiterEmail={recruiterEmail}
          companyName={companyName}
          onUpdate={(applicationId, updates) => {
            setCandidates((prev) =>
              prev.map((c) =>
                c.id === applicationId ? { ...c, ...updates } : c,
              ),
            );
            setSelectedCandidate((prev) =>
              prev?.id === applicationId ? { ...prev, ...updates } : prev,
            );
          }}
        />
      )}

      {showShortlistModal && (
        <ShortlistModal
          onClose={() => setShowShortlistModal(false)}
          criteria={criteria}
          setCriteria={setCriteria}
          minScore={minScore}
          setMinScore={setMinScore}
          scoreReasoning={scoreReasoning}
          generatingCriteria={generatingCriteria}
          onAutoGenerate={handleAutoGenerateCriteria}
          advancingToShortlist={advancingToShortlist}
          onRunEvaluation={handleAdvanceToShortlist}
          selectedJobId={selectedJobId}
        />
      )}

      {showResultModal && shortlistResult && (
        <ShortlistResultModal
          result={shortlistResult}
          onClose={() => window.location.reload()}
        />
      )}
    </div>
  );
}

// import { useState, useEffect, useRef } from "react";
// import { motion } from "framer-motion";
// import { useSearchParams } from "react-router-dom";
// import {
//   Lock,
//   Search,
//   SlidersHorizontal,
//   Sparkles,
//   X,
//   Loader2,
//   ChevronDown,
//   ChevronUp,
//   Check,
// } from "lucide-react";
// import {
//   getPipelineCandidates,
//   getJobStages,
//   moveToStage,
//   autoAdvanceToShortlist,
//   updateStageMinScore,
// } from "../services/candidatesPipline.service";
// import { useTranslation } from "react-i18next";
// import { useUser } from "@/features/auth/context/user.context";
// import CandidateSidebar from "../components/CandidateSidebar";
// import { supabase } from "@/shared/services/supabase";

// function getInitials(name = "") {
//   return (
//     (name || "")
//       .split(" ")
//       .map((n) => n[0])
//       .join("")
//       .slice(0, 2)
//       .toUpperCase() || "?"
//   );
// }

// function timeAgo(date) {
//   const diff = Date.now() - new Date(date).getTime();
//   const days = Math.floor(diff / 86400000);
//   if (days > 0) return `${days}d ago`;
//   const hours = Math.floor(diff / 3600000);
//   if (hours > 0) return `${hours}h ago`;
//   const mins = Math.floor(diff / 60000);
//   return `${mins}m ago`;
// }

// const scoreColor = (s) => {
//   if (s >= 85) return "bg-success/10 text-success border-success/20";
//   if (s >= 70) return "bg-primary/10 text-primary border-primary/20";
//   if (s >= 55) return "bg-warning/10 text-warning border-warning/20";
//   return "bg-destructive/10 text-destructive border-destructive/20";
// };

// // function getFit(score, isRejected, t) {
// //   if (isRejected) {
// //     return {
// //       label: t("candidate_pipeline.fit.rejected"),
// //       cls: "bg-destructive/10 text-destructive border-destructive/20",
// //     };
// //   }
// //   if (score >= 85)
// //     return {
// //       label: t("candidate_pipeline.fit.strong_fit"),
// //       cls: "bg-success/10 text-success border-success/20",
// //     };
// //   if (score >= 70)
// //     return {
// //       label: t("candidate_pipeline.fit.good_fit"),
// //       cls: "bg-primary/10 text-primary border-primary/20",
// //     };
// //   if (score >= 55)
// //     return {
// //       label: t("candidate_pipeline.fit.needs_review"),
// //       cls: "bg-warning/10 text-warning border-warning/20",
// //     };
// //   return {
// //     label: t("candidate_pipeline.fit.low_fit"),
// //     cls: "bg-destructive/10 text-destructive border-destructive/20",
// //   };
// // }

// function getFit(score, isRejected, t) {
//   if (isRejected) {
//     return {
//       key: "rejected",
//       label: t("candidate_pipeline.fit.rejected"),
//       cls: "bg-destructive/10 text-destructive border-destructive/20",
//     };
//   }
//   if (score >= 85)
//     return {
//       key: "strong_fit",
//       label: t("candidate_pipeline.fit.strong_fit"),
//       cls: "bg-success/10 text-success border-success/20",
//     };
//   if (score >= 70)
//     return {
//       key: "good_fit",
//       label: t("candidate_pipeline.fit.good_fit"),
//       cls: "bg-primary/10 text-primary border-primary/20",
//     };
//   if (score >= 55)
//     return {
//       key: "needs_review",
//       label: t("candidate_pipeline.fit.needs_review"),
//       cls: "bg-warning/10 text-warning border-warning/20",
//     };
//   return {
//     key: "low_fit",
//     label: t("candidate_pipeline.fit.low_fit"),
//     cls: "bg-destructive/10 text-destructive border-destructive/20",
//   };
// }

// const stageScore = (as) => {
//   if (as.score != null) return Math.round(Number(as.score));
//   const evals = as.application_stage_evaluations;
//   const list = evals ? (Array.isArray(evals) ? evals : [evals]) : [];
//   if (list.length > 0 && list[0].ai_score != null)
//     return Math.round(Number(list[0].ai_score));
//   return null;
// };

// const statusStyle = (status) => {
//   switch (status) {
//     case "passed":
//       return "bg-success/10 text-success border-success/20";
//     case "in_progress":
//       return "bg-warning/10 text-warning border-warning/20";
//     case "failed":
//       return "bg-destructive/10 text-destructive border-destructive/20";
//     default:
//       return "bg-muted text-muted-foreground border-border";
//   }
// };

// const statusLabel = (status) => {
//   switch (status) {
//     case "passed":
//       return "Passed";
//     case "in_progress":
//       return "In Progress";
//     case "failed":
//       return "Failed";
//     default:
//       return "Pending";
//   }
// };

// // const CandidateCard = ({
// //   candidate,
// //   onDragStart,
// //   isDragging,
// //   onClick,
// //   allStages,
// // }) => {
// //   const [expanded, setExpanded] = useState(false);
// //   const { t } = useTranslation();
// //   const fit = getFit(candidate.score, candidate.is_rejected, t);

// //   const currentStageOrder =
// //     allStages?.find((s) => s.id === candidate.currentStageId)?.order_index ??
// //     Infinity;
// const CandidateCard = ({
//   candidate,
//   onDragStart,
//   isDragging,
//   onClick,
//   allStages,
// }) => {
//   const [expanded, setExpanded] = useState(false);
//   const { t } = useTranslation();
//   const fit = getFit(candidate.score, candidate.is_rejected, t);

//   const currentStage = allStages?.find(
//     (s) => s.id === candidate.currentStageId,
//   );
//   const isOfferStage = currentStage?.stage_type === "offer";

//   const currentStageOrder = currentStage?.order_index ?? Infinity;

//   const previousStages = (candidate.stagesData || [])
//     .filter((as) => {
//       const order = as.recruitment_stages?.order_index ?? Infinity;
//       return order < currentStageOrder;
//     })
//     .sort(
//       (a, b) =>
//         (a.recruitment_stages?.order_index ?? 0) -
//         (b.recruitment_stages?.order_index ?? 0),
//     );

//   return (
//     <div
//       draggable
//       onDragStart={() => onDragStart(candidate)}
//       className={`bg-surface rounded-2xl border border-border/80 p-4 cursor-grab active:cursor-grabbing select-none flex flex-col justify-between min-h-[165px] transition-all duration-200 hover:shadow-md dark:hover:shadow-neutral-950/50 hover:-translate-y-0.5 group ${isDragging ? "opacity-40 scale-95" : ""}`}
//       onClick={onClick}
//     >
//       <div className="flex flex-col flex-1 justify-between">
//         <div className="flex items-start gap-3 mb-3 min-w-0">
//           <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-xs shrink-0 font-display shadow-xs">
//             {" "}
//             {getInitials(candidate.name)}
//           </div>
//           <div className="flex-1 min-w-0">
//             <p className="text-xs font-bold text-foreground truncate font-display leading-snug group-hover:text-primary transition-colors">
//               {candidate.name}
//             </p>
//             <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">
//               {timeAgo(candidate.applied_at)}
//             </p>
//           </div>
//         </div>

//         <div className="flex items-center justify-between gap-2 mb-3">
//           {candidate.hasEvaluation ? (
//             <span
//               className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border tracking-wide uppercase ${fit.cls}`}
//             >
//               {fit.label}
//             </span>
//           ) : (
//             <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border bg-warning/10 text-warning border-warning/20 tracking-wide uppercase">
//               In Progress
//             </span>
//           )}

//           {candidate.is_rejected && !candidate.hasEvaluation && (
//             <span className="text-[10px] px-2 py-0.5 rounded bg-destructive/10 text-destructive border border-destructive/20 font-medium uppercase tracking-wide">
//               {t("candidate_pipeline.fit.rejected")}
//             </span>
//           )}

//           {isOfferStage ? (
//             <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-success/10 text-success border border-success/20 shrink-0">
//               <Check className="w-3.5 h-3.5" />
//             </span>
//           ) : (
//             <span
//               className={`px-2 py-0.5 rounded-lg text-[11px] font-bold font-display tracking-tight shrink-0 ${candidate.hasEvaluation ? scoreColor(candidate.score) : "bg-muted text-muted-foreground border border-border"}`}
//             >
//               {candidate.hasEvaluation ? candidate.score : "-/100"}
//             </span>
//           )}
//         </div>

//         {isOfferStage ? (
//           <div className="mb-1 w-full flex items-center gap-2 px-2 py-1.5 rounded-lg bg-success/10 border border-success/20 text-success">
//             <Check className="w-3.5 h-3.5 shrink-0" />
//             <span className="text-[11px] font-bold">Offer Extended</span>
//           </div>
//         ) : (
//           <div className="mb-1 w-full">
//             <div className="flex items-center justify-between mb-1 text-[11px] font-medium text-muted-foreground">
//               <span>Stage score</span>
//               <span className="font-bold text-foreground">
//                 {candidate.hasEvaluation ? `${candidate.score}/100` : "-/100"}
//               </span>
//             </div>
//             <div className="w-full h-1.5 rounded-full bg-muted border border-border/30 overflow-hidden">
//               <div
//                 className={`h-full rounded-full transition-all duration-500 ${
//                   candidate.score >= 85
//                     ? "bg-success"
//                     : candidate.score >= 70
//                       ? "bg-primary"
//                       : candidate.score >= 55
//                         ? "bg-warning"
//                         : "bg-destructive"
//                 }`}
//                 style={{ width: `${candidate.score || 0}%` }}
//               />
//             </div>
//           </div>
//         )}
//       </div>

//       {previousStages.length > 0 ? (
//         <button
//           onClick={(e) => {
//             e.stopPropagation();
//             setExpanded((s) => !s);
//           }}
//           className="w-full flex items-center justify-center gap-1 pt-2.5 mt-2 text-[10px] sm:text-xs md:text-sm font-bold text-muted-foreground hover:text-primary border-t border-border/40 transition-colors cursor-pointer shrink-0"
//         >
//           {expanded ? (
//             <>
//               <ChevronUp className="w-3 h-3" />
//               Hide previous stages
//             </>
//           ) : (
//             <>
//               <ChevronDown className="w-3 h-3" />
//               {previousStages.length} previous stage
//               {previousStages.length > 1 ? "s" : ""}
//             </>
//           )}
//         </button>
//       ) : (
//         <div
//           className="h-6 w-full invisible border-t border-transparent mt-2"
//           aria-hidden="true"
//         />
//       )}

//       {expanded && previousStages.length > 0 && (
//         <div className="mt-2 pt-2 border-t border-border/50 space-y-1.5 w-full animate-fade-in">
//           <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
//             Previous stages
//           </p>
//           {previousStages.map((as) => {
//             const ss = stageScore(as);
//             const name = as.recruitment_stages?.name || "Unknown";
//             return (
//               <div
//                 key={as.id}
//                 className="flex items-center justify-between py-1 px-2 rounded-lg bg-muted/40 border border-border/40"
//               >
//                 <span className="text-[11px] font-medium text-foreground truncate max-w-[110px]">
//                   {name}
//                 </span>
//                 <div className="flex items-center gap-1.5 shrink-0">
//                   {ss != null && (
//                     <span
//                       className={`text-[10px] font-bold px-1 py-0.2 rounded ${scoreColor(ss)}`}
//                     >
//                       {ss}
//                     </span>
//                   )}
//                   <span
//                     className={`text-[9px] font-bold px-1 py-0.2 rounded border uppercase tracking-tight ${statusStyle(as.status)}`}
//                   >
//                     {statusLabel(as.status)}
//                   </span>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// };

// const PipelineColumn = ({
//   stage,
//   candidates,
//   onDragStart,
//   dragOverStage,
//   onDragOver,
//   onDrop,
//   draggingCandidate,
//   handleStageAutoAdvance,
//   handleAdvanceAll,
//   loadingDrop,
//   onCardClick,
//   allStages,
// }) => {
//   const { t } = useTranslation();
//   const isOver = dragOverStage === stage.id;
//   const isLocked = stage.is_locked && stage.name !== "CV Review";
//   const [openMenu, setOpenMenu] = useState(false);
//   const [localMinScore, setLocalMinScore] = useState(stage.min_score ?? 70);

//   useEffect(() => {
//     setLocalMinScore(stage.min_score ?? 70);
//   }, [stage.min_score]);

//   return (
//     <div
//       className={`flex flex-col min-w-[280px] w-[280px] shrink-0 rounded-2xl transition-all duration-200 ${
//         isOver && !isLocked
//           ? "ring-2 ring-primary ring-offset-2 dark:ring-offset-black"
//           : ""
//       }`}
//       onDragOver={(e) => {
//         e.preventDefault();
//         if (!isLocked) onDragOver(stage.id);
//       }}
//       onDrop={() => {
//         if (!isLocked) onDrop(stage.id);
//       }}
//     >
//       <div className="flex items-center justify-between px-2 py-2.5 mb-2">
//         <div className="flex items-center gap-2 min-w-0 flex-1">
//           <span
//             className="w-2.5 h-2.5 rounded-full shrink-0"
//             style={{
//               background: `hsl(${210 - stage.order_index * 12}, 80%, 45%)`,
//             }}
//           />
//           <span className="text-xs font-bold text-foreground font-display truncate">
//             {stage.name}
//           </span>
//           <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-muted text-muted-foreground border border-border/80 ml-1 shrink-0">
//             {candidates.length}
//           </span>
//           {isLocked && (
//             <Lock
//               className="w-3 h-3 text-muted-foreground/60 ml-1 shrink-0"
//               title={t("candidate_pipeline.locked_stage")}
//             />
//           )}

//           {!isLocked && (
//             <button
//               onClick={() => handleAdvanceAll(stage.id)}
//               disabled={loadingDrop}
//               className="ml-auto shrink-0 text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 hover:bg-primary/15 px-2 py-1 rounded-lg transition-all disabled:opacity-50 cursor-pointer"
//             >
//               Advance All
//             </button>
//           )}
//         </div>
//       </div>

//       <div
//         className={`flex-1 overflow-y-auto space-y-3 px-1.5 pb-4 transition-all duration-200 scrollbar-thin ${
//           isOver && !isLocked ? "bg-muted/40 rounded-xl" : ""
//         }`}
//         style={{ maxHeight: "calc(100vh - 240px)", minHeight: 150 }}
//       >
//         {candidates.length === 0 ? (
//           <div
//             className={`rounded-xl border-2 border-dashed h-28 flex items-center justify-center transition-all ${
//               isLocked
//                 ? "border-border/60 bg-muted/10 text-muted-foreground/30"
//                 : isOver
//                   ? "border-primary bg-primary/5 text-primary"
//                   : "border-border text-muted-foreground/20"
//             }`}
//           >
//             <p className="text-[11px] font-medium tracking-wide">
//               {isLocked
//                 ? t("candidate_pipeline.auto_managed")
//                 : t("candidate_pipeline.drop_here")}
//             </p>
//           </div>
//         ) : (
//           candidates.map((c, cIdx) => (
//             <motion.div
//               key={c.id}
//               initial={{ opacity: 0, y: 16 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{
//                 duration: 0.35,
//                 delay: cIdx * 0.04,
//                 ease: "easeOut",
//               }}
//             >
//               <CandidateCard
//                 candidate={c}
//                 onDragStart={onDragStart}
//                 isDragging={draggingCandidate?.id === c.id}
//                 onClick={() => onCardClick(c)}
//                 allStages={allStages}
//               />
//             </motion.div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// };

// export default function PipelineCandidatesPage({ company, jobs = [] }) {
//   const { t } = useTranslation();
//   const { user } = useUser();
//   const recruiterName =
//     user?.user_metadata?.full_name || user?.email?.split("@")[0] || "";
//   const recruiterEmail = user?.email || "";
//   const companyName = company?.name || "";
//   const [candidates, setCandidates] = useState([]);
//   const [stages, setStages] = useState([]);
//   const [selectedJobId, setSelectedJobId] = useState(null);
//   const [search, setSearch] = useState("");

//   // const [filterFit, setFilterFit] = useState("All");
//   const [filterFit, setFilterFit] = useState("all");

//   const [showFilters, setShowFilters] = useState(false);
//   const [isAdvancing, setIsAdvancing] = useState(false);
//   const [draggingCandidate, setDraggingCandidate] = useState(null);
//   const [dragOverStage, setDragOverStage] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [loadingDrop, setLoadingDrop] = useState(false);
//   const searchRef = useRef(null);
//   const [stageSettings, setStageSettings] = useState({});
//   const [selectedCandidate, setSelectedCandidate] = useState(null);

//   const [showShortlistModal, setShowShortlistModal] = useState(false);
//   const [criteria, setCriteria] = useState("");
//   const [minScore, setMinScore] = useState(70);
//   const [generatingCriteria, setGeneratingCriteria] = useState(false);
//   const [scoreReasoning, setScoreReasoning] = useState("");
//   const [advancingToShortlist, setAdvancingToShortlist] = useState(false);

//   async function handleAutoGenerateCriteria() {
//     if (!selectedJobId) return;
//     setGeneratingCriteria(true);
//     try {
//       const { data, error } = await supabase.functions.invoke(
//         "auto-generate-criteria",
//         { body: { jobId: selectedJobId } },
//       );
//       if (error)
//         throw new Error(error.message || "Failed to generate criteria");
//       if (data.criteria) setCriteria(data.criteria);
//       if (data.suggestedMinScore) setMinScore(data.suggestedMinScore);
//       if (data.scoreReasoning) setScoreReasoning(data.scoreReasoning);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setGeneratingCriteria(false);
//     }
//   }

//   async function handleAdvanceToShortlist() {
//     if (!selectedJobId || !criteria.trim()) return;
//     setAdvancingToShortlist(true);
//     try {
//       const shortlistStage = stages.find((s) => s.stage_type === "shortlist");
//       if (!shortlistStage) throw new Error("No Shortlist stage found");

//       const precedingStage = stages
//         .filter((s) => s.order_index < shortlistStage.order_index)
//         .sort((a, b) => b.order_index - a.order_index)[0];
//       if (!precedingStage) throw new Error("No stage before Shortlist found");

//       const candidateIds = candidates
//         .filter((c) => c.currentStageId === precedingStage.id)
//         .map((c) => c.id);

//       if (candidateIds.length === 0) {
//         alert("No candidates in the stage before Shortlist");
//         setAdvancingToShortlist(false);
//         return;
//       }

//       const { data, error } = await supabase.functions.invoke(
//         "evaluate-shortlist",
//         {
//           body: {
//             applicationIds: candidateIds,
//             evaluationCriteria: criteria.trim(),
//             minScore,
//           },
//         },
//       );

//       if (error) throw new Error(error.message || "Evaluation failed");

//       const results = data?.results || [];
//       const passed = results.filter((r) => r.passed).length;
//       alert(
//         `Evaluation complete: ${passed}/${candidateIds.length} candidates advanced to shortlist`,
//       );

//       setShowShortlistModal(false);
//       setCriteria("");
//       setMinScore(70);
//       window.location.reload();
//     } catch (err) {
//       console.error(err);
//       alert("Failed to advance to shortlist: " + err.message);
//     } finally {
//       setAdvancingToShortlist(false);
//     }
//   }

//   const [searchParams] = useSearchParams();
//   useEffect(() => {
//     if (jobs.length === 0) return;
//     const urlJobId = searchParams.get("jobId");
//     if (urlJobId && jobs.some((j) => j.id === urlJobId)) {
//       setSelectedJobId(urlJobId);
//     } else if (!selectedJobId) {
//       setSelectedJobId(jobs[0].id);
//     }
//   }, [jobs, selectedJobId, searchParams]);

//   useEffect(() => {
//     if (!selectedJobId) return;
//     getJobStages(selectedJobId).then(({ data }) => {
//       setStages(data || []);
//     });
//   }, [selectedJobId]);

//   useEffect(() => {
//     if (!company?.id) return;
//     setLoading(true);
//     getPipelineCandidates(company.id)
//       .then(async ({ data, error }) => {
//         if (error) {
//           console.error(error);
//           return;
//         }

//         const stagesToFix = [];
//         const mapped = (data || []).map((app) => {
//           const allStages = app.application_stages || [];
//           let currentStageId = app.current_stage_id;

//           if (!currentStageId && allStages.length > 0) {
//             const scored = allStages
//               .filter(
//                 (s) =>
//                   s.recruitment_stages &&
//                   s.application_stage_evaluations?.length > 0 &&
//                   s.application_stage_evaluations[0].ai_score != null,
//               )
//               .sort(
//                 (a, b) =>
//                   (a.recruitment_stages.order_index || 0) -
//                   (b.recruitment_stages.order_index || 0),
//               );

//             const lastScored = scored[scored.length - 1];
//             if (lastScored) {
//               currentStageId = lastScored.recruitment_stages.id;
//             } else {
//               const sorted = [...allStages]
//                 .filter((s) => s.recruitment_stages)
//                 .sort(
//                   (a, b) =>
//                     (a.recruitment_stages.order_index || 0) -
//                     (b.recruitment_stages.order_index || 0),
//                 );
//               currentStageId = sorted[0]?.recruitment_stages?.id || null;
//             }

//             if (currentStageId) {
//               stagesToFix.push({ id: app.id, newStageId: currentStageId });
//             }
//           }

//           const currentStage = currentStageId
//             ? allStages.find((s) => s.recruitment_stages?.id === currentStageId)
//             : null;

//           let evaluation = null;
//           let score = 0;

//           if (currentStage) {
//             evaluation =
//               currentStage.application_stage_evaluations?.[0] ?? null;
//             if (evaluation?.ai_score != null) {
//               score = Math.round(Number(evaluation.ai_score));
//             } else if (currentStage.score != null) {
//               score = Math.round(Number(currentStage.score));
//             }
//           }

//           const hasEvaluation =
//             evaluation !== null || currentStage?.score != null;
//           const isRejected =
//             app.is_rejected || evaluation?.recommendation === "reject";

//           return {
//             id: app.id,
//             jobId: app.job_postings?.id,
//             name:
//               app.profiles?.full_name ||
//               t("candidate_pipeline.unknown_candidate"),
//             applied_at: app.applied_at,
//             score,
//             hasEvaluation,
//             is_rejected: isRejected,
//             currentStageId,
//             cvScore: app.cv_score,
//             compositeScore: app.composite_score,
//             profile: app.profiles,
//             answers: app.answers,
//             stagesData: allStages,
//           };
//         });

//         setCandidates(mapped);

//         for (const fix of stagesToFix) {
//           await supabase
//             .from("applications")
//             .update({ current_stage_id: fix.newStageId })
//             .eq("id", fix.id);
//         }
//       })
//       .finally(() => setLoading(false));
//   }, [company?.id, t]);
//   // ------- Realtime: auto-refresh pipeline when applications change -------
//   useEffect(() => {
//     if (!company?.id) return;

//     const channel = supabase
//       .channel(`pipeline-page-${company.id}-${Date.now()}`)
//       .on(
//         "postgres_changes",
//         { event: "INSERT", schema: "public", table: "applications" },
//         () => {
//           // Refetch full data so new applicant appears instantly
//           getPipelineCandidates(company.id).then(async ({ data, error }) => {
//             if (error || !data) return;
//             const mapped = (data || []).map((app) => {
//               const allStages = app.application_stages || [];
//               let currentStageId = app.current_stage_id;
//               const currentStage = currentStageId
//                 ? allStages.find(
//                     (s) => s.recruitment_stages?.id === currentStageId,
//                   )
//                 : null;
//               let score = 0;
//               let evaluation = null;
//               if (currentStage) {
//                 evaluation =
//                   currentStage.application_stage_evaluations?.[0] ?? null;
//                 if (evaluation?.ai_score != null)
//                   score = Math.round(Number(evaluation.ai_score));
//                 else if (currentStage.score != null)
//                   score = Math.round(Number(currentStage.score));
//               }
//               const hasEvaluation =
//                 evaluation !== null || currentStage?.score != null;
//               const isRejected =
//                 app.is_rejected || evaluation?.recommendation === "reject";
//               return {
//                 id: app.id,
//                 jobId: app.job_postings?.id,
//                 name:
//                   app.profiles?.full_name ||
//                   t("candidate_pipeline.unknown_candidate"),
//                 applied_at: app.applied_at,
//                 score,
//                 hasEvaluation,
//                 is_rejected: isRejected,
//                 currentStageId,
//                 cvScore: app.cv_score,
//                 compositeScore: app.composite_score,
//                 profile: app.profiles,
//                 answers: app.answers,
//                 stagesData: allStages,
//               };
//             });
//             setCandidates(mapped);
//           });
//         },
//       )
//       .on(
//         "postgres_changes",
//         { event: "UPDATE", schema: "public", table: "applications" },
//         () => {
//           getPipelineCandidates(company.id).then(({ data }) => {
//             if (!data) return;
//             const mapped = (data || []).map((app) => {
//               const allStages = app.application_stages || [];
//               let currentStageId = app.current_stage_id;
//               const currentStage = currentStageId
//                 ? allStages.find(
//                     (s) => s.recruitment_stages?.id === currentStageId,
//                   )
//                 : null;
//               let score = 0;
//               let evaluation = null;
//               if (currentStage) {
//                 evaluation =
//                   currentStage.application_stage_evaluations?.[0] ?? null;
//                 if (evaluation?.ai_score != null)
//                   score = Math.round(Number(evaluation.ai_score));
//                 else if (currentStage.score != null)
//                   score = Math.round(Number(currentStage.score));
//               }
//               const hasEvaluation =
//                 evaluation !== null || currentStage?.score != null;
//               const isRejected =
//                 app.is_rejected || evaluation?.recommendation === "reject";
//               return {
//                 id: app.id,
//                 jobId: app.job_postings?.id,
//                 name:
//                   app.profiles?.full_name ||
//                   t("candidate_pipeline.unknown_candidate"),
//                 applied_at: app.applied_at,
//                 score,
//                 hasEvaluation,
//                 is_rejected: isRejected,
//                 currentStageId,
//                 cvScore: app.cv_score,
//                 compositeScore: app.composite_score,
//                 profile: app.profiles,
//                 answers: app.answers,
//                 stagesData: allStages,
//               };
//             });
//             setCandidates(mapped);
//           });
//         },
//       )
//       .subscribe();

//     return () => supabase.removeChannel(channel);
//   }, [company?.id, t]);
//   // -------------------------------------------------------------------------

//   // const filtered = candidates.filter((c) => {
//   //   if (selectedJobId && c.jobId !== selectedJobId) return false;
//   //   if (search && !c.name.toLowerCase().includes(search.toLowerCase()))
//   //     return false;
//   //   if (filterFit === "Rejected") return c.is_rejected;
//   //   if (filterFit !== "All") {
//   //     const fitLabel = c.hasEvaluation
//   //       ? getFit(c.score, c.is_rejected, t).label
//   //       : "In Progress";
//   //     if (fitLabel !== filterFit) return false;
//   //   }
//   //   return true;
//   // });

//   const filtered = candidates.filter((c) => {
//     if (selectedJobId && c.jobId !== selectedJobId) return false;
//     if (search && !c.name.toLowerCase().includes(search.toLowerCase()))
//       return false;
//     if (filterFit === "rejected") return c.is_rejected;
//     if (filterFit !== "all") {
//       const fitKey = c.hasEvaluation
//         ? getFit(c.score, c.is_rejected, t).key
//         : "in_progress";
//       if (fitKey !== filterFit) return false;
//     }
//     return true;
//   });

//   const byStage = (stageId) =>
//     filtered.filter((c) => {
//       if (c.currentStageId === stageId) return true;
//       if (c.currentStageId === null && stageId === stages[0]?.id) return true;
//       return false;
//     });

//   const totalInFlight = filtered.length;
//   const handleDragStart = (candidate) => setDraggingCandidate(candidate);

//   const handleDrop = async (targetStageId) => {
//     if (!draggingCandidate || loadingDrop) return;

//     const candidateId = draggingCandidate.id;
//     const candidate = candidates.find((c) => c.id === candidateId);
//     if (!candidate) return;

//     const targetStage = stages.find((s) => s.id === targetStageId);
//     if (!targetStage || targetStage.is_locked) return;

//     const currentStage = stages.find((s) => s.id === candidate.currentStageId);
//     if (!currentStage) return;

//     const sorted = [...stages].sort((a, b) => a.order_index - b.order_index);
//     const currentIndex = sorted.findIndex((s) => s.id === currentStage.id);
//     const targetIndex = sorted.findIndex((s) => s.id === targetStage.id);

//     if (targetIndex !== currentIndex + 1) return;

//     setLoadingDrop(true);
//     const prevState = [...candidates];

//     setCandidates((prev) =>
//       prev.map((c) =>
//         c.id === candidateId ? { ...c, currentStageId: targetStageId } : c,
//       ),
//     );

//     try {
//       const { error } = await moveToStage(candidateId, targetStageId);
//       if (error) throw error;
//     } catch (err) {
//       console.error("DROP FAILED:", err);
//       setCandidates(prevState);
//     } finally {
//       setDraggingCandidate(null);
//       setDragOverStage(null);
//       setLoadingDrop(false);
//     }
//   };

//   const handleStageAutoAdvance = async (stageId) => {
//     if (!selectedJobId) return;
//     try {
//       const minScore =
//         stageSettings[stageId]?.min_score ??
//         stages.find((s) => s.id === stageId)?.min_score ??
//         70;
//       const { advancedCount } = await autoAdvanceToShortlist(
//         selectedJobId,
//         minScore,
//       );
//       if (advancedCount > 0) {
//         alert(
//           t("candidate_pipeline.alerts.advanced_success", {
//             count: advancedCount,
//           }),
//         );
//       } else {
//         alert(t("candidate_pipeline.alerts.no_match"));
//       }
//     } catch (err) {
//       console.error(err);
//       alert(t("candidate_pipeline.alerts.auto_advance_failed"));
//     }
//   };

//   const handleAdvanceAll = async (stageId) => {
//     const currentStage = stages.find((s) => s.id === stageId);
//     if (!currentStage) return;

//     const sorted = [...stages].sort((a, b) => a.order_index - b.order_index);

//     const currentIndex = sorted.findIndex((s) => s.id === stageId);
//     const nextStage = sorted[currentIndex + 1];

//     if (!nextStage) return;

//     const shortlistStage = stages.find((s) => s.stage_type === "shortlist");

//     const isBeforeShortlist =
//       shortlistStage && nextStage.id === shortlistStage.id;

//     if (isBeforeShortlist) {
//       setShowShortlistModal(true);
//       return;
//     }

//     if (nextStage.is_locked) return;

//     const stageCandidates = byStage(stageId);
//     if (stageCandidates.length === 0) return;

//     console.log("ADVANCE ALL TRIGGERED");
//     console.log("stageId:", stageId);
//     console.log("stageCandidates:", stageCandidates);
//     console.log("stages:", stages);

//     const eligible = stageCandidates.filter((c) => {
//       const stageData = c.stagesData?.find(
//         (as) =>
//           as.recruitment_stages?.id === stageId ||
//           as.recruitment_stages?.id === currentStage.id,
//       );

//       const score =
//         stageData?.score ??
//         stageData?.application_stage_evaluations?.[0]?.ai_score ??
//         null;

//       const hasScore = score != null;
//       const minScore = currentStage?.min_score ?? 0;

//       return hasScore && Number(score) >= minScore;
//     });

//     console.log("eligible:", eligible);
//     console.log("minScore:", currentStage?.min_score);
//     if (eligible.length === 0) return;

//     setLoadingDrop(true);

//     const prevState = [...candidates];

//     // optimistic UI update
//     setCandidates((prev) =>
//       prev.map((c) =>
//         eligible.find((ec) => ec.id === c.id)
//           ? { ...c, currentStageId: nextStage.id }
//           : c,
//       ),
//     );

//     try {
//       await Promise.all(eligible.map((c) => moveToStage(c.id, nextStage.id)));
//     } catch (err) {
//       console.error("Advance all failed:", err);
//       setCandidates(prevState);
//     } finally {
//       setLoadingDrop(false);
//     }
//   };
//   return (
//     <div
//       className="flex flex-col h-[calc(100vh-64px)] bg-muted/20 text-foreground overflow-hidden"
//       onDragEnd={() => {
//         if (!loadingDrop) {
//           setDraggingCandidate(null);
//           setDragOverStage(null);
//         }
//       }}
//     >
//       <motion.div
//         initial={{ opacity: 0, y: -10 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.4, ease: "easeOut" }}
//         className="bg-surface border-b border-border px-6 py-4 sticky top-0 z-30"
//       >
//         <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
//           {" "}
//           <div>
//             <h1 className="text-xl font-bold text-foreground font-display">
//               {t("candidate_pipeline.title")}
//             </h1>
//             <div className="flex items-center gap-2 mt-1">
//               <select
//                 value={selectedJobId || ""}
//                 onChange={(e) => setSelectedJobId(e.target.value)}
//                 className="text-xs sm:text-sm font-bold text-primary bg-muted border border-border rounded-lg px-2.5 py-1.5 outline-none cursor-pointer focus:ring-2 focus:ring-primary/20"
//               >
//                 {jobs.length === 0 && (
//                   <option value="">{t("candidate_pipeline.no_jobs")}</option>
//                 )}
//                 {jobs.map((j) => (
//                   <option key={j.id} value={j.id}>
//                     {j.title}
//                   </option>
//                 ))}
//               </select>
//               <span className="text-xs text-muted-foreground">
//                 ·{" "}
//                 <span className="font-bold text-primary font-display">
//                   {totalInFlight}
//                 </span>{" "}
//                 {t("candidate_pipeline.candidates_in_flight")}
//               </span>
//             </div>
//           </div>
//           <div className="flex-1 max-w-sm relative">
//             <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
//             <input
//               ref={searchRef}
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               placeholder={t("candidate_pipeline.search_placeholder")}
//               className="w-full h-10 sm:h-11 md:h-12 rounded-xl pl-9 pr-4 text-sm sm:text-base text-foreground bg-muted border border-border outline-none placeholder:text-muted-foreground/40 focus:ring-2 focus:ring-primary/30 focus:border-transparent transition-all"
//             />
//           </div>
//           <div className="flex gap-2">
//             <button
//               onClick={() => {
//                 setShowShortlistModal(true);
//                 setScoreReasoning("");
//               }}
//               className="flex items-center gap-2 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm md:text-base font-semibold transition bg-primary text-white hover:opacity-95 shadow-xs cursor-pointer"
//             >
//               <Sparkles className="w-3.5 h-3.5" />
//               Advance to Shortlist
//             </button>
//             <button
//               onClick={() => setShowFilters((s) => !s)}
//               className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
//                 showFilters
//                   ? "bg-primary text-primary-foreground border-primary shadow-sm"
//                   : "border-border text-foreground bg-surface hover:bg-muted"
//               }`}
//             >
//               <SlidersHorizontal className="w-3.5 h-3.5" />
//               {t("candidate_pipeline.filters.title")}
//             </button>
//           </div>
//         </div>

//         {showFilters && (
//           <motion.div
//             initial={{ opacity: 0, y: -8 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.3, ease: "easeOut" }}
//             className="mt-4 pt-4 border-t border-border flex items-center gap-3 flex-wrap"
//           >
//             <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide font-display">
//               {t("candidate_pipeline.filters.fit")}
//             </span>
//             {[
//               { key: "all", label: t("candidate_pipeline.filters.all") },
//               { key: "in_progress", label: "In Progress" },
//               {
//                 key: "strong_fit",
//                 label: t("candidate_pipeline.fit.strong_fit"),
//               },
//               { key: "good_fit", label: t("candidate_pipeline.fit.good_fit") },
//               {
//                 key: "needs_review",
//                 label: t("candidate_pipeline.fit.needs_review"),
//               },
//               { key: "low_fit", label: t("candidate_pipeline.fit.low_fit") },
//               { key: "rejected", label: t("candidate_pipeline.fit.rejected") },
//             ].map((f) => (
//               <button
//                 key={f}
//                 onClick={() => setFilterFit(f)}
//                 className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
//                   filterFit === f
//                     ? "bg-primary text-primary-foreground border-primary shadow-sm"
//                     : "bg-surface text-foreground border-border hover:bg-muted"
//                 }`}
//               >
//                 {f.label}
//               </button>
//             ))}
//           </motion.div>
//         )}
//       </motion.div>

//       {loading && (
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ duration: 0.3 }}
//           className="flex items-center justify-center py-32"
//         >
//           <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
//         </motion.div>
//       )}

//       {!loading && candidates.length === 0 && (
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5, ease: "easeOut" }}
//           className="flex flex-col items-center justify-center py-32 text-center"
//         >
//           <div className="w-16 h-16 rounded-full bg-muted border border-border flex items-center justify-center mb-4">
//             <Search className="w-7 h-7 text-muted-foreground/60" />
//           </div>
//           <h2 className="text-foreground text-lg font-bold mb-1 font-display">
//             {t("candidate_pipeline.empty.title")}
//           </h2>
//           <p className="text-muted-foreground text-sm max-w-xs">
//             {t("candidate_pipeline.empty.subtitle")}
//           </p>
//         </motion.div>
//       )}

//       {!loading && candidates.length > 0 && (
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
//           className="px-6 py-6 flex flex-col md:flex-row items-start gap-5 overflow-y-auto md:overflow-x-auto flex-1 h-full scrollbar-thin"
//         >
//           {stages.map((s, idx) => (
//             <motion.div
//               key={s.id}
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{
//                 duration: 0.4,
//                 delay: 0.25 + idx * 0.08,
//                 ease: "easeOut",
//               }}
//             >
//               <PipelineColumn
//                 stage={s}
//                 candidates={byStage(s.id)}
//                 onDragStart={handleDragStart}
//                 dragOverStage={dragOverStage}
//                 onDragOver={setDragOverStage}
//                 onDrop={handleDrop}
//                 draggingCandidate={draggingCandidate}
//                 handleStageAutoAdvance={handleStageAutoAdvance}
//                 handleAdvanceAll={handleAdvanceAll}
//                 loadingDrop={loadingDrop}
//                 allStages={stages}
//                 onCardClick={(c) => setSelectedCandidate(c)}
//               />
//             </motion.div>
//           ))}
//         </motion.div>
//       )}

//       {selectedCandidate && (
//         <CandidateSidebar
//           candidate={selectedCandidate}
//           onClose={() => setSelectedCandidate(null)}
//           allStages={stages}
//           recruiterName={recruiterName}
//           recruiterEmail={recruiterEmail}
//           companyName={companyName}
//           onUpdate={(applicationId, updates) => {
//             setCandidates((prev) =>
//               prev.map((c) =>
//                 c.id === applicationId ? { ...c, ...updates } : c,
//               ),
//             );
//             setSelectedCandidate((prev) =>
//               prev?.id === applicationId ? { ...prev, ...updates } : prev,
//             );
//           }}
//         />
//       )}

//       {showShortlistModal && (
//         <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
//           <div className="bg-surface border border-border rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
//             {/* Header */}
//             <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/40">
//               <div className="flex items-center gap-2">
//                 <Sparkles className="w-5 h-5 text-primary" />
//                 <h3 className="font-bold text-foreground text-lg">
//                   AI Shortlist Advancement
//                 </h3>
//               </div>
//               <button
//                 onClick={() => setShowShortlistModal(false)}
//                 className="text-muted-foreground hover:text-foreground rounded-lg p-1 transition-colors cursor-pointer"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>

//             {/* Body */}
//             <div className="p-6 overflow-y-auto space-y-5 flex-1">
//               {/* Evaluation Criteria Section */}
//               <div>
//                 <div className="flex items-center justify-between mb-2">
//                   <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
//                     Evaluation Criteria
//                   </label>
//                   <button
//                     onClick={handleAutoGenerateCriteria}
//                     disabled={generatingCriteria || !selectedJobId}
//                     className="flex items-center gap-1.5 text-[11px] font-bold text-primary bg-primary/10 border border-primary/20 hover:bg-primary/15 px-2.5 py-1.5 rounded-lg transition-all disabled:opacity-50 cursor-pointer"
//                   >
//                     {generatingCriteria ? (
//                       <Loader2 className="w-3 h-3 animate-spin" />
//                     ) : (
//                       <Sparkles className="w-3 h-3" />
//                     )}
//                     Auto-generate from JD
//                   </button>
//                 </div>

//                 <textarea
//                   value={criteria}
//                   onChange={(e) => setCriteria(e.target.value)}
//                   placeholder="Describe the skills, experience levels, or qualifications required for shortlisting..."
//                   className="w-full h-32 px-3 py-2 text-sm text-foreground bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/40 resize-none"
//                 />
//               </div>

//               {/* Min Score Range Slider */}
//               <div className="space-y-3 pt-2">
//                 <div className="flex justify-between items-center">
//                   <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
//                     Min Score
//                   </label>
//                   <span className="text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-lg">
//                     {minScore}
//                   </span>
//                 </div>

//                 <input
//                   type="range"
//                   min="0"
//                   max="100"
//                   value={minScore}
//                   onChange={(e) => setMinScore(Number(e.target.value))}
//                   className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary border border-border focus:outline-none [&::-webkit-slider-runnable-track]:bg-muted [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
//                 />
//               </div>

//               {scoreReasoning && (
//                 <div className="p-3 bg-primary/5 border border-primary/10 rounded-xl text-xs text-muted-foreground animate-fade-in">
//                   <span className="font-bold text-primary block mb-0.5">
//                     AI Suggestion Note:
//                   </span>
//                   {scoreReasoning}
//                 </div>
//               )}
//             </div>

//             {/* Footer */}
//             <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3 bg-muted/20">
//               <button
//                 onClick={() => setShowShortlistModal(false)}
//                 className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-border rounded-xl transition-all cursor-pointer"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleAdvanceToShortlist}
//                 disabled={!criteria.trim() || advancingToShortlist}
//                 className="px-5 py-2 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-xl shadow-xs transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
//               >
//                 {advancingToShortlist && (
//                   <Loader2 className="w-4 h-4 animate-spin" />
//                 )}
//                 Run Evaluation
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
