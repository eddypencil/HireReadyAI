import { Search, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
export default function Navbar({ searchQuery, setSearchQuery, onAddJobClick }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between bg-background border-b border-border px-4 sm:px-8 py-4 font-sans gap-4">
      <div className="relative w-full md:w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 w-4 h-4" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t("nav.search_jobs")}
          className="w-full pl-10 pr-4 py-2 bg-secondary/50 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-accent focus:bg-background transition-all placeholder:text-muted-foreground/50"
        />
      </div>

      <div className="flex items-center justify-end w-full md:w-auto shrink-0">
        <button
          onClick={onAddJobClick}
          className="flex items-center justify-center gap-2 bg-primary text-white px-5 py-2.5 md:py-2 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors cursor-pointer w-full md:w-auto shadow-xs"
        >
          <Plus className="w-4 h-4" />
          {t("nav.add_job")}
        </button>
      </div>
    </div>
  );
}
