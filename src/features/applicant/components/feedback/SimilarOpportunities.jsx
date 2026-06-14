import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { fetchSimilarJobs } from "@/features/jobs/services/jobs.service";
import { Briefcase, MapPin, Building2 } from "lucide-react";
import { useTranslation } from "react-i18next";
export default function SimilarOpportunities({
  jobId,
  seniorityLevel,
  jobType,
}) {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  useEffect(() => {
    if (!jobId) return;
    setLoading(true);
    fetchSimilarJobs(jobId, seniorityLevel || "", jobType || "")
      .then(setJobs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [jobId, seniorityLevel, jobType]);

  if (loading || jobs.length === 0) return null;

  return (
    <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Briefcase className="w-4 h-4 text-accent" />
        <h2 className="text-sm font-bold text-foreground">
          {" "}
          {t("similarJobs.title")}
        </h2>
      </div>
      <div className="space-y-2.5">
        {jobs.slice(0, 3).map((job) => {
          const company = job.companies;
          return (
            <div
              key={job.id}
              onClick={() => navigate(`/jobs/${job.id}`)}
              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-surface-hover transition-colors cursor-pointer group"
            >
              <Link
                to={`/company/${company?.id}`}
                className="shrink-0 hover:opacity-80 transition-opacity"
              >
                {company?.logo_url ? (
                  <img
                    src={company.logo_url}
                    alt={company.name}
                    className="w-9 h-9 rounded-lg border border-border object-contain p-0.5 shrink-0 bg-card"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {company?.name?.[0] || "?"}
                  </div>
                )}
              </Link>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-foreground group-hover:text-accent transition-colors truncate">
                  {job.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                  {company?.name && (
                    <Link
                      to={`/company/${company.id}`}
                      className="flex items-center gap-1 hover:text-primary transition-colors"
                    >
                      <Building2
                        size={10}
                        className="text-muted-foreground/60"
                      />
                      {company.name}
                    </Link>
                  )}
                  {company?.location && (
                    <span className="flex items-center gap-1">
                      <MapPin size={10} className="text-accent/70" />
                      {company.location}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
