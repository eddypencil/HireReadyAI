import React from "react";
import { useShortlistData } from "../hooks/useShortlistData";
import ShortlistReportTable from "../components/ShortlistReportTable";
import SideBySideComparison from "../components/SideBySideComparison";
import { Download, EyeOff } from "lucide-react";

export default function ShortlistsPage({ jobs }) {
  const {
    selectedJobId,
    setSelectedJobId,
    selectedJob,
    shortlistEntries,
    loading,
    selectedCandidateIds,
    handleToggleSelect,
    selectedCandidates,
    handleReorder,
  } = useShortlistData(jobs);

  const formattedDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="p-8 font-sans max-w-7xl mx-auto">
      {/* Header and Job Selector */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h1
              className="text-3xl font-bold text-[#0f172a] tracking-tight"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Shortlist Report
            </h1>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-dark-amethyst-500 focus:border-dark-amethyst-500 block p-2 outline-hidden transition-colors cursor-pointer"
            >
              <option value="" disabled>
                Select a job posting
              </option>
              {jobs?.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>
          </div>
          {selectedJob && (
            <p className="text-sm text-gray-500">
              {selectedJob.title} · {shortlistEntries.length} top candidates ·
              Generated {formattedDate}
            </p>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-2 border-dark-amethyst-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          <ShortlistReportTable
            entries={shortlistEntries}
            selectedIds={selectedCandidateIds}
            onToggleSelect={handleToggleSelect}
          />

          <SideBySideComparison
            selectedCandidates={selectedCandidates}
            onReorder={handleReorder}
          />
        </>
      )}
    </div>
  );
}
