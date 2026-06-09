//src\features\landing\LandingLayout.jsx
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function LandingLayout({ children }) {
  const { i18n } = useTranslation();

  useEffect(() => {
    const isArabic = i18n.language === "ar";
    document.documentElement.dir = isArabic ? "rtl" : "ltr";
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {children}
    </div>
  );
}
