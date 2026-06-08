//src\features\auth\components\AuthLayout.jsx
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/shared/ui/LanguageSwitcher";

export default function AuthLayout({ children, headline, subheading }) {
  const { t } = useTranslation();

  const featureKeys = ["match", "interviews", "feedback"];

  return (
    <div className="flex min-h-screen">
      {/* LEFT SIDE */}
      <div className="hidden lg:flex lg:flex-col lg:w-[45%] xl:w-[40%] shrink-0 bg-sidebar p-12 justify-between relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              radial-gradient(ellipse at 0% 0%, rgba(70,143,175,0.15) 0%, transparent 60%),
              radial-gradient(ellipse at 100% 100%, rgba(1,73,124,0.2) 0%, transparent 55%)
            `,
          }}
        />

        <div className="relative z-10 flex items-center gap-3">
          <span
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-accent text-white font-bold text-sm shrink-0"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            H
          </span>
          <span
            className="text-white text-lg font-bold tracking-tight"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            HireReadyAI
          </span>
        </div>

        <LanguageSwitcher />

        {/* CONTENT */}
        <div className="relative z-10 flex flex-col gap-6 my-auto py-12">
          <div>
            <h1
              className="text-white font-black leading-[1.1] mb-4"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "clamp(2rem, 3.2vw, 2.75rem)",
              }}
            >
              {t("auth_layout.headline")}
            </h1>

            <p className="text-white/70 text-sm leading-relaxed max-w-xs mt-10 mb-5">
              {t("auth_layout.subheading")}
            </p>
          </div>

          <ul className="flex flex-col gap-4">
            {featureKeys.map((key) => (
              <li key={key} className="flex items-start gap-3">
                <span className="mt-0.5 w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path
                      d="M2 5l2 2 4-4"
                      stroke="#468faf"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>

                <span className="text-white/80 text-sm leading-snug">
                  {t(`auth_layout.features.${key}`)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex-1 flex items-center justify-center p-8 bg-secondary">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <span
              className="flex items-center justify-center w-9 h-9 rounded-lg bg-accent text-white font-bold text-sm"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              H
            </span>
            <span
              className="text-sidebar text-lg font-bold"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              HireReadyAI
            </span>
          </div>

          <h2
            className="text-sidebar text-3xl font-bold mb-1"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {headline}
          </h2>
          <p className="text-dark-amethyst-400 text-sm mb-8">{subheading}</p>

          {children}
        </div>
      </div>
    </div>
  );
}
