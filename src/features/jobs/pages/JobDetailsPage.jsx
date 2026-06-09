//src\features\jobs\pages\JobDetailsPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchJobById, fetchSimilarJobs } from "../services/jobs.service";
import { useUser } from "@/features/auth/context/user.context";
import { supabase } from "@/shared/services/supabase";
import {
  Bookmark,
  MapPin,
  FileText,
  Award,
  ListChecks,
  Code2,
  Briefcase,
  Building2,
  TrendingUp,
  Clock,
  Check,
  ArrowRight,
  Calendar,
  Zap,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import LoadingSpinner from "@/shared/ui/LoadingSpinner";
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
    return <LoadingSpinner message={t("job_details.loading")} />;
  }

  if (error)
    return (
      <p className="p-8 text-destructive text-sm font-medium">
        {t("job_details.error")} {error}
      </p>
    );
  if (!job)
    return (
      <p className="p-8 text-muted-foreground text-sm font-medium">
        {t("job_details.not_found")}
      </p>
    );

  const company = job.companies;

  return (
    <div className="min-h-screen bg-surface-muted py-8 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-xl font-bold text-foreground leading-snug">
                {job.title}
              </h1>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  disabled={hasApplied}
                  onClick={() => {
                    if (hasApplied) return;
                    navigate("apply");
                  }}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-150 ${
                    hasApplied
                      ? "bg-muted text-muted-foreground cursor-not-allowed border border-border"
                      : "bg-primary text-white hover:bg-primary-hover shadow-[0_2px_8px_rgba(15,41,74,0.15)]"
                  }`}
                >
                  {hasApplied
                    ? t("job_details.applied")
                    : t("job_details.apply_now")}
                </button>

                <button className="size-8 rounded-lg border border-border bg-card flex items-center justify-center text-muted-foreground/60 hover:text-primary hover:bg-surface-hover transition-colors duration-150">
                  <Bookmark size={15} />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {company?.logo_url ? (
                <img
                  src={company.logo_url}
                  alt={company.name}
                  className="size-7 object-contain rounded-md border border-border p-0.5 bg-card"
                />
              ) : (
                <div className="size-7 rounded-md bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  {company?.name?.[0]}
                </div>
              )}
              <span className="text-foreground/80 text-xs font-semibold flex items-center gap-1">
                {company?.name}
              </span>
              {company?.location && (
                <>
                  <span className="text-muted-foreground/30 text-[10px]">
                    •
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin size={12} className="text-accent/70" />
                    {company.location}
                  </span>
                </>
              )}
            </div>

            <div className="flex gap-1.5 mt-3.5 flex-wrap">
              {job.job_type && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-md bg-primary/10 text-primary border border-primary/20">
                  <Briefcase size={10} />
                  {job.job_type
                    .replace("_", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </span>
              )}
              {job.seniority_level && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-md bg-accent/10 text-accent border border-accent/20 capitalize">
                  <TrendingUp size={10} />
                  {job.seniority_level}
                </span>
              )}
              {job.experience_years && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-md bg-surface-muted text-muted-foreground border border-border">
                  <Clock size={10} className="text-muted-foreground/60" />
                  {job.experience_years}
                </span>
              )}
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 mb-2.5">
              <FileText size={14} className="text-primary" />
              <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">
                {t("job_details.about")}
              </h2>
            </div>
            <p className="text-muted-foreground leading-relaxed text-xs">
              {job.description}
            </p>
          </div>

          {job.requirements?.length > 0 && (
            <div className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center gap-2 mb-2.5">
                <Award size={14} className="text-accent" />
                <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  {t("job_details.qualifications")}
                </h2>
              </div>
              <ul className="space-y-1.5 text-muted-foreground text-xs">
                {job.requirements.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check size={12} className="mt-0.5 shrink-0 text-success" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {job.responsibilities?.length > 0 && (
            <div className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center gap-2 mb-2.5">
                <ListChecks size={14} className="text-primary" />
                <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  {t("job_details.responsibilities")}
                </h2>
              </div>
              <ul className="space-y-1.5 text-muted-foreground text-xs">
                {job.responsibilities.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <ArrowRight
                      size={12}
                      className="mt-0.5 shrink-0 text-accent"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {job.skills?.length > 0 && (
            <div className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center gap-2 mb-2.5">
                <Code2 size={14} className="text-accent" />
                <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  {t("job_details.skills")}
                </h2>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {job.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-surface-muted text-muted-foreground border border-border"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4 sticky top-4 self-start">
          {similarJobs.length > 0 && (
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 mb-3 pb-1 border-b border-surface-muted">
                <Briefcase size={14} className="text-primary" />
                <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  {t("job_details.similar_jobs")}
                </h2>
              </div>
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
                        className="size-9 rounded-lg border border-border object-contain p-0.5 shrink-0 bg-card"
                      />
                    ) : (
                      <div className="size-9 rounded-lg bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                        {sj.companies?.name?.[0]}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors duration-150 truncate">
                          {sj.title}
                        </p>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="shrink-0 text-muted-foreground/40 hover:text-primary transition-colors duration-150"
                        >
                          <Bookmark size={13} />
                        </button>
                      </div>

                      <div className="flex items-center gap-1 mt-0.5 flex-wrap text-[11px] text-muted-foreground font-medium">
                        <span className="flex items-center gap-1">
                          <Building2
                            size={11}
                            className="text-muted-foreground/60"
                          />
                          {sj.companies?.name}
                        </span>
                        {sj.companies?.location && (
                          <>
                            <span className="text-muted-foreground/30">•</span>
                            <span className="flex items-center gap-1">
                              <MapPin size={11} className="text-accent/70" />
                              {sj.companies.location}
                            </span>
                          </>
                        )}
                      </div>

                      <div className="flex gap-1.5 mt-1.5 flex-wrap">
                        {sj.job_type && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold rounded bg-primary/10 text-primary border border-primary/20">
                            <Briefcase size={9} />
                            {sj.job_type
                              .replace("_", " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </span>
                        )}
                        {sj.seniority_level && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold rounded bg-accent/10 text-accent border border-accent/20 capitalize">
                            <TrendingUp size={9} />
                            {sj.seniority_level}
                          </span>
                        )}
                      </div>

                      <p className="text-[10px] text-muted-foreground/60 font-medium mt-1.5 flex items-center gap-1">
                        <Calendar
                          size={10}
                          className="text-muted-foreground/50"
                        />
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
