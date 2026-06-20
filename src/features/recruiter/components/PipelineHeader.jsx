import { motion } from "framer-motion";
import { Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function PipelineHeader({
  selectedJobId,
  setSelectedJobId,
  jobs,
  totalInFlight,
  search,
  setSearch,
  searchRef,
  showFilters,
  setShowFilters,
  filterFit,
  setFilterFit,
  onOpenShortlistModal,
}) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="bg-surface border-b border-border px-6 py-4 sticky top-0 z-30"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {" "}
        <div>
          <h1 className="text-xl font-bold text-foreground font-display">
            {t("candidate_pipeline.title")}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <select
              value={selectedJobId || ""}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="text-xs sm:text-sm font-bold text-primary bg-muted border border-border rounded-lg px-2.5 py-1.5 outline-none cursor-pointer focus:ring-2 focus:ring-primary/20"
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
            className="w-full h-10 sm:h-11 md:h-12 rounded-xl pl-9 pr-4 text-sm sm:text-base text-foreground bg-muted border border-border outline-none placeholder:text-muted-foreground/40 focus:ring-2 focus:ring-primary/30 focus:border-transparent transition-all"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={onOpenShortlistModal}
            className="flex items-center gap-2 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm md:text-base font-semibold transition bg-primary text-white hover:opacity-95 shadow-xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Advance to Shortlist
          </button>
          <button
            onClick={() => setShowFilters((s) => !s)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
              showFilters
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "border-border text-foreground bg-surface hover:bg-muted"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {t("candidate_pipeline.filters.title")}
          </button>
        </div>
      </div>

      {showFilters && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="mt-4 pt-4 border-t border-border flex items-center gap-3 flex-wrap"
        >
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide font-display">
            {t("candidate_pipeline.filters.fit")}
          </span>
          {[
            { key: "all", label: t("candidate_pipeline.filters.all") },
            { key: "in_progress", label: "In Progress" },
            {
              key: "strong_fit",
              label: t("candidate_pipeline.fit.strong_fit"),
            },
            { key: "good_fit", label: t("candidate_pipeline.fit.good_fit") },
            {
              key: "needs_review",
              label: t("candidate_pipeline.fit.needs_review"),
            },
            { key: "low_fit", label: t("candidate_pipeline.fit.low_fit") },
            { key: "rejected", label: t("candidate_pipeline.fit.rejected") },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilterFit(f.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                filterFit === f.key
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-surface text-foreground border-border hover:bg-muted"
              }`}
            >
              {f.label}
            </button>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
