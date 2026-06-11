// src/features/landing/sections/BuiltForJobs.jsx
import { Search, BarChart2, FileText, MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";

const features = [
  {
    title: "AI-Powered Resume Review",
    description:
      "Get instant feedback on your resume, identify missing skills, and improve your chances before applying.",
    icon: FileText,
    bg: "bg-secondary dark:bg-surface-muted",
    accent: "text-primary dark:text-accent",
    visual: (
      <div className="mt-4 rounded-xl border border-border bg-card p-3 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-foreground">
            Resume Analysis Complete
          </p>
          <span className="text-[10px] font-bold text-success">88%</span>
        </div>
        <p className="text-[10px] text-muted-foreground">
          Frontend Developer CV
        </p>
        <div className="w-full h-1.5 rounded-full bg-border overflow-hidden">
          <div className="h-full w-[88%] rounded-full bg-success" />
        </div>
        <div className="space-y-0.5 pt-1">
          <p className="text-[10px] text-success">+ Strong React Skills</p>
          <p className="text-[10px] text-success">+ Good Project Experience</p>
          <p className="text-[10px] text-warning">− Add More Keywords</p>
        </div>
      </div>
    ),
  },
  {
    title: "ATS Match Scoring",
    description:
      "See how well your resume matches each job posting and discover what recruiters are looking for.",
    icon: BarChart2,
    bg: "bg-secondary dark:bg-surface-muted",
    accent: "text-warning",
    visual: (
      <div className="mt-4 rounded-xl border border-border bg-card p-3 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-foreground">Match Score</p>
          <span className="text-[10px] font-bold text-primary dark:text-accent">
            92% Match
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground">Frontend Developer</p>
        <div className="w-full h-1.5 rounded-full bg-border overflow-hidden">
          <div className="h-full w-[92%] rounded-full bg-primary dark:bg-accent" />
        </div>
        <div className="pt-1 grid grid-cols-2 gap-x-3 gap-y-0.5">
          <div>
            <p className="text-[9px] font-semibold text-muted-foreground mb-0.5">
              Skills Found
            </p>
            {["React", "JavaScript", "Git"].map((s) => (
              <p key={s} className="text-[10px] text-success">
                ✓ {s}
              </p>
            ))}
          </div>
          <div>
            <p className="text-[9px] font-semibold text-muted-foreground mb-0.5">
              Missing
            </p>
            {["TypeScript"].map((s) => (
              <p key={s} className="text-[10px] text-warning">
                • {s}
              </p>
            ))}
          </div>
        </div>
      </div>
    ),
  },
];

const heroFeature = {
  title: "AI Interview Assistant",
  description:
    "Practice interview questions generated specifically for the role you're applying for — get scored, get feedback, get confident.",
  icon: MessageSquare,
};

export default function BuiltForJobs() {
  const { t } = useTranslation();

  return (
    <section className="py-20 px-4 bg-background">
      <div className="max-w-6xl mx-auto">

        <div className="text-center mb-16 space-y-4">
          <span className="inline-block text-[10px] font-extrabold tracking-[0.2em] text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/10 uppercase">
            {t("builtForJobs.eyebrow")}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
            {t("builtForJobs.title")}
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base">
            {t("builtForJobs.subtitle")}
          </p>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 gap-5 items-stretch">
          {/* Left column — two stacked cards */}
          <div className="flex flex-col gap-5">
            {features.map(
              ({ title, description, icon: Icon, bg, accent, visual }) => (
                <div
                  key={title}
                  className={`rounded-2xl border border-border p-6 ${bg} transition-shadow hover:shadow-md`}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-card border border-border">
                    <Icon size={18} className={accent} />
                  </div>
                  <h3 className="font-semibold text-foreground text-base">
                    {title}
                  </h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                    {description}
                  </p>
                  {visual}
                </div>
              )
            )}
          </div>

          {/* Right column — two stacked cards */}
          <div className="flex flex-col gap-5">
            {/* Card 1 — AI Interview Assistant */}
            <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-secondary to-surface-muted dark:from-surface dark:via-surface-muted dark:to-surface p-6 flex flex-col gap-5 transition-shadow hover:shadow-md">
              <div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-card border border-border">
                  <MessageSquare
                    size={18}
                    className="text-primary dark:text-accent"
                  />
                </div>
                <h3 className="font-semibold text-foreground text-base">
                  {heroFeature.title}
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed max-w-sm">
                  {heroFeature.description}
                </p>
              </div>
              <div className="rounded-2xl bg-card border border-border shadow-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">
                    Mock Interview Ready
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-success/10 text-success">
                    Ready
                  </span>
                </div>
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-[10px] text-muted-foreground">Role</p>
                  <p className="text-xs font-semibold text-foreground">
                    Frontend Developer
                  </p>
                </div>
                <div className="grid grid-cols-2 divide-x divide-border">
                  <div className="px-4 py-3">
                    <p className="text-[10px] text-muted-foreground">
                      Questions Generated
                    </p>
                    <p className="text-sm font-bold text-foreground">12</p>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-[10px] text-muted-foreground">
                      Estimated Time
                    </p>
                    <p className="text-sm font-bold text-foreground">15 min</p>
                  </div>
                </div>
                <div className="px-4 py-3 bg-primary/5 dark:bg-accent/5 flex items-center gap-2">
                  <MessageSquare
                    size={13}
                    className="text-primary dark:text-accent shrink-0"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Questions tailored to your resume & job description
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2 — AI Screening Assistant */}
            <div className="flex-1 rounded-2xl border border-border bg-secondary dark:bg-surface-muted p-6 flex flex-col gap-3 transition-shadow hover:shadow-md">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-card border border-border">
                <Search size={18} className="text-primary dark:text-accent" />
              </div>
              <h3 className="font-semibold text-foreground text-base">
                AI Screening Assistant
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Pass recruiter screening rounds with confidence. HireReadyAI
                coaches you on the exact criteria companies use to filter
                candidates at each stage.
              </p>
              <div className="mt-auto rounded-xl border border-border bg-card p-3 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-foreground">
                    Screening Score
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Senior Frontend Engineer
                  </p>
                </div>
                <span className="text-sm font-bold text-primary dark:text-accent">
                  94%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}