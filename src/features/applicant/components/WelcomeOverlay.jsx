import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Briefcase, ChevronDown, ArrowRight } from "lucide-react";
import { fetchAllJobs } from "@/features/jobs/services/jobs.service";

export default function WelcomeOverlay({ profile, applications, onContinue }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [jobs, setJobs] = useState([]);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    fetchAllJobs()
      .then(setJobs)
      .catch(() => {});
  }, []);

  const appliedJobIds = useMemo(
    () => new Set((applications || []).map((a) => a.job_id).filter(Boolean)),
    [applications],
  );

  const appliedLevels = useMemo(() => {
    const levels = new Set();
    (applications || []).forEach((a) => {
      if (a.job_postings?.seniority_level) levels.add(a.job_postings.seniority_level);
    });
    return levels;
  }, [applications]);

  const appliedTypes = useMemo(() => {
    const types = new Set();
    (applications || []).forEach((a) => {
      if (a.job_postings?.job_type) types.add(a.job_postings.job_type);
    });
    return types;
  }, [applications]);

  const similarJobs = useMemo(() => {
    if (appliedLevels.size === 0 && appliedTypes.size === 0) return [];
    return jobs
      .filter(
        (j) =>
          !appliedJobIds.has(j.id) &&
          (appliedLevels.has(j.seniority_level) || appliedTypes.has(j.job_type)),
      )
      .slice(0, 4);
  }, [jobs, appliedJobIds, appliedLevels, appliedTypes]);

  const initials = profile?.fullName
    ? profile.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setExiting(true);
    setTimeout(() => {
      navigate("/jobs", { state: { search: searchQuery.trim() } });
    }, 250);
  };

  const handleJobClick = (jobId) => {
    setExiting(true);
    setTimeout(() => {
      navigate(`/jobs/${jobId}`);
    }, 250);
  };

  const handleContinue = () => {
    setExiting(true);
    setTimeout(onContinue, 250);
  };

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col bg-gradient-to-br from-[#012a4a] via-[#01497c] to-[#2a6f97] overflow-x-hidden overflow-y-auto"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {/* Decorative circles */}
          <div className="absolute -top-16 -right-16 size-[200px] md:size-[300px] rounded-full bg-white/4 pointer-events-none" />
          <div className="absolute -bottom-12 left-1/3 size-[120px] md:size-[200px] rounded-full bg-white/3 pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center px-4 sm:px-6 py-8 sm:py-10 min-h-screen">
            {/* Spacer pushes content to center-ish when short */}
            <div className="flex-1 hidden sm:block" />

            {/* Top: Greeting */}
            <div className="flex flex-col items-center gap-4 sm:gap-6">
              <div className="size-16 sm:size-20 rounded-full bg-white/15 border-[3px] border-white/30 flex items-center justify-center text-xl sm:text-2xl font-bold text-white font-sans shadow-lg shrink-0">
                {profile?.profile_pic ? (
                  <img
                    src={profile.profile_pic}
                    alt={profile.fullName}
                    className="size-full rounded-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>
              <div className="text-center">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white font-sans m-0 leading-tight">
                  Welcome back, {profile?.fullName?.split(" ")[0] || "Applicant"}
                </h1>
                <p className="text-white/60 text-xs sm:text-sm mt-1.5 sm:mt-2 font-sans">
                  Find your next opportunity or check your application progress
                </p>
              </div>
            </div>

            {/* Center: Search + Similar Jobs */}
            <div className="w-full max-w-xl sm:max-w-2xl flex flex-col items-center gap-5 sm:gap-8 mt-8 sm:mt-10">
              {/* Search */}
              <form onSubmit={handleSearch} className="w-full">
                <div className="flex items-center gap-2 sm:gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl sm:rounded-2xl p-1.5 sm:p-2 pl-3 sm:pl-5 shadow-xl transition-all duration-200 focus-within:border-white/40 focus-within:bg-white/15">
                  <Search size={16} className="text-white/50 shrink-0 ml-1" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for jobs, skills, companies..."
                    className="flex-1 bg-transparent border-none text-white placeholder-white/40 text-xs sm:text-sm font-sans outline-none min-w-0"
                  />
                  <button
                    type="submit"
                    className="bg-white text-[#01497c] rounded-lg sm:rounded-xl px-3.5 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold font-sans cursor-pointer hover:bg-white/90 transition-colors whitespace-nowrap shrink-0"
                  >
                    Search
                  </button>
                </div>
              </form>

              {/* Similar Jobs */}
              {similarJobs.length > 0 && (
                <div className="w-full">
                  <p className="text-white/50 text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-2 sm:mb-3 font-sans">
                    Similar to your applications
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    {similarJobs.map((job) => (
                      <button
                        key={job.id}
                        onClick={() => handleJobClick(job.id)}
                        className="flex items-center gap-2 sm:gap-3 bg-white/8 hover:bg-white/12 border border-white/15 rounded-lg sm:rounded-xl p-2.5 sm:p-3 text-left cursor-pointer transition-all duration-200 group"
                      >
                        <div className="size-8 sm:size-10 rounded-lg bg-white/10 flex items-center justify-center text-white/70 shrink-0">
                          <Briefcase size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-[13px] font-semibold text-white m-0 truncate font-sans">
                            {job.title}
                          </p>
                          <p className="text-[10px] sm:text-[11px] text-white/50 m-0 mt-0.5 truncate font-sans">
                            {job.companies?.name || "Unknown Company"}
                          </p>
                        </div>
                        <ArrowRight size={12} className="text-white/30 group-hover:text-white/60 transition-colors shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom: Continue + scroll hint */}
            <div className="flex flex-col items-center gap-3 sm:gap-4 mt-8 sm:mt-10 mb-4 sm:mb-8">
              <button
                onClick={handleContinue}
                className="bg-white/10 hover:bg-white/18 border border-white/25 rounded-full px-6 sm:px-8 py-2.5 sm:py-3 text-white text-xs sm:text-sm font-semibold font-sans cursor-pointer transition-all duration-200 backdrop-blur-sm"
              >
                Continue to Dashboard
              </button>
              <div className="flex flex-col items-center gap-1 text-white/30">
                <span className="text-[10px] font-sans">Scroll</span>
                <ChevronDown size={14} className="animate-bounce" />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
