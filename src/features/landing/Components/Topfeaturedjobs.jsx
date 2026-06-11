// src/features/landing/sections/TopFeaturedJobs.jsx
import { Bookmark, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

const jobs = [
  {
    company: "Google",
    office: "Remote · Full Time",
    role: "Senior Product Designer",
    tags: ["Full Time", "Remote", "Part Time"],
    salary: "$90K–$110K",
    applicants: 312,
    featured: true,
    initial: "G",
    color: "bg-[#4285F4]",
  },
  {
    company: "Stripe",
    office: "New York Office",
    role: "Frontend Engineer",
    tags: ["Full Time", "Remote", "Part Time"],
    salary: "$110K–$140K",
    applicants: 204,
    featured: false,
    initial: "S",
    color: "bg-[#6772E5]",
  },
  {
    company: "Figma",
    office: "San Francisco Office",
    role: "Design Systems Lead",
    tags: ["Full Time", "Remote", "Part Time"],
    salary: "$100K–$130K",
    applicants: 178,
    featured: false,
    initial: "F",
    color: "bg-[#F24E1E]",
  },
  {
    company: "Anthropic",
    office: "Remote · Contract",
    role: "AI Product Manager",
    tags: ["Full Time", "Remote", "Contract"],
    salary: "$120K–$160K",
    applicants: 421,
    featured: false,
    initial: "A",
    color: "bg-primary dark:bg-accent",
  },
  {
    company: "Notion",
    office: "Remote · Part Time",
    role: "UX Researcher",
    tags: ["Part Time", "Remote"],
    salary: "$70K–$90K",
    applicants: 143,
    featured: false,
    initial: "N",
    color: "bg-foreground",
  },
  {
    company: "Linear",
    office: "Berlin Office",
    role: "Lead UI/UX Designer",
    tags: ["Full Time", "On-site"],
    salary: "$80K–$100K",
    applicants: 95,
    featured: false,
    initial: "L",
    color: "bg-[#5E6AD2]",
  },
];

const tagColors = {
  "Full Time": "text-primary dark:text-accent bg-primary/8 dark:bg-accent/10",
  Remote: "text-accent dark:text-muted-foreground bg-accent/8 dark:bg-muted",
  "Part Time": "text-muted-foreground bg-muted",
  "On-site": "text-muted-foreground bg-muted",
  Contract: "text-warning bg-warning/10",
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div
              key={job.role}
              className={`job-card group relative bg-card p-5 flex flex-col justify-between gap-4 rounded-2xl overflow-hidden ${job.featured ? "featured-glow ring-1 ring-primary/20" : ""
                }`}
            >
              {/* Company row */}
              <div className="flex items-start justify-between z-10 relative">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl ${job.color} flex items-center justify-center shrink-0`}
                  >
                    <span className="text-sm font-bold text-white">
                      {job.initial}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground leading-tight">
                      {job.company}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {job.office}
                    </p>
                  </div>
                </div>
                <button className="w-8 h-8 rounded-full flex items-center justify-center border border-border/60 hover:bg-surface-hover transition-colors">
                  <Bookmark size={13} className="text-muted-foreground" />
                </button>
              </div>

              {/* Role */}
              <div className="z-10 relative">
                <h3 className="font-semibold text-foreground text-base leading-snug">
                  {job.role}
                </h3>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {job.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full ${tagColors[tag] ?? "text-muted-foreground bg-muted"
                        }`}
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
                    {job.salary}
                  </p>
                  <AvatarStack count={job.applicants} />
                </div>
                <button
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${job.featured
                    ? "bg-primary dark:bg-accent text-white hover:bg-primary-hover dark:hover:bg-primary"
                    : "text-primary dark:text-accent hover:bg-secondary dark:hover:bg-surface-hover"
                    }`}
                >
                  Apply <ArrowRight size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}