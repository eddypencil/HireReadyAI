//src\features\jobs\pages\JobsPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../auth/context/user.context";
import JobSearch from "../components/JobSearch";
import JobFilters from "../components/JobFilters";
import JobCard from "../components/JobCard";
import { useJobs } from "../hooks/useJobs";
import { useTranslation } from "react-i18next";

export default function JobsPage() {
  const { t } = useTranslation();
  const { signOutUser } = useUser();
  const navigate = useNavigate();
  const { jobs, loading, error } = useJobs();
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("");
  const [jobType, setJobType] = useState("");
  const [workLocation, setWorkLocation] = useState("");
  const [datePosted, setDatePosted] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");

  async function handleLogout() {
    await signOutUser();
    navigate("/login");
  }

  function clearFilters() {
    setLevel("");
    setJobType("");
    setWorkLocation("");
    setDatePosted("");
    setSalaryMin("");
    setSalaryMax("");
    setSearch("");
  }

  const filteredJobs = jobs.filter((job) => {
    const matchSearch = job.title.toLowerCase().includes(search.toLowerCase());

    const matchLevel = level ? job.seniority_level === level : true;
    const matchType = jobType ? job.job_type === jobType : true;
    const matchLocation = workLocation
      ? job.work_location === workLocation
      : true;

    const matchDate = (() => {
      if (!datePosted) return true;
      const posted = new Date(job.created_at);
      const now = new Date();
      const diff = (now - posted) / (1000 * 60 * 60 * 24);
      if (datePosted === "24h") return diff <= 1;
      if (datePosted === "week") return diff <= 7;
      if (datePosted === "month") return diff <= 30;
      return true;
    })();

    const matchSalary = (() => {
      if (!salaryMin && !salaryMax) return true;
      if (!job.salary_min && !job.salary_max) return false;
      const min = Number(salaryMin) || 0;
      const max = Number(salaryMax) || Infinity;
      return job.salary_min >= min && job.salary_max <= max;
    })();

    return (
      matchSearch &&
      matchLevel &&
      matchType &&
      matchLocation &&
      matchDate &&
      matchSalary
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              radial-gradient(circle at 30% 30%, rgba(15,41,74,0.04), transparent 60%),
              radial-gradient(circle at 70% 70%, rgba(15,41,74,0.03), transparent 55%)
            `,
          }}
        />

        <div className="relative z-10 bg-white border border-slate-200/85 rounded-xl px-10 py-8 shadow-sm flex flex-col items-center gap-4">
          <div className="w-9 h-9 rounded-full border-3 border-slate-100 border-t-[#0f294a] animate-spin" />

          <p className="text-slate-600 font-medium text-xs">
            {t("jobs_page.loading")}
          </p>
        </div>
      </div>
    );
  }

  if (error)
    return (
      <p className="p-8 text-red-500 text-sm font-medium">
        {" "}
        {t("jobs_page.error")} {error}
      </p>
    );

  return (
    <div className="min-h-screen bg-slate-50/60">
      <div
        className="relative overflow-hidden px-8 py-16"
        style={{
          background:
            "linear-gradient(135deg, #051427 0%, #0a1e36 40%, #0f294a 70%, #1e3e62 100%)",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              radial-gradient(ellipse at 20% 50%, rgba(30,62,98,0.3) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 20%, rgba(15,41,74,0.4) 0%, transparent 45%)
            `,
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto">
          <p className="text-slate-400 text-xs font-semibold tracking-widest mb-2.5 uppercase">
            HireReadyAI - {t("jobs_page.board")}
          </p>
          <h1
            className="text-white font-extrabold leading-tight mb-3"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "clamp(2rem, 4vw, 3.25rem)",
            }}
          >
            {t("jobs_page.title")}
          </h1>
          <p className="text-slate-300/80 text-sm max-w-lg leading-relaxed">
            Browse our latest job openings and apply to the best opportunities today.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-6 relative z-10">
        <JobSearch search={search} setSearch={setSearch} />
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <p className="text-slate-500 text-xs mb-6 font-medium">
          <span className="font-bold text-slate-800">
            {filteredJobs.length}
          </span>{" "}
          {filteredJobs.length === 1
            ? t("jobs_page.job_found")
            : t("jobs_page.jobs_found")}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <JobFilters
              level={level}
              setLevel={setLevel}
              jobType={jobType}
              setJobType={setJobType}
              workLocation={workLocation}
              setWorkLocation={setWorkLocation}
              datePosted={datePosted}
              setDatePosted={setDatePosted}
              salaryMin={salaryMin}
              setSalaryMin={setSalaryMin}
              salaryMax={salaryMax}
              setSalaryMax={setSalaryMax}
              onClear={clearFilters}
            />
          </div>

          <div className="lg:col-span-3 space-y-4">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => <JobCard key={job.id} job={job} />)
            ) : (
              <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center">
                <p className="text-slate-400 text-xs">
                  {t("jobs_page.no_results")}
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-3.5 text-xs text-[#0f294a] font-semibold hover:underline cursor-pointer"
                >
                  {t("jobs_page.clear_filters")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}