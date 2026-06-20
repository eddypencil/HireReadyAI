import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { getFeaturedJobs } from "../../jobs/services/jobs.service";
import { useUser } from "../../auth/context/user.context";

const tagColors = {
  "Full Time": "text-primary dark:text-accent bg-primary/8 dark:bg-accent/10",
  "Part Time": "text-muted-foreground bg-muted",
  "Remote": "text-accent dark:text-muted-foreground bg-accent/8 dark:bg-muted",
  "On-site": "text-muted-foreground bg-muted",
  "Contract": "text-warning bg-warning/10",
};

function AvatarStack({ count }) {
  const colors = ["bg-stage-applied", "bg-stage-interview", "bg-stage-final"];
  return (
    <div className="flex items-center gap-1">
      <div className="flex -space-x-2">
        {colors.map((c, i) => (
          <div
            key={i}
            className={`w-6 h-6 rounded-full border-2 border-card ${c}`}
          />
        ))}
        <div className="w-6 h-6 rounded-full border-2 border-card bg-muted flex items-center justify-center">
          <span className="text-[8px] text-muted-foreground font-bold">+</span>
        </div>
      </div>
      <span className="text-[10px] text-muted-foreground ml-1">
        {count} applicants
      </span>
    </div>
  );
}

export default function TopFeaturedJobs() {
  const { t } = useTranslation();
  const { user } = useUser();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const data = await getFeaturedJobs();
      setJobs(data || []);
    } catch (error) {
      console.error("Error fetching featured jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (jobId) => {
    if (!user) {
      navigate("/auth/sign-in", { state: { from: `/jobs/${jobId}/apply` } });
    } else {
      navigate(`/jobs/${jobId}/apply`);
    }
  };

  return (
    <section className="py-20 px-4 bg-surface-muted dark:bg-surface">
      <style>{`
        .job-card::before {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: 1rem;
            padding: 1.5px;
            background: linear-gradient(
                135deg,
                #6366f1 0%,
                #3b82f6 40%,
                transparent 60%,
                transparent 70%,
                #06b6d4 90%,
                #3b82f6 100%
            );
            -webkit-mask:
                linear-gradient(#fff 0 0) content-box,
                linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            pointer-events: none;
        }
        .job-card {
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .job-card:hover {
            transform: translateY(-6px);
            box-shadow: 0 20px 40px -12px rgba(59, 130, 246, 0.3), 0 10px 20px -8px rgba(6, 182, 212, 0.2);
        }
        
        .job-card.featured-glow::before {
            background: linear-gradient(
                135deg,
                var(--primary, #6366f1) 0%,
                var(--accent, #06b6d4) 100%
            );
            padding: 2px;
        }
      `}</style>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <span className="inline-block text-[10px] font-extrabold tracking-[0.2em] text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/10 uppercase">
            {t("topFeaturedJobs.eyebrow")}
          </span>
          <h2 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            {t("topFeaturedJobs.title")}
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm md:text-base">
            {t("topFeaturedJobs.subtitle")}
          </p>
        </div>

        {/* Cards grid */}
        {loading ? (
          <div className="text-center py-10 text-muted-foreground">Loading featured jobs...</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => {
              const tags = [job.job_type, job.work_location].filter(Boolean);

              return (
                <div
                  key={job.id}
                  className={`job-card group relative bg-card p-5 flex flex-col justify-between gap-4 rounded-2xl overflow-hidden ${job.featured ? "featured-glow ring-1 ring-primary/20" : "ring-1 ring-border/40"}`}
                >
                  {/* Company row */}
                  <div className="flex items-start justify-between z-10 relative">
                    <div className="flex items-center gap-2.5">
                      {job.companies?.logo_url ? (
                        <img
                          src={job.companies.logo_url}
                          alt={job.companies.name}
                          className="w-9 h-9 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-white">
                            {job.companies?.name?.charAt(0) || "J"}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-foreground leading-tight">
                          {job.companies?.name || "Unspecified"}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {job.work_location || "Remote"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Role */}
                  <div className="z-10 relative">
                    <h3 className="font-semibold text-foreground text-base leading-snug">
                      {job.title}
                    </h3>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full ${tagColors[tag] ?? "text-muted-foreground bg-muted"}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Salary + CTA */}
                  <div className="flex items-center justify-between pt-3 border-t border-border/40 z-10 relative">
                    <div>
                      <p className="text-sm font-bold text-foreground">
                        {job.salary_min && job.salary_max
                          ? `$${job.salary_min} - $${job.salary_max}`
                          : "Salary not specified"}
                      </p>
                      <AvatarStack count={job.applicants_count} />
                    </div>
                    <button
                      onClick={() => handleApply(job.id)}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${job.featured
                        ? "bg-primary dark:bg-accent text-white hover:bg-primary-hover dark:hover:bg-primary"
                        : "text-primary dark:text-accent hover:bg-secondary dark:hover:bg-surface-hover"
                        }`}
                    >
                      Apply <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}