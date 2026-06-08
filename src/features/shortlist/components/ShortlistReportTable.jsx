// src\features\shortlist\components\ShortlistReportTable.jsx
import { ThumbsUp, ThumbsDown, Minus } from "lucide-react";
import { useTranslation } from "react-i18next";
export default function ShortlistReportTable({
  entries,
  selectedIds,
  onToggleSelect,
}) {
  const { t } = useTranslation();

  if (!entries || entries.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {" "}
        {t("shortlist.noCandidates")}
      </div>
    );
  }

  const getInitials = (name) => {
    if (!name) return "NA";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const calculateVotes = (votes) => {
    let up = 0,
      neutral = 0,
      down = 0;

    votes?.forEach((v) => {
      if (v.vote === "up") up++;
      else if (v.vote === "neutral") neutral++;
      else if (v.vote === "down") down++;
    });

    return { up, neutral, down };
  };

  // Progress bar (style only)
  const ProgressBar = ({ score, colorClass = "bg-dark-amethyst-500" }) => (
    <div className="flex items-center gap-3">
      <div className="h-1.5 w-16 bg-gray-100 rounded-full overflow-hidden shrink-0">
        <div
          className={`h-full ${colorClass} rounded-full`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-sm font-medium text-gray-700 w-6">{score}</span>
    </div>
  );

  // Circular progress (style only)
  const CircularProgress = ({ score }) => {
    const radius = 20;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    const colorClass =
      score >= 90
        ? "text-dark-amethyst-600"
        : score >= 80
          ? "text-dark-amethyst-500"
          : "text-amber-500";

    return (
      <div className="relative flex items-center justify-center w-12 h-12">
        <svg className="transform -rotate-90 w-12 h-12">
          <circle
            cx="24"
            cy="24"
            r={radius}
            stroke="currentColor"
            strokeWidth="3"
            fill="transparent"
            className="text-gray-100"
          />
          <circle
            cx="24"
            cy="24"
            r={radius}
            stroke="currentColor"
            strokeWidth="3"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`${colorClass} transition-all duration-1000 ease-out`}
          />
        </svg>
        <span className="absolute text-sm font-bold text-gray-900">
          {score}
        </span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto font-sans mb-8">
      <table className="w-full text-left border-collapse min-w-[1000px]">
        <thead>
          <tr className="bg-gray-50 text-xs font-semibold text-gray-500 tracking-wider">
            <th className="px-6 py-4 text-center">{t("shortlist.rank")}</th>
            <th className="px-6 py-4">{t("shortlist.candidate")}</th>
            <th className="px-6 py-4 text-center">{t("shortlist.cv")}</th>
            <th className="px-6 py-4 text-center">{t("shortlist.tests")}</th>
            <th className="px-6 py-4 text-center">
              {t("shortlist.interview")}
            </th>
            <th className="px-6 py-4 text-center">
              {t("shortlist.composite")}
            </th>
            <th className="px-6 py-4 text-center">{t("shortlist.teamVote")}</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {entries.map((entry) => {
            const app = entry.applications;
            const profile = app.profiles;
            const isSelected = selectedIds.includes(app.id);
            const votes = calculateVotes(app.shortlist_votes);

            return (
              <tr
                key={entry.id}
                onClick={() => onToggleSelect(app.id)}
                className={`cursor-pointer transition-colors duration-200 ${
                  isSelected
                    ? "bg-dark-amethyst-50"
                    : "hover:bg-dark-amethyst-50/30"
                }`}
              >
                {/* Rank */}
                <td className="px-6 py-4 text-center">
                  <div className="w-8 h-8 mx-auto bg-dark-amethyst-900 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm">
                    {entry.rank}
                  </div>
                </td>

                {/* Candidate */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-dark-amethyst-100 text-dark-amethyst-700 flex items-center justify-center text-sm font-bold shrink-0">
                      {getInitials(profile?.full_name)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {profile?.full_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {profile?.headline}
                      </p>
                    </div>
                  </div>
                </td>

                {/* CV */}
                <td className="px-6 py-4">
                  <div className="flex justify-center">
                    <ProgressBar
                      score={app.cv_score}
                      colorClass="bg-dark-amethyst-500"
                    />
                  </div>
                </td>

                {/* TESTS */}
                <td className="px-6 py-4">
                  <div className="flex justify-center">
                    <ProgressBar
                      score={app.test_score}
                      colorClass="bg-dark-amethyst-500"
                    />
                  </div>
                </td>

                {/* INTERVIEW */}
                <td className="px-6 py-4">
                  <div className="flex justify-center">
                    <ProgressBar
                      score={app.interview_score}
                      colorClass="bg-dark-amethyst-500"
                    />
                  </div>
                </td>

                {/* COMPOSITE */}
                <td className="px-6 py-4">
                  <div className="flex justify-center">
                    <CircularProgress score={app.composite_score} />
                  </div>
                </td>

                {/* TEAM VOTE */}
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-3">
                    {/* Up */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className="flex items-center gap-1.5 text-dark-amethyst-600 bg-dark-amethyst-50 hover:bg-dark-amethyst-100 px-2 py-1 rounded-md text-xs font-medium transition-colors"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      {votes.up}
                    </button>

                    {/* Neutral */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className="flex items-center gap-1.5 text-gray-500 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-md text-xs font-medium transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                      {votes.neutral}
                    </button>
                    {/* Downvotes */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); /* handle down vote */
                      }}
                      className="flex items-center gap-1.5 text-red-500 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer"
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                      {votes.down}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
