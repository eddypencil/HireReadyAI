//src\features\jobs\pages\JobDetailsPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchJobById, fetchSimilarJobs } from "../services/jobs.service";
import { useUser } from "@/features/auth/context/user.context";
import { supabase } from "@/shared/services/supabase";

import { useTranslation } from "react-i18next";
export default function JobDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();
  const [job, setJob] = useState(null);
  const [similarJobs, setSimilarJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);
  const { profile } = useUser();

  useEffect(() => {
    if (!id || !profile?.id) return;

    async function checkApplication() {
      const { data, error } = await supabase
        .from("applications")
        .select("id")
        .eq("job_id", id)
        .eq("candidate_profile_id", profile.id)
        .maybeSingle();

      if (error) {
        console.error(error);
        return;
      }

      setHasApplied(!!data);
    }

    checkApplication();
  }, [id, profile?.id]);

  useEffect(() => {
    async function loadJob() {
      try {
        const data = await fetchJobById(id);
        setJob(data);
        const similar = await fetchSimilarJobs(
          id,
          data.seniority_level,
          data.job_type,
        );
        setSimilarJobs(similar);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadJob();
  }, [id]);

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

        <div className="relative z-10 bg-white border border-slate-200/80 rounded-xl px-8 py-6 shadow-sm flex flex-col items-center gap-3.5">
          <div className="w-9 h-9 rounded-full border-3 border-slate-100 border-t-[#0f294a] animate-spin" />
          <p className="text-slate-600 font-medium text-xs">
            {t("job_details.loading")}
          </p>
        </div>
      </div>
    );
  }

  if (error)
    return (
      <p className="p-8 text-red-500 text-sm font-medium">
        {t("job_details.error")} {error}
      </p>
    );
  if (!job)
    return <p className="p-8 text-slate-500 text-sm font-medium">{t("job_details.not_found")}</p>;

  const company = job.companies;

  return (
    <div className="min-h-screen bg-slate-50/60 py-8 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-5">

        <div className="lg:col-span-2 space-y-4">

          <div className="bg-white rounded-xl border border-slate-200/80 p-5">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-xl font-bold text-slate-900 leading-snug">
                {job.title}
              </h1>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  disabled={hasApplied}
                  onClick={() => {
                    if (hasApplied) return;
                    navigate("apply");
                  }}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-150 ${hasApplied
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                      : "bg-[#0f294a] text-white hover:bg-[#163b69]"
                    }`}
                  style={{
                    boxShadow: hasApplied ? "none" : "0 2px 8px rgba(15,41,74,0.15)",
                  }}
                >
                  {hasApplied
                    ? t("job_details.applied")
                    : t("job_details.apply_now")}
                </button>

                <button className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-[#0f294a] hover:bg-slate-50 transition-colors duration-150">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2">
              {company?.logo_url ? (
                <img
                  src={company.logo_url}
                  alt={company.name}
                  className="w-7 h-7 object-contain rounded-md border border-slate-100 p-0.5 bg-white"
                />
              ) : (
                <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center text-[#0f294a] font-bold text-xs">
                  {company?.name?.[0]}
                </div>
              )}
              <span className="text-slate-700 text-xs font-semibold">
                {company?.name}
              </span>
              {company?.location && (
                <>
                  <span className="text-slate-300 text-[10px]">•</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span className="text-slate-500 text-xs">
                    {company.location}
                  </span>
                </>
              )}
            </div>

            <div className="flex gap-1.5 mt-3.5 flex-wrap">
              {job.job_type && (
                <span className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-slate-50 text-slate-600 border border-slate-200">
                  {job.job_type
                    .replace("_", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </span>
              )}
              {job.seniority_level && (
                <span className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-slate-50 text-slate-600 border border-slate-200 capitalize">
                  {job.seniority_level}
                </span>
              )}
              {job.experience_years && (
                <span className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-slate-50 text-slate-600 border border-slate-200">
                  {job.experience_years}
                </span>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-5">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              {t("job_details.about")}
            </h2>
            <p className="text-slate-600 leading-relaxed text-xs">
              {job.description}
            </p>
          </div>

          {job.requirements?.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200/80 p-5">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                {t("job_details.qualifications")}
              </h2>
              <ul className="space-y-1.5 text-slate-600 text-xs">
                {job.requirements.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-slate-300 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {job.responsibilities?.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200/80 p-5">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                {t("job_details.responsibilities")}
              </h2>
              <ul className="space-y-1.5 text-slate-600 text-xs">
                {job.responsibilities.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-slate-300 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {job.skills?.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200/80 p-5">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                {t("job_details.skills")}
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {job.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-slate-50 text-slate-600 border border-slate-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {similarJobs.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200/80 p-4">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 pb-1 border-b border-slate-50">
                {t("job_details.similar_jobs")}
              </h2>
              <div className="flex flex-col gap-3.5">
                {similarJobs.map((sj) => (
                  <div
                    key={sj.id}
                    onClick={() => navigate(`/jobs/${sj.id}`)}
                    className="flex items-start gap-3 cursor-pointer group"
                  >
                    {sj.companies?.logo_url ? (
                      <img
                        src={sj.companies.logo_url}
                        alt={sj.companies.name}
                        className="w-9 h-9 rounded-lg border border-slate-100 object-contain p-0.5 shrink-0 bg-white"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-[#0f294a] font-bold text-xs shrink-0">
                        {sj.companies?.name?.[0]}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-bold text-slate-800 group-hover:text-[#0f294a] transition-colors duration-150 truncate">
                          {sj.title}
                        </p>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="shrink-0 text-slate-300 hover:text-[#0f294a] transition-colors duration-150"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                          </svg>
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                        {sj.companies?.name}
                        {sj.companies?.location && ` • ${sj.companies.location}`}
                      </p>

                      <div className="flex gap-1.5 mt-1.5 flex-wrap">
                        {sj.job_type && (
                          <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-slate-50 text-slate-500 border border-slate-150">
                            {sj.job_type
                              .replace("_", " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </span>
                        )}
                        {sj.seniority_level && (
                          <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-slate-50 text-slate-500 border border-slate-150 capitalize">
                            {sj.seniority_level}
                          </span>
                        )}
                      </div>

                      <p className="text-[10px] text-slate-300 font-medium mt-1.5">
                        {new Date(sj.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}