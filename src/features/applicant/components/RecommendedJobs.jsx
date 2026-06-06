import { useEffect, useState } from "react";
import { supabase } from "@/shared/services/supabase";
import { useNavigate } from "react-router-dom";

function formatLabel(str) {
  if (!str) return "";

  return str
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function RecommendedJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchJobs() {
      setLoading(true);

      const { data, error } = await supabase
        .from("job_postings")
        .select(
          `
          id,
          title,
          seniority_level,
          work_location,
          created_at,
          companies (
            name
          )
        `,
        )
        .order("created_at", { ascending: false })
        .limit(3);

      if (!error) setJobs(data || []);
      setLoading(false);
    }

    fetchJobs();
  }, []);

  if (loading) {
    return (
      <div className="bg-background rounded-2xl border border-border p-7 shadow-xs">
        <p className="text-muted-foreground text-sm animate-pulse">Loading jobs...</p>
      </div>
    );
  }

  return (
    <div className="bg-background rounded-2xl border border-border p-7 space-y-5 shadow-xs">
      <h2 className="text-base font-bold text-sidebar">
        Recommended for you
      </h2>

      <div className="space-y-4">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="flex justify-between items-center border-b border-border/60 pb-3 last:border-0 last:pb-0"
          >
            <div>
              <p className="text-sm font-semibold text-sidebar">
                {job.title}
              </p>

              <p className="text-xs text-muted-foreground font-medium">
                {job.companies?.name || "Unknown Company"}
              </p>

              <p className="text-xs text-muted-foreground/70 mt-0.5">
                {formatLabel(job.work_location) || "Remote"}
              </p>
            </div>

            <button
              onClick={() => navigate(`/jobs/${job.id}`)}
              className="text-xs font-semibold text-sidebar bg-background border border-border px-3 py-1.5 rounded-xl hover:border-accent/40 hover:bg-secondary/50 transition-all cursor-pointer"
            >
              View role →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}