import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  const currentLang = i18n.language;

  const changeLang = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);
    setOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs font-medium">
          <button
            onClick={() => changeLang("en")}
            className={`px-2 py-1 text-[11px] rounded-md transition-colors cursor-pointer ${
              i18n.language === "en"
                ? "bg-primary text-white"
                : "text-muted-foreground hover:text-accent"
            }`}
          >
            EN
          </button>
          <button
            onClick={() => changeLang("ar")}
            className={`px-2 py-1 text-[11px] rounded-md transition-colors cursor-pointer ${
              i18n.language === "ar"
                ? "bg-primary text-white"
                : "text-muted-foreground hover:text-accent"
            }`}
          >
            AR
          </button>
        </div>
      </div>
    </div>
  );
}
