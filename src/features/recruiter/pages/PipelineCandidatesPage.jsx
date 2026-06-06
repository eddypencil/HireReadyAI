import { useState, useEffect, useRef } from "react";
import { Lock, Search, SlidersHorizontal } from "lucide-react";
import {
  getPipelineCandidates,
  getJobStages,
  moveToStage,
  autoAdvanceToShortlist,
  updateStageMinScore,
} from "../services/candidatesPipline.service";
import CandidateSidebar from "../components/CandidateSidebar";

// ─── Helpers ─────────────────────────────────────────────────────────────────
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
  if (s >= 85) return "bg-emerald-100 text-emerald-700";
  if (s >= 70) return "bg-sky-blue-800 text-sky-blue-600";
  if (s >= 55) return "bg-air-force-blue-800 text-air-force-blue-600";
  return "bg-red-100 text-red-600";
};

function getFit(score, isRejected) {
  if (isRejected) {
    return {
      label: "Rejected",
      cls: "bg-red-100 text-red-700 border-red-300",
    };
  }
  if (score >= 85)
    return {
      label: "Strong Fit",
      cls: "bg-emerald-100 text-emerald-700 border-emerald-200",
    };
  if (score >= 70)
    return {
      label: "Good Fit",
      cls: "bg-sky-blue-800 text-sky-blue-600 border-cerulean-800",
    };
  if (score >= 55)
    return {
      label: "Needs Review",
      cls: "bg-air-force-blue-800 text-air-force-blue-600 border-air-force-blue-800",
    };
  return { label: "Low Fit", cls: "bg-red-100 text-red-600 border-red-200" };
}

