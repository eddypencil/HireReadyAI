//src\features\jobs\components\JobSearch.jsx
import { useTranslation } from "react-i18next";

export default function JobSearch({ search, setSearch }) {
  const { t } = useTranslation();

  return (
    <div className="bg-background rounded-2xl border border-border shadow-sm p-4 flex items-center gap-3">
      <div className="flex items-center gap-2 flex-1">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          className="text-muted-foreground shrink-0"
        >
          <circle
            cx="11"
            cy="11"
            r="8"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M21 21l-4.35-4.35"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("job_search.placeholder")}
          className="w-full text-sm text-foreground placeholder:text-muted-foreground/60 outline-none bg-transparent"
        />
      </div>

      <button className="px-5 py-2.5 rounded-xl bg-primary !text-white text-sm font-semibold hover:bg-primary/90 transition shrink-0 shadow-sm cursor-pointer">
        {t("job_search.button")}
      </button>
    </div>
  );
}
