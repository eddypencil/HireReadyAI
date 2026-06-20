//src\features\jobs\components\JobCard.jsx
import { useNavigate, Link } from "react-router-dom";
import { Briefcase, MapPin, Clock, TrendingUp, Building2 } from "lucide-react";

export default function JobCard({ job }) {
  const navigate = useNavigate();
  const company = job.companies;

  return (
    <div
      onClick={() => navigate(`/jobs/${job.id}`)}
      className="bg-card rounded-xl border border-border/70 border-l-[3px] border-l-transparent border-t-[3px] border-t-transparent p-4 hover:shadow-[0_0_18px_-4px_color-mix(in_srgb,var(--color-primary)_35%,transparent)] hover:border-l-primary hover:border-t-primary hover:border-primary/20 hover:bg-surface-hover hover:ring-1 hover:ring-primary/15 transition-all duration-200 cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <Link
            to={`/company/${company?.id}`}
            className="shrink-0 hover:opacity-80 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            {company?.logo_url ? (
              <img
                src={company.logo_url}
                alt={company.name}
                className="w-11 h-11 rounded-xl border border-border object-contain p-1 shrink-0"
              />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center font-bold text-base shrink-0 shadow-sm">
                {company?.name?.[0] || "?"}
              </div>
            )}
          </Link>

          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-foreground group-hover:text-primary transition truncate">
              {job.title}
            </h2>

            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              {company?.name && (
                <Link
                  to={`/company/${company.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs text-muted-foreground font-medium flex items-center gap-1 hover:text-primary transition-colors"
                >
                  <Building2 size={11} className="text-muted-foreground/60" />
                  {company.name}
                </Link>
              )}
              {company?.location && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin size={11} className="text-accent/70" />
                  {company.location}
                </span>
              )}
            </div>

            <div className="flex gap-1.5 mt-2 flex-wrap">
              {job.job_type && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] rounded-md bg-primary/10 text-primary border border-primary/20 font-semibold">
                  <Briefcase size={10} />
                  {job.job_type
                    .replace("_", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </span>
              )}
              {job.seniority_level && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] rounded-md bg-accent/10 text-accent border border-accent/20 font-semibold capitalize">
                  <TrendingUp size={10} />
                  {job.seniority_level}
                </span>
              )}
              {job.work_location && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] rounded-md bg-muted text-muted-foreground border border-border font-medium capitalize">
                  <MapPin size={10} />
                  {job.work_location.replace("_", "-")}
                </span>
              )}
              {job.salary_min && job.salary_max && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] rounded-md bg-success/10 text-success border border-success/20 font-semibold">
                  <span className="text-[9px]">$</span>
                  {job.salary_min.toLocaleString()} –{" "}
                  {job.salary_max.toLocaleString()}
                </span>
              )}
            </div>

            {job.responsibilities?.length > 0 && (
              <ul className="mt-2.5 space-y-0.5">
                {job.responsibilities.slice(0, 2).map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-1.5 text-foreground/70 text-xs"
                  >
                    <span className="mt-1.5 size-1 rounded-full bg-primary/50 shrink-0" />
                    <span className="truncate">{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0 justify-start">
          <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">
            <Clock size={10} className="text-muted-foreground/50" />
            {new Date(job.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      </div>
    </div>
  );
}