// ─── Sub-components ───────────────────────────────────────────────────────────
const CandidateCard = ({ candidate, onDragStart, isDragging, onClick }) => {
  const fit = getFit(candidate.score);
  return (
    <div
      draggable
      onDragStart={() => onDragStart(candidate)}
      onClick={onClick}
      className={`bg-white rounded-2xl border border-cerulean-900 p-4 cursor-grab active:cursor-grabbing select-none transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 group ${isDragging ? "opacity-40 scale-95" : ""}`}
      style={{ boxShadow: "0 1px 4px rgba(1,73,124,0.1)" }}
    >
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
              <span className="text-[10px] px-2 py-0.5 rounded bg-red-100 text-red-600 border border-red-200">
                Rejected
              </span>
            )}
          </p>
          <p className="text-xs text-air-force-blue mt-0.5">
            {timeAgo(candidate.applied_at)}
          </p>
        </div>
      </div>

      {/* Fit + score */}
      <div className="flex items-center justify-between mb-3">
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${fit.cls}`}
        >
          {fit.label}
        </span>
        {candidate.score > 0 && (
          <span
            className={`px-2 py-0.5 rounded-lg text-xs font-bold ${scoreColor(candidate.score)}`}
          >
            {candidate.score}
          </span>
        )}
      </div>

      {/* Score bar */}
      {candidate.score > 0 && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-cerulean">Stage score</span>
            <span className="text-xs font-semibold text-rich-cerulean-600">
              {candidate.score}/100
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
                      : "bg-red-500"
              }`}
              style={{ width: `${candidate.score}%` }}
            />
          </div>
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
  stageSettings,
  setStageSettings,
  handleStageAutoAdvance,
  onCardClick,
}) => {
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
      {/* Column header */}
      <div className="flex items-center justify-between px-4 py-3 mb-3">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{
              background: `hsl(${210 - stage.order_index * 10}, 70%, ${55 - stage.order_index * 3}%)`,
            }}
          />
          <span className="text-sm font-bold text-deep-space-blue">
            {stage.name}
          </span>
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-cerulean-900 text-rich-cerulean ml-1">
            {candidates.length}
          </span>
          {isLocked && (
            <Lock
              className="w-3 h-3 text-steel-blue ml-0.5"
              title="Locked stage — cannot be dropped into"
            />
          )}

          {!isLocked && (
            <div className="relative ml-2">
              <button
                onClick={() => setOpenMenu((s) => !s)}
                className="text-cerulean hover:text-rich-cerulean-600"
              >
                ⋯
              </button>

              {openMenu && (
                <div className="absolute right-0 mt-2 w-44 bg-white border border-cerulean-900 rounded-xl shadow-lg p-2 z-50">
                  {/* Min Score */}
                  <div className="p-2">
                    <p className="text-xs mb-1 text-cerulean">
                      Min Score
                    </p>

                    <input
                      type="number"
                      value={localMinScore}
                      onChange={(e) => setLocalMinScore(Number(e.target.value))}
                    />

                    <button
                      onClick={async () => {
                        await updateStageMinScore(stage.id, localMinScore);
                      }}
                      className="text-xs mt-2 bg-rich-cerulean text-white px-2 py-1 rounded"
                    >
                      Save
                    </button>
                  </div>

                  {/* Auto Advance */}
                  <button
                    className="w-full text-left text-xs p-2 hover:bg-sky-blue-900 rounded"
                    onClick={() => handleStageAutoAdvance(stage.id)}
                  >
                    Auto Advance
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Cards */}
      <div
        className={`flex-1 overflow-y-auto space-y-3 px-1 pb-4 pr-2 transition-all duration-200 ${
          isOver && !isLocked ? "bg-sky-blue-900/60 rounded-xl" : ""
        }`}
        style={{ maxHeight: "calc(100vh - 230px)", minHeight: 120 }}
      >
        {candidates.length === 0 ? (
          <div
            className={`rounded-xl border-2 border-dashed h-24 flex items-center justify-center transition-all ${
              isLocked
                ? "border-gray-200 bg-gray-50"
                : isOver
                  ? "border-air-force-blue bg-sky-blue-900"
                  : "border-cerulean-900"
            }`}
          >
            <p className="text-xs text-steel-blue">
              {isLocked ? "Auto-managed" : "Drop here"}
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
            />
          ))
        )}
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PipelineCandidatesPage({ company, jobs = [] }) {
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

  // Initialize selected job
  useEffect(() => {
    if (jobs.length > 0 && !selectedJobId) {
      setSelectedJobId(jobs[0].id);
    }
  }, [jobs, selectedJobId]);

  // Load stages when job changes
  useEffect(() => {
    if (!selectedJobId) return;
    getJobStages(selectedJobId).then(({ data }) => {
      setStages(data || []);
    });
  }, [selectedJobId]);

  // Load candidates when job or company changes
  useEffect(() => {
    if (!company?.id) return;
    setLoading(true);
    getPipelineCandidates(company.id)
      .then(({ data, error }) => {
        if (error) {
          console.error(error);
          return;
        }

        const mapped = (data || []).map((app) => {
          const allStages = app.application_stages || [];

          // Use current_stage_id from the applications table
          // Fallback: derive from application_stages (for existing records)
          let currentStageId = app.current_stage_id || null;
          if (!currentStageId && allStages.length > 0) {
            const inProgress = allStages.find(
              (s) => s.status === "in_progress",
            );
            const fallback = inProgress || allStages[0];
            currentStageId = fallback?.recruitment_stages?.id || null;
          }

          // Find the matching stage in application_stages to get evaluations
          const currentStage = currentStageId
            ? allStages.find(
                (s) => s.recruitment_stages?.id === currentStageId,
              )
            : null;

          let evaluation = null;
          let score = 0;

          if (
            currentStage &&
            currentStage.application_stage_evaluations?.length
          ) {
            evaluation = currentStage.application_stage_evaluations[0];
            if (
              evaluation &&
              evaluation.ai_score !== null &&
              evaluation.ai_score !== undefined
            ) {
              score = Math.round(Number(evaluation.ai_score));
            }
          }

          // Fallback to cv_score if evaluation not found
          if (score === 0 && app.cv_score) {
            score = Math.round(Number(app.cv_score));
          }

          const isRejected =
            app.is_rejected || evaluation?.recommendation === "reject";

          return {
            id: app.id,
            jobId: app.job_postings?.id,
            name: app.profiles?.full_name || "Unknown Candidate",
            applied_at: app.applied_at,
            score,
            is_rejected: isRejected,
            currentStageId,
            cvScore: app.cv_score,
            compositeScore: app.composite_score,
            profile: app.profiles,
            stagesData: allStages,
          };
        });

        setCandidates(mapped);
      })
      .finally(() => setLoading(false));
  }, [company?.id]);

  const filtered = candidates.filter((c) => {
    if (selectedJobId && c.jobId !== selectedJobId) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()))
      return false;

    if (filterFit === "Rejected") return c.is_rejected;
    if (filterFit !== "All" && getFit(c.score).label !== filterFit)
      return false;

    return true;
  });

  const byStage = (stageId) =>
    filtered.filter((c) => {
      if (c.currentStageId === stageId) return true;
      if (c.currentStageId === null && stageId === stages[0]?.id) return true;
      return false;
    });
  const totalInFlight = filtered.length;

  // Drag & drop
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

    // optimistic update
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

      // rollback
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
        alert(`Advanced ${advancedCount} candidate(s) successfully`);
      } else {
        alert("No candidates matched the criteria");
      }
    } catch (err) {
      console.error(err);
      alert("Auto advance failed");
    }
  };
  const handleAutoAdvance = async () => {
    if (!selectedJobId) return;
    setIsAdvancing(true);
    try {
      const { advancedCount } = await autoAdvanceToShortlist(selectedJobId, 70);
      if (advancedCount > 0) {
        alert(
          `Successfully advanced ${advancedCount} candidate(s) to Shortlist!`,
        );
        loadCandidates(selectedJobId);
      } else {
        alert("No candidates met the requirements to be auto-advanced.");
      }
    } catch (err) {
      console.error("Auto advance error:", err);
      alert("Failed to auto-advance candidates.");
    } finally {
      setIsAdvancing(false);
    }
  };
  console.log(stages);
  return (
    <div
      className="flex flex-col h-[calc(100vh-64px)] bg-sky-blue-900 overflow-hidden"
      onDragEnd={() => {
        if (!loadingDrop) {
          setDraggingCandidate(null);
          setDragOverStage(null);
        }
      }}
    >
      {/* ── Top bar ── */}
      <div
        className="bg-white border-b border-cerulean-900 px-6 py-4 sticky top-0 z-30"
        style={{ boxShadow: "0 2px 16px rgba(1,73,124,0.08)" }}
      >
        <div className="flex items-center justify-between gap-4">
          {/* Title / Job selector */}
          <div>
            <h1 className="text-xl font-bold text-deep-space-blue">
              Candidate Pipeline
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <select
                value={selectedJobId || ""}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="text-xs font-semibold text-rich-cerulean bg-sky-blue-900 border border-cerulean-900 rounded-lg px-2 py-1 outline-none cursor-pointer"
              >
                {jobs.length === 0 && <option value="">No jobs</option>}
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title}
                  </option>
                ))}
              </select>
              <span className="text-xs text-cerulean">
                ·{" "}
                <span className="font-semibold text-rich-cerulean">
                  {totalInFlight}
                </span>{" "}
                candidates in flight
              </span>
            </div>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-sm relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-steel-blue" />
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search candidates…"
              className="w-full h-10 rounded-xl pl-9 pr-4 text-sm text-deep-space-blue bg-sky-blue-900 border border-cerulean-900 outline-none placeholder:text-steel-blue"
            />
          </div>

          {/* Header Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters((s) => !s)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition ${
                showFilters
                  ? "bg-rich-cerulean text-white border-rich-cerulean"
                  : "border-cerulean-800 text-rich-cerulean bg-white hover:bg-sky-blue-900"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters
            </button>
          </div>
        </div>

        {/* Filter bar */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-cerulean-900 flex items-center gap-3 flex-wrap">
            <span className="text-xs font-semibold text-cerulean uppercase tracking-wide">
              Fit:
            </span>

            {[
              "All",
              "Strong Fit",
              "Good Fit",
              "Needs Review",
              "Low Fit",
              "Rejected",
            ].map((f) => (
              <button
                key={f}
                onClick={() => setFilterFit(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                  filterFit === f
                    ? "bg-rich-cerulean text-white border-rich-cerulean"
                    : "bg-white text-rich-cerulean border-cerulean-800 hover:bg-sky-blue-900"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="flex items-center justify-center py-32">
          <div className="w-8 h-8 border-2 border-cerulean border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && candidates.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-16 h-16 rounded-full bg-sky-blue-900 border border-cerulean-900 flex items-center justify-center mb-4">
            <Search className="w-7 h-7 text-steel-blue" />
          </div>
          <h2 className="text-deep-space-blue text-lg font-bold mb-1">
            No candidates yet
          </h2>
          <p className="text-cerulean text-sm">
            Candidates appear here once applications start coming in.
          </p>
        </div>
      )}

      {!loading && candidates.length > 0 && (
        <>
          {/* Stage summary pills */}
          <div className="px-6 py-4 flex items-center gap-3 overflow-x-auto">
            {stages.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-cerulean-900 shrink-0"
                style={{ boxShadow: "0 1px 4px rgba(1,73,124,0.07)" }}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{
                    background: `hsl(${210 - s.order_index * 10}, 70%, ${55 - s.order_index * 3}%)`,
                  }}
                />
                <span className="text-xs font-semibold text-yale-blue">
                  {s.name}
                </span>
                {s.is_locked && (
                  <Lock className="w-2.5 h-2.5 text-steel-blue" />
                )}
                <span className="px-1.5 py-0.5 rounded-full text-xs font-bold bg-sky-blue-900 text-rich-cerulean">
                  {byStage(s.id).length}
                </span>
              </div>
            ))}
          </div>

          {/* ── Kanban board ── */}
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
        />
      )}
    </div>
  );
}
