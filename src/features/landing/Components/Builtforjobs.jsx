// src/features/landing/sections/BuiltForJobs.jsx
import { Search, BarChart2, FileText, MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function BuiltForJobs() {
  const { t } = useTranslation();
  const features = [
    {
      title: t("builtFj.applicant.resumeScore.title"),
      description: t("builtFj.applicant.resumeScore.description"),
      icon: FileText,
      bg: "bg-secondary dark:bg-surface-muted",
      accent: "text-primary dark:text-accent",
      visual: (
        <div className="mt-4 rounded-xl border border-border bg-card p-3 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-foreground">
              Resume Match Score
            </p>
            <span className="text-[10px] font-bold text-success">91%</span>
          </div>

          <p className="text-[10px] text-muted-foreground">
            Frontend Developer Position
          </p>

          <div className="w-full h-1.5 rounded-full bg-border overflow-hidden">
            <div className="h-full w-[91%] rounded-full bg-success" />
          </div>

          <div className="space-y-0.5 pt-1">
            <p className="text-[10px] text-success">
              + Strong React Experience
            </p>
            <p className="text-[10px] text-success">
              + Relevant Project Portfolio
            </p>
            <p className="text-[10px] text-warning">
              − Add More TypeScript Keywords
            </p>
          </div>
        </div>
      ),
    },
    {
      title: t("builtFj.applicant.interviews.title"),
      description: t("builtFj.applicant.interviews.description"),
      icon: BarChart2,
      bg: "bg-secondary dark:bg-surface-muted",
      accent: "text-warning",
      visual: (
        <div className="mt-4 rounded-xl border border-border bg-card p-3 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-foreground">
              Assessment Result
            </p>
            <span className="text-[10px] font-bold text-primary dark:text-accent">
              87%
            </span>
          </div>

          <p className="text-[10px] text-muted-foreground">
            Frontend Developer Interview
          </p>

          <div className="w-full h-1.5 rounded-full bg-border overflow-hidden">
            <div className="h-full w-[87%] rounded-full bg-primary dark:bg-accent" />
          </div>

          <div className="pt-1 grid grid-cols-2 gap-x-3 gap-y-0.5">
            <div>
              <p className="text-[9px] font-semibold text-muted-foreground mb-0.5">
                Strengths
              </p>
              <p className="text-[10px] text-success">✓ Problem Solving</p>
              <p className="text-[10px] text-success">✓ React Knowledge</p>
            </div>

            <div>
              <p className="text-[9px] font-semibold text-muted-foreground mb-0.5">
                Improve
              </p>
              <p className="text-[10px] text-warning">• System Design</p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const heroFeature = {
    title: t("builtFj.recruiter.jdGenerator.title"),
    description: t("builtFj.recruiter.jdGenerator.description"),
    icon: MessageSquare,
  };
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
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            {t("builtFj.labels.applicants")}
          </span>

          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            {t("builtFj.labels.employers")}
          </span>
        </div>
        <div className="grid md:grid-cols-2 gap-5 items-stretch">
          {/* Left column — two stacked cards */}
          <div className="flex flex-col gap-5">
            {features.map(
              ({ title, description, icon: Icon, bg, accent, visual }) => (
                <div
                  key={title}
                  className={`
  rounded-2xl border border-border p-6 ${bg}
  transition-all duration-300 ease-out
  hover:shadow-lg hover:border-primary/30 hover:-translate-y-1
`}
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
              ),
            )}
          </div>

          {/* Right column — two stacked cards */}
          <div className="flex flex-col gap-5">
            {/* Card 1 —AI Job Description Generator*/}
            <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-secondary to-surface-muted dark:from-surface dark:via-surface-muted dark:to-surface p-6 flex flex-col gap-5 transition-all duration-300 ease-out hover:shadow-lg hover:border-primary/30 hover:-translate-y-1">
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
                    Job Description Generated
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-success/10 text-success">
                    Ready
                  </span>
                </div>

                <div className="px-4 py-3 border-b border-border">
                  <p className="text-[10px] text-muted-foreground">Position</p>
                  <p className="text-xs font-semibold text-foreground">
                    Senior Frontend Developer
                  </p>
                </div>

                <div className="grid grid-cols-2 divide-x divide-border">
                  <div className="px-4 py-3">
                    <p className="text-[10px] text-muted-foreground">
                      Requirements
                    </p>
                    <p className="text-sm font-bold text-foreground">15</p>
                  </div>

                  <div className="px-4 py-3">
                    <p className="text-[10px] text-muted-foreground">
                      Responsibilities
                    </p>
                    <p className="text-sm font-bold text-foreground">10</p>
                  </div>
                </div>

                <div className="px-4 py-3 bg-primary/5 dark:bg-accent/5 flex items-center gap-2">
                  <FileText
                    size={13}
                    className="text-primary dark:text-accent shrink-0"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    {t("builtFj.recruiter.jdGenerator.footer")}
                  </p>
                </div>
              </div>
            </div>
            {/* Card 2 — AI Screening Assistant */}
            {/* <div className="flex-1 rounded-2xl border border-border bg-secondary dark:bg-surface-muted p-6 flex flex-col gap-3 transition-shadow hover:shadow-md">
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
            </div> */}

            <div className="flex-1 rounded-2xl border border-border bg-secondary dark:bg-surface-muted p-6 flex flex-col gap-3 transition-all duration-300 ease-out hover:shadow-lg hover:border-primary/30 hover:-translate-y-1">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-card border border-border">
                <Search size={18} className="text-primary dark:text-accent" />
              </div>

              <h3 className="font-semibold text-foreground text-base">
                {t("builtFj.recruiter.shortlist.title")}
              </h3>

              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("builtFj.recruiter.shortlist.description")}
              </p>

              <div className="mt-auto rounded-xl border border-border bg-card p-3 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-foreground">
                    Candidates Shortlisted
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Frontend Developer Position
                  </p>
                </div>

                <span className="text-sm font-bold text-primary dark:text-accent">
                  24
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
