//src\features\auth\components\AuthLayout.jsx
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/shared/ui/LanguageSwitcher";
import {
  Video,
  BarChart3,
  MessageSquare,
  Wand2,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "@/shared/context/theme";
export default function AuthLayout({ children, headline, subheading }) {
  const { t } = useTranslation();

  const features = [
    {
      icon: Wand2,
      text: t("auth_layout.features.ai_matching"),
    },
    {
      icon: Video,
      text: t("auth_layout.features.async_interviews"),
    },
    {
      icon: BarChart3,
      text: t("auth_layout.features.bias_feedback"),
    },
    {
      icon: MessageSquare,
      text: t("auth_layout.features.real_replies"),
    },
  ];
  const { darkMode, toggle: toggleTheme } = useTheme();
  return (
    <div className="min-h-screen flex justify-center items-center bg-background">
      {/* LEFT SIDE */}
      <div className="hidden lg:flex lg:flex-col fixed top-0 left-0 h-screen w-[45%] xl:w-[40%] bg-sidebar p-12   overflow-hidden  border-r border-white/5">
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
          <div className="ml-auto flex flex-row items-center gap-5">

              <LanguageSwitcher />

            <button
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 text-sm font-medium text-white/80 hover:text-white transition-colors py-2 cursor-pointer"
            >
              {darkMode ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
              {darkMode ? t("light_mode") : t("dark_mode")}
            </button>
          </div>
        </div>

        {/* CONTENT */}

        <div className="relative z-10 flex flex-col gap-6 my-auto">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <h1
              className="text-white font-black leading-[1.1] mb-4"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "clamp(2rem, 3.2vw, 2.75rem)",
              }}
            >
              {t("auth_layout.headline")}
            </h1>

            <p className="text-white/70 text-sm leading-relaxed max-w-xs mt-3 mb-4">
              {t("auth_layout.subheading")}
            </p>
          </motion.div>

          <div className="grid gap-2 mt-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.7,
                    delay: 0.15 + index * 0.12,
                    ease: "easeOut",
                  }}
                  className="
          group
          flex items-center gap-4
          rounded-2xl
          border border-white/10
          bg-white/5
          backdrop-blur-sm
          px-4 py-4
          transition-all duration-300
          hover:bg-white/10
          hover:border-accent/40
          hover:-translate-y-0.5
        "
                >
                  <div
                    className="
            flex items-center justify-center
            w-11 h-11
            rounded-xl
            bg-accent/15
            border border-accent/20
            shrink-0
          "
                  >
                    <Icon size={20} className="text-white/70" />
                  </div>

                  <span
                    className="
            text-white/90
            text-sm
            leading-snug
            font-medium
          "
                  >
                    {feature.text}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex-1 flex items-start justify-center p-8 lg:ml-[45%] xl:ml-[40%]">        <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-10 lg:hidden">
          <span
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-accent text-white font-bold text-sm"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            H
          </span>
          <span
            className="text-foreground text-lg font-bold"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            HireReadyAI
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <h2
            className="text-foreground text-3xl font-bold mb-1"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {headline}
          </h2>
          <p className="text-muted-foreground text-sm mb-8">{subheading}</p>

          {children}
        </motion.div>
      </div>
      </div>
    </div>
  );
}
