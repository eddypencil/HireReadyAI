import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/shared/context/theme";
import { Menu, X, Sun, Moon } from "lucide-react";

export default function Navbar({ links = [] }) {
  const { t, i18n } = useTranslation();
  const { darkMode, toggle: toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isRTL = i18n.language === "ar";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const handleNavClick = useCallback(
    (href) => {
      setDrawerOpen(false);
      const id = href.replace("#", "");
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    },
    []
  );

  const changeLang = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);
  };

  return (
    <>
      <div className="h-20" />

      <nav
        className={`fixed top-0 left-1/2 -translate-x-1/2 z-50 w-full transition-all duration-300 ${scrolled ? "pt-2" : "pt-4"
          }`}
      >
        <div
          className={`mx-auto flex items-center justify-between transition-all duration-300 ${scrolled ? "w-[92%] max-w-5xl px-5 py-2.5" : "w-[90%] max-w-5xl px-6 py-3.5"
            } rounded-full bg-white/80 dark:bg-[#0b2336]/80 backdrop-blur-xl border border-border/50 dark:border-white/10 shadow-lg shadow-black/5`}
        >
          <LinkLogo />

          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              aria-label={darkMode ? t("light_mode") : t("dark_mode")}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className="hidden md:flex items-center gap-1 text-xs font-medium">
              <button
                onClick={() => changeLang("en")}
                className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${i18n.language === "en"
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
              >
                EN
              </button>
              <button
                onClick={() => changeLang("ar")}
                className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${i18n.language === "ar"
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
              >
                AR
              </button>
            </div>

            <button
              onClick={() => navigate("/auth/sign-up")}
              className="hidden md:inline-flex px-5 py-2 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors cursor-pointer"
            >
              {t("landing.nav.get_started")}
            </button>

            <button
              onClick={() => setDrawerOpen(true)}
              className="md:hidden p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </nav>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />

          <div
            className={`absolute top-0 bottom-0 w-72 bg-background dark:bg-[#0b2336] border-l border-border shadow-2xl flex flex-col ${isRTL ? "left-0 border-r" : "right-0 border-l"
              }`}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <span className="text-lg font-bold text-foreground">
                HireReadyAI
              </span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
              {links.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className="w-full text-left px-4 py-3 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  {link.label}
                </button>
              ))}
            </div>

            <div className="px-4 py-6 border-t border-border space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {darkMode ? t("light_mode") : t("dark_mode")}
                </span>
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Language</span>
                <div className="flex items-center gap-1 text-xs font-medium">
                  <button
                    onClick={() => changeLang("en")}
                    className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${i18n.language === "en"
                      ? "bg-primary text-white"
                      : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => changeLang("ar")}
                    className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${i18n.language === "ar"
                      ? "bg-primary text-white"
                      : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    AR
                  </button>
                </div>
              </div>

              <button
                onClick={() => {
                  setDrawerOpen(false);
                  navigate("/auth/sign-up");
                }}
                className="w-full py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors cursor-pointer"
              >
                {t("landing.nav.get_started")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function LinkLogo() {
  return (
    <a href="#" className="flex items-center gap-2">
      <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-white font-bold text-sm">
        H
      </span>
      <span className="text-foreground text-lg font-bold tracking-tight hidden sm:inline">
        HireReadyAI
      </span>
    </a>
  );
}
