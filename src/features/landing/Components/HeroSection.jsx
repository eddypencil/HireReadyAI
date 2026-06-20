import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { useMemo } from "react";

function StarField() {
  const stars = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2.5 + 1,
        twinkleDelay: Math.random() * 5,
        twinkleDuration: Math.random() * 3 + 2,
        driftX: (Math.random() - 0.5) * 120,
        driftY: (Math.random() - 0.5) * 120,
        driftDuration: Math.random() * 25 + 20,
        driftDelay: Math.random() * -30,
        id: i,
      })),
    []
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {stars.map((s) => (
        <div
          key={s.id}
          className="absolute star"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            '--drift-x': `${s.driftX}px`,
            '--drift-y': `${s.driftY}px`,
            '--twinkle-delay': `${s.twinkleDelay}s`,
            '--twinkle-duration': `${s.twinkleDuration}s`,
            '--drift-duration': `${s.driftDuration}s`,
            '--drift-delay': `${s.driftDelay}s`,
          }}
        />
      ))}
      <style>{`
        .star {
          border-radius: 50%;
          background: color-mix(in srgb, var(--color-foreground) 55%, transparent);
          box-shadow: 0 0 4px 1px color-mix(in srgb, var(--color-foreground) 40%, transparent);
          animation:
            drift var(--drift-duration) ease-in-out var(--drift-delay) infinite alternate,
            twinkle var(--twinkle-duration) ease-in-out var(--twinkle-delay) infinite;
        }
        .dark .star {
          background: color-mix(in srgb, var(--color-accent) 40%, transparent);
          box-shadow: 0 0 6px 2px color-mix(in srgb, var(--color-accent) 35%, transparent);
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.35; transform: scale(0.7); }
          50% { opacity: 0.95; transform: scale(1.3); }
        }
        @keyframes drift {
          0% { translate: 0px 0px; }
          100% { translate: var(--drift-x) var(--drift-y); }
        }
        @media (prefers-reduced-motion: reduce) {
          .star { animation: none; opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}

export default function HeroSection() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRTL = i18n.language === "ar";

  return (
    <section
      id="hero"
      className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden bg-background"
    >
      <StarField />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] sm:w-[800px] sm:h-[800px] pointer-events-none hero-bg-glow" />

      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-3xl mx-auto pt-16 pb-8">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-foreground leading-[1.1] mb-6 hero-glow">
          {t("landing.hero.headline")}
        </h1>

        <p className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed mb-10">
          {t("landing.hero.subheadline")}
        </p>

        <div
          className={`flex flex-col sm:flex-row gap-4 w-full sm:w-auto ${isRTL ? "sm:flex-row-reverse" : ""
            }`}
        >
          <button
            onClick={() => navigate("/jobs")}
            className="px-8 py-3.5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors cursor-pointer shadow-lg shadow-primary/20"
          >
            {t("landing.hero.cta_applicant")}
          </button>
          <button
            onClick={() => navigate("/auth/sign-up")}
            className="px-8 py-3.5 rounded-full border-2 border-primary text-primary dark:text-primary-hover text-sm font-semibold hover:bg-primary hover:text-white dark:hover:bg-white dark:hover:text-primary transition-colors cursor-pointer"
          >
            {t("landing.hero.cta_recruiter")}
          </button>
        </div>
      </div>

      <div className="relative w-full max-w-5xl mx-auto px-4 mt-8">
        <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border/50">
          <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 dark:bg-surface-muted/50 border-b border-border/30">
            <span className="w-3 h-3 rounded-full bg-red-500/80" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <span className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <img
            src="/dashboard-preview.png"
            alt="Dashboard Preview"
            className="w-full h-auto object-cover hero-dashboard-img"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
          <div
            className="hidden w-full aspect-[16/9] bg-gradient-to-br from-primary/10 to-accent/10 items-center justify-center"
          >
            <p className="text-muted-foreground text-sm">
              Dashboard preview — replace with your screenshot
            </p>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
        </div>
      </div>

      <div
        className={`absolute top-[15%] hidden lg:block ${isRTL ? "right-[5%]" : "left-[5%]"
          }`}
      >
        <div className="w-64 bg-card dark:bg-[#0b2336] rounded-2xl border border-border/50 shadow-xl p-4 hero-float-card hero-float-slow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
              G
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                Senior Frontend Developer
              </p>
              <p className="text-xs text-muted-foreground">Google • $120k-180k</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="px-2 py-0.5 rounded-full bg-success/10 text-success text-[10px] font-medium">
              Active
            </span>
            <span>2d ago</span>
          </div>
        </div>
      </div>

      <div
        className={`absolute top-[20%] hidden lg:block ${isRTL ? "left-[5%]" : "right-[5%]"
          }`}
      >
        <div className="w-64 bg-surface rounded-2xl border border-border/80 shadow-xl p-4 hero-float-card hero-float-fast flex flex-col justify-between min-h-[165px]">
          <div className="flex flex-col flex-1 justify-between">
            <div className="flex items-start gap-3 mb-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                SA
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-foreground truncate leading-snug">
                  Sarah Ahmed
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                  2 hours ago
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border tracking-wide uppercase bg-success/10 text-success border-success/20">
                Strong Fit
              </span>
              <span className="px-2 py-0.5 rounded-lg text-[11px] font-bold tracking-tight shrink-0 bg-success/10 text-success border border-success/20">
                95/100
              </span>
            </div>

            <div className="w-full">
              <div className="flex items-center justify-between mb-1 text-[11px] font-medium text-muted-foreground">
                <span>AI Match</span>
                <span className="font-bold text-foreground">95%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-muted border border-border/30 overflow-hidden">
                <div className="h-full rounded-full bg-success transition-all duration-500" style={{ width: "95%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes floatA {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-16px); }
        }
        @keyframes floatB {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
        }
        @keyframes slowZoom {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.04); }
        }
        .hero-float-card {
          animation: floatA 6s ease-in-out infinite;
        }
        .hero-float-card.hero-float-fast {
          animation: floatB 8s ease-in-out infinite;
        }
        .hero-dashboard-img {
          animation: slowZoom 20s ease-in-out infinite;
        }
        .hero-bg-glow {
          background: radial-gradient(ellipse at center, color-mix(in srgb, var(--color-primary) 18%, transparent) 0%, transparent 70%);
          border-radius: 50%;
          filter: blur(60px);
        }
        .dark .hero-bg-glow {
          background: radial-gradient(ellipse at center, color-mix(in srgb, var(--color-accent) 15%, transparent) 0%, transparent 70%);
        }
        .hero-glow {
          text-shadow: 0 0 30px color-mix(in srgb, var(--color-primary) 25%, transparent),
                       0 0 60px color-mix(in srgb, var(--color-primary) 15%, transparent),
                       0 0 100px color-mix(in srgb, var(--color-primary) 8%, transparent);
        }
        .dark .hero-glow {
          text-shadow: 0 0 30px color-mix(in srgb, var(--color-accent) 30%, transparent),
                       0 0 60px color-mix(in srgb, var(--color-accent) 18%, transparent),
                       0 0 100px color-mix(in srgb, var(--color-accent) 10%, transparent);
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-float-card,
          .hero-float-card.hero-float-fast,
          .hero-dashboard-img {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}
