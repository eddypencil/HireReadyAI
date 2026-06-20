// src\features\shortlist\pages\ShortlistsPage.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { useShortlistData } from "../hooks/useShortlistData";
import { useUser } from "@/features/auth/context/user.context";
import ShortlistInsightsBar from "../components/ShortlistInsightsBar";
import ShortlistCandidateCard from "../components/ShortlistCandidateCard";
import ShortlistDetailPanel from "../components/ShortlistDetailPanel";
import { useTranslation } from "react-i18next";
const SORT_OPTIONS = (t) => [
  { key: "consensus", label: t("shortlists.sort.consensus") },
  { key: "ai_score", label: t("shortlists.sort.ai_score") },
  { key: "name", label: t("shortlists.sort.name") },
];

export default function ShortlistsPage({ jobs, company }) {
  const { t } = useTranslation();
  const {
    selectedJobId,
    setSelectedJobId,
    selectedJob,
    sortedEntries,
    loading,
    insightsSummary,
    selectedCandidateId,
    setSelectedCandidateId,
    selectedEntry,
    myVote,
    sortMode,
    setSortMode,
    notes,
    notesLoading,
    castVote,
    rejectApplication,
    advanceToOffer,
    postNote,
  } = useShortlistData(jobs);
  const { user, profile } = useUser();

  const SORT_OPTIONS_LIST = SORT_OPTIONS(t);
  const [search, setSearch] = useState("");
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const handleSelectCandidate = (applicationId) => {
    setSelectedCandidateId(applicationId);
    setIsPanelOpen(true);
  };

  const filteredEntries = sortedEntries.filter((entry) => {
    const name = entry.applications.profiles?.full_name?.toLowerCase() || "";
    return name.includes(search.toLowerCase());
  });

  return (
    <div className="flex flex-col h-full bg-secondary/30 overflow-hidden">
      {/* ── Page Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-background border-b border-border px-6 py-4 shrink-0"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-foreground font-display">
              {t("shortlists.title")}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t("shortlists.subtitle")}
            </p>
          </div>
          {/* Search (right on large screens) */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder={t("shortlists.search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-background text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Controls row */}
        <div className="flex flex-wrap items-center gap-3 mt-4">
          {/* Job dropdown */}
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
          >
            <option value="" disabled>
              {t("shortlists.select_job")}
            </option>
            {jobs?.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>

          {/* Sort chips */}
          <div className="flex items-center gap-1 ml-auto">
            <span className="text-xs text-muted-foreground mr-1">
              {t("shortlists.sort_label")}
            </span>
            {SORT_OPTIONS_LIST.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSortMode(key)}
                className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                  sortMode === key
                    ? "bg-primary text-white border-primary"
                    : "bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-primary"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Insights Bar ── */}
      <ShortlistInsightsBar
        insightsSummary={insightsSummary}
        selectedJobTitle={selectedJob?.title}
      />

      {/* ── Main content: list + panel ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Candidate List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
              className="flex items-center justify-center h-48"
            >
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </motion.div>
          ) : filteredEntries.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center h-48 text-muted-foreground text-sm gap-2"
            >
              <Sparkles className="w-8 h-8 opacity-40 text-primary" />
              <p>{t("shortlists.empty")}</p>
            </motion.div>
          ) : (
            <div>
              {filteredEntries.map((entry, idx) => (
                <ShortlistCandidateCard
                  key={entry.id}
                  entry={entry}
                  index={idx}
                  isSelected={entry.applications.id === selectedCandidateId}
                  onClick={() => handleSelectCandidate(entry.applications.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Detail Panel — drawer from right */}
        {selectedEntry && isPanelOpen && (
          <ShortlistDetailPanel
            entry={selectedEntry}
            myVote={myVote}
            notes={notes}
            notesLoading={notesLoading}
            onClose={() => setIsPanelOpen(false)}
            onCastVote={castVote}
            onReject={rejectApplication}
            onAdvanceToOffer={advanceToOffer}
            onPostNote={postNote}
            isOverlay={true}
            recruiterName={profile?.fullName}
            recruiterEmail={user?.email}
            companyName={company?.name}
          />
        )}
      </div>
    </div>
  );
}
