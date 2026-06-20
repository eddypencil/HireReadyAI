// src/features/landing/sections/FeaturesSection.jsx
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

const FEATURES = [
  {
    id: 1,
    mockup: (
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-primary/5 dark:to-primary/10 rounded-2xl border border-border/50 overflow-hidden shadow-lg">
        <div className="flex items-center gap-1.5 px-4 py-2.5 bg-white/50 dark:bg-white/5 border-b border-border/30">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
          <span className="ml-3 text-[10px] text-muted-foreground/60 font-mono">jd-generator</span>
        </div>
        <div className="p-5 space-y-3">
          <div className="h-3 w-3/4 rounded bg-primary/20 dark:bg-primary/30" />
          <div className="h-3 w-1/2 rounded bg-primary/15 dark:bg-primary/20" />
          <div className="h-20 rounded-lg bg-white/60 dark:bg-white/5 border border-border/30 p-3 space-y-2">
            <div className="h-2 w-full rounded bg-muted-foreground/10" />
            <div className="h-2 w-5/6 rounded bg-muted-foreground/10" />
            <div className="h-2 w-4/6 rounded bg-muted-foreground/10" />
          </div>
          <div className="h-8 w-24 rounded-lg bg-primary/60" />
        </div>
      </div>
    ),
  },
  {
    id: 2,
    mockup: (
      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-success/5 dark:to-success/10 rounded-2xl border border-border/50 overflow-hidden shadow-lg">
        <div className="flex items-center gap-1.5 px-4 py-2.5 bg-white/50 dark:bg-white/5 border-b border-border/30">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
          <span className="ml-3 text-[10px] text-muted-foreground/60 font-mono">cv-evaluator</span>
        </div>
        <div className="p-5 space-y-3">
          <div className="flex gap-3">
            <div className="flex-1 h-16 rounded-lg bg-white/60 dark:bg-white/5 border border-border/30 p-2.5 space-y-2">
              <div className="h-2 w-3/4 rounded bg-success/30" />
              <div className="h-2 w-1/2 rounded bg-success/20" />
            </div>
            <div className="flex-1 h-16 rounded-lg bg-white/60 dark:bg-white/5 border border-border/30 p-2.5 space-y-2">
              <div className="h-2 w-3/4 rounded bg-warning/30" />
              <div className="h-2 w-1/2 rounded bg-warning/20" />
            </div>
            <div className="flex-1 h-16 rounded-lg bg-white/60 dark:bg-white/5 border border-border/30 p-2.5 space-y-2">
              <div className="h-2 w-3/4 rounded bg-destructive/30" />
              <div className="h-2 w-1/2 rounded bg-destructive/20" />
            </div>
          </div>
          <div className="h-2 w-full rounded bg-muted-foreground/10" />
          <div className="h-2 w-4/6 rounded bg-muted-foreground/10" />
        </div>
      </div>
    ),
  },
  {
    id: 3,
    mockup: (
      <div className="bg-gradient-to-br from-violet-50 to-violet-100 dark:from-accent/5 dark:to-accent/10 rounded-2xl border border-border/50 overflow-hidden shadow-lg">
        <div className="flex items-center gap-1.5 px-4 py-2.5 bg-white/50 dark:bg-white/5 border-b border-border/30">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
          <span className="ml-3 text-[10px] text-muted-foreground/60 font-mono">ai-interview</span>
        </div>
        <div className="p-5 space-y-3">
          <div className="flex items-center gap-3 rounded-lg bg-white/60 dark:bg-white/5 border border-border/30 p-3">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-accent/60" />
            </div>
            <div className="flex-1 space-y-1.5">
              <div className="h-2 w-3/4 rounded bg-muted-foreground/15" />
              <div className="h-2 w-1/2 rounded bg-muted-foreground/10" />
            </div>
          </div>
          <div className="h-12 rounded-lg bg-white/60 dark:bg-white/5 border border-border/30 p-3">
            <div className="h-2 w-full rounded bg-muted-foreground/10" />
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-20 rounded-lg bg-accent/40" />
            <div className="h-8 w-20 rounded-lg border border-border/50" />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 4,
    mockup: (
      <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-warning/5 dark:to-warning/10 rounded-2xl border border-border/50 overflow-hidden shadow-lg">
        <div className="flex items-center gap-1.5 px-4 py-2.5 bg-white/50 dark:bg-white/5 border-b border-border/30">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
          <span className="ml-3 text-[10px] text-muted-foreground/60 font-mono">pipeline</span>
        </div>
        <div className="p-5 space-y-3">
          <div className="flex gap-2">
            {["Applied", "Screening", "Interview"].map((s) => (
              <div key={s} className="flex-1 rounded-lg bg-white/60 dark:bg-white/5 border border-border/30 p-2.5 space-y-2">
                <div className="h-1.5 w-3/4 rounded bg-primary/30" />
                <div className="h-1 w-full rounded bg-muted-foreground/10" />
                <div className="h-1 w-2/3 rounded bg-muted-foreground/10" />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1 justify-center text-muted-foreground/40 text-xs">
            <span>◀</span>
            <span className="h-px w-8 border-t border-dashed border-border" />
            <span>▶</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 5,
    mockup: (
      <div className="bg-gradient-to-br from-sky-50 to-sky-100 dark:from-primary/5 dark:to-primary/15 rounded-2xl border border-border/50 overflow-hidden shadow-lg">
        <div className="flex items-center gap-1.5 px-4 py-2.5 bg-white/50 dark:bg-white/5 border-b border-border/30">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
          <span className="ml-3 text-[10px] text-muted-foreground/60 font-mono">candidate-profile</span>
        </div>
        <div className="p-5 space-y-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center text-sm font-bold shrink-0">
              SA
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="h-2.5 w-1/3 rounded bg-muted-foreground/15" />
              <div className="h-2 w-1/4 rounded bg-muted-foreground/10" />
            </div>
            <div className="h-6 w-14 rounded-md bg-primary/20" />
          </div>
          <div className="space-y-1.5">
            {["Strengths", "Weaknesses", "Gaps"].map((label) => (
              <div key={label} className="h-6 rounded-lg bg-white/60 dark:bg-white/5 border border-border/30 flex items-center px-3">
                <div className="h-1.5 w-12 rounded bg-muted-foreground/15" />
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 6,
    mockup: (
      <div className="bg-gradient-to-br from-rose-50 to-rose-100 dark:from-destructive/5 dark:to-destructive/10 rounded-2xl border border-border/50 overflow-hidden shadow-lg">
        <div className="flex items-center gap-1.5 px-4 py-2.5 bg-white/50 dark:bg-white/5 border-b border-border/30">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
          <span className="ml-3 text-[10px] text-muted-foreground/60 font-mono">feedback</span>
        </div>
        <div className="p-5 space-y-3">
          <div className="rounded-lg bg-white/60 dark:bg-white/5 border border-border/30 p-3 space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-success text-xs font-bold shrink-0">✓</span>
              <div className="flex-1 space-y-1">
                <div className="h-2 w-5/6 rounded bg-muted-foreground/10" />
                <div className="h-2 w-3/6 rounded bg-muted-foreground/10" />
              </div>
            </div>
            <div className="h-px border-t border-dashed border-border/50" />
            <div className="flex items-start gap-2">
              <span className="text-warning text-xs font-bold shrink-0">→</span>
              <div className="flex-1 space-y-1">
                <div className="h-2 w-4/6 rounded bg-muted-foreground/10" />
                <div className="h-2 w-2/6 rounded bg-muted-foreground/10" />
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
];

function FeatureMockup({ mockup }) {
  return <div className="w-full max-w-md mx-auto">{mockup}</div>;
}

function FeatureContent({ num, isRTL }) {
  const { t } = useTranslation();

  return (
    <div className={`w-full max-w-md mx-auto ${isRTL ? "text-right" : "text-left"}`} dir={isRTL ? "rtl" : "ltr"}>
      <h3 className="text-xl md:text-2xl font-bold text-foreground mb-3">
        {t(`landing.features.${num}.title`)}
      </h3>
      <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-5">
        {t(`landing.features.${num}.description`)}
      </p>
      <ul className={`space-y-2.5 list-none p-0 ${isRTL ? "text-right" : "text-left"}`}>
        {[0, 1, 2].map((d) => (
          <li key={d} className="flex items-start gap-2.5 text-sm text-foreground/80">
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
            <span>{t(`landing.features.${num}.details.${d}`)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function FeaturesSection() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  return (
    <section id="features" className="py-20 md:py-28 bg-background overflow-hidden">
      <div className="text-center space-y-3 max-w-2xl mx-auto mb-16 md:mb-20 px-4">
        <span className="inline-block text-[10px] font-extrabold tracking-[0.2em] text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/10 uppercase">
          Features
        </span>
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          {t("landing.features.heading")}
        </h2>
      </div>

      <div className="relative max-w-6xl mx-auto px-4">
        <div className="absolute left-1/2 top-0 bottom-0 w-px border-l-2 border-dashed border-border/60 -translate-x-1/2 z-0 max-md:hidden" />

        {FEATURES.map((feature, index) => {
          const isEven = index % 2 === 0;
          const num = index + 1;

          return (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, x: isEven ? -80 : 80 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, margin: "-80px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-6 mb-20 md:mb-28 last:mb-0"
            >
              <div className={`flex-1 flex justify-center w-full md:w-auto order-1 ${isEven ? "md:order-1" : "md:order-3"}`}>
                <FeatureContent num={num} isRTL={isRTL} />
              </div>

              <div className="relative flex items-center justify-center w-14 h-14 md:w-20 md:h-20 shrink-0 order-2">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary text-white flex items-center justify-center text-lg md:text-xl font-bold shadow-lg shadow-primary/20 z-10 relative">
                  {num}
                </div>
              </div>

              <div className={`flex-1 flex justify-center w-full md:w-auto order-3 ${isEven ? "md:order-3" : "md:order-1"}`}>
                <FeatureMockup mockup={feature.mockup} />
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}