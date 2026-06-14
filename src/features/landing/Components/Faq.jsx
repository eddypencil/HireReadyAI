// src/features/landing/sections/FAQ.jsx
import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

export default function FAQ() {
  const [open, setOpen] = useState(1); // open second item by default (mirrors screenshot)
  const { t } = useTranslation();
  const faqs = [
    {
      q: t("faq.items.0.q"),
      a: t("faq.items.0.a"),
    },
    {
      q: t("faq.items.1.q"),
      a: t("faq.items.1.a"),
    },
    {
      q: t("faq.items.2.q"),
      a: t("faq.items.2.a"),
    },
    {
      q: t("faq.items.3.q"),
      a: t("faq.items.3.a"),
    },
    {
      q: t("faq.items.4.q"),
      a: t("faq.items.4.a"),
    },
    {
      q: t("faq.items.5.q"),
      a: t("faq.items.5.a"),
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-50px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="py-20 px-4 bg-background"
      id="faq"
    >
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="inline-block text-[10px] font-extrabold tracking-[0.2em] text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/10 uppercase">
            {t("faq.eyebrow")}
          </span>
          <h2 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            {t("faq.title")}
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-sm mx-auto">
            {t("faq.subtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left — decorative illustration column */}
          <div className="hidden md:flex flex-col items-center justify-center h-full">
            <div className="relative w-full max-w-md lg:max-w-lg scale-110 lg:scale-125">
              {/* Mock phone shell */}
              <div className="mx-auto w-80 md:w-[22rem] lg:w-[24rem] rounded-[2.5rem] border-4 border-foreground/10 bg-card shadow-2xl overflow-hidden">
                {/* Status bar */}
                <div className="bg-surface-muted px-4 pt-3 pb-1 flex items-center justify-between">
                  <span className="text-[9px] font-bold text-foreground">
                    9:41
                  </span>
                  <div className="w-16 h-4 bg-foreground/10 rounded-full" />
                </div>
                {/* App header */}
                <div className="bg-surface-muted px-4 pb-3">
                  <p className="text-[9px] text-muted-foreground">
                    Welcome back!
                  </p>
                  <p className="text-xs font-bold text-foreground">
                    My Applications
                  </p>
                </div>
                {/* Pipeline cards */}
                <div className="bg-card px-3 py-2 space-y-2">
                  {[
                    {
                      role: "Product Designer",
                      company: "Google",
                      stage: "Interview",
                      color: "bg-stage-interview",
                    },
                    {
                      role: "UX Researcher",
                      company: "Stripe",
                      stage: "Screening",
                      color: "bg-stage-screening",
                    },
                    {
                      role: "Design Lead",
                      company: "Figma",
                      stage: "Applied",
                      color: "bg-stage-applied",
                    },
                  ].map(({ role, company, stage, color }) => (
                    <div
                      key={role}
                      className="rounded-xl border border-border bg-surface-muted p-2"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[9px] font-semibold text-foreground">
                          {role}
                        </p>
                        <span
                          className={`text-[7px] font-bold text-white px-1.5 py-0.5 rounded-full ${color}`}
                        >
                          {stage}
                        </span>
                      </div>
                      <p className="text-[8px] text-muted-foreground">
                        {company}
                      </p>
                    </div>
                  ))}
                </div>
                {/* Bottom nav stub */}
                <div className="bg-card border-t border-border px-4 py-2 flex justify-around">
                  {["Home", "Jobs", "Track", "Profile"].map((n) => (
                    <div key={n} className="flex flex-col items-center gap-0.5">
                      <div className="w-4 h-3 bg-border rounded" />
                      <span className="text-[7px] text-muted-foreground">
                        {n}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating status badge with floating animation */}
              <div className="absolute -right-2 top-16 bg-card border border-border rounded-xl px-3 py-2 shadow-lg faq-float-badge">
                <p className="text-[9px] font-semibold text-foreground">
                  Interview Request
                </p>
                <p className="text-[8px] text-muted-foreground">
                  Google · 2 min ago
                </p>
              </div>
            </div>
          </div>

          {/* Right — FAQ accordion */}
          <div>
            <div className="space-y-2">
              {faqs.map((faq, i) => {
                const isOpen = open === i;
                return (
                  <div
                    key={i}
                    className={`rounded-xl border transition-colors cursor-pointer
                      ${
                        isOpen
                          ? "border-primary/30 dark:border-accent/30 bg-secondary dark:bg-surface-muted"
                          : "border-border bg-card hover:bg-surface-hover"
                      }`}
                    onClick={() => setOpen(isOpen ? null : i)}
                  >
                    <div className="flex items-center justify-between px-5 py-4 gap-4">
                      <span
                        className={`text-sm font-semibold leading-snug ${isOpen ? "text-primary dark:text-accent" : "text-foreground"}`}
                      >
                        {faq.q}
                      </span>
                      <div
                        className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center border transition-colors
                        ${
                          isOpen
                            ? "border-primary/30 dark:border-accent/30 bg-primary/10 dark:bg-accent/10"
                            : "border-border bg-surface-muted"
                        }`}
                      >
                        {isOpen ? (
                          <Minus
                            size={13}
                            className="text-primary dark:text-accent"
                          />
                        ) : (
                          <Plus size={13} className="text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    {isOpen && (
                      <div className="px-5 pb-4">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {faq.a}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes floatBadgeAnimation {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(1deg); }
        }
        .faq-float-badge {
          animation: floatBadgeAnimation 4s ease-in-out infinite alternate;
        }
        @media (prefers-reduced-motion: reduce) {
          .faq-float-badge {
            animation: none;
          }
        }
      `}</style>
    </motion.section>
  );
}
