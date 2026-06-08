//src\features\jobs\components\JobCard.jsx
import { useNavigate } from "react-router-dom";
export default function JobCard({ job }) {
  const navigate = useNavigate();
  const company = job.companies;

  return (
    <div
      onClick={() => navigate(`/jobs/${job.id}`)}
      className="bg-background rounded-xl border border-border p-4 hover:shadow-sm hover:border-muted-foreground/30 transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-3">

        <div className="flex items-start gap-3 flex-1 min-w-0">

          {company?.logo_url ? (
            <img
              src={company.logo_url}
              alt={company.name}
              className="w-10 h-10 rounded-lg border border-border object-contain p-1 shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-muted text-muted-foreground flex items-center justify-center font-bold text-base shrink-0">
              {company?.name?.[0]}
            </div>
          )}


          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-foreground group-hover:text-primary transition truncate">
              {job.title}
            </h2>

            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              {company?.name && (
                <span className="text-xs text-muted-foreground font-medium">
                  {company.name}
                </span>
              )}
              {company?.location && (
                <>
                  <span className="text-muted-foreground/40 text-xs">•</span>
                  <span className="text-xs text-muted-foreground">
                    {company.location}
                  </span>
                </>
              )}
            </div>

            <div className="flex gap-1.5 mt-2 flex-wrap">
              {job.job_type && (
                <span className="px-2 py-0.5 text-[11px] rounded bg-secondary text-secondary-foreground border border-border font-medium">
                  {job.job_type
                    .replace("_", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </span>
              )}
              {job.seniority_level && (
                <span className="px-2 py-0.5 text-[11px] rounded bg-secondary text-secondary-foreground border border-border font-medium capitalize">
                  {job.seniority_level}
                </span>
              )}
              {job.work_location && (
                <span className="px-2 py-0.5 text-[11px] rounded bg-secondary text-secondary-foreground border border-border font-medium capitalize">
                  {job.work_location.replace("_", "-")}
                </span>
              )}
              {job.salary_min && job.salary_max && (
                <span className="px-2 py-0.5 text-[11px] rounded bg-secondary text-secondary-foreground border border-border font-medium">
                  {job.salary_min.toLocaleString()} –{" "}
                  {job.salary_max.toLocaleString()} EGP
                </span>
              )}
            </div>


            {job.responsibilities?.length > 0 && (
              <ul className="mt-2.5 space-y-0.5">
                {job.responsibilities.slice(0, 2).map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-1.5 text-foreground/80 text-xs"
                  >
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-muted-foreground shrink-0" />
                    <span className="truncate">{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <button
            onClick={(e) => e.stopPropagation()}
            className="text-muted-foreground/60 hover:text-foreground transition"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round" 
              />
            </svg>
          </button>
          <span className="text-[11px] text-muted-foreground">
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
