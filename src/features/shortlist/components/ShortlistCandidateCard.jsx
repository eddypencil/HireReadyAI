//src\features\shortlist\components\ShortlistCandidateCard.jsx
import { motion } from "framer-motion";
import { ThumbsUp, ThumbsDown, Sparkles, Calendar, Send } from "lucide-react";
import { useTranslation } from "react-i18next";
const TAG_COLORS = {
  "Strong Fit": "bg-success/10 text-success border-success/20",
  "Leaning hire": "bg-accent/10 text-accent border-accent/20",
  "Needs Review": "bg-warning/10 text-warning border-warning/20",
};

function getInitials(name = "") {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getAvatarColor(name = "") {
  const colors = [
    "bg-zinc-500",

    "bg-emerald-600",
    "bg-sky-600",
    "bg-amber-600",
    "bg-rose-500",
    "bg-indigo-600",
    "bg-teal-600",
    "bg-fuchsia-600",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function timeAgo(dateString) {
  if (!dateString) return "";
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  if (weeks > 0) return `${weeks}w ago`;
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return "Just now";
}

export default function ShortlistCandidateCard({ entry, isSelected, onClick, index = 0 }) {
  const { applications: app, tags = [], rank } = entry;
  const {
    profiles: candidate,
    shortlist_votes: votes = [],
    composite_score,
    ai_rationale,
    applied_at,
    is_rejected,
    application_stages = [],
  } = app;

  const hasOffer = application_stages.some(
    (s) =>
      s.recruitment_stages?.stage_type === "offer" &&
      s.status === "in_progress",
  );
  const { t } = useTranslation();

  const upVotes = votes.filter((v) => v.vote === "up").length;
  const downVotes = votes.filter((v) => v.vote === "down").length;

  const voterAvatars = votes.slice(0, 4);
  const remainingVoters = Math.max(0, votes.length - 4);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      onClick={onClick}
      className={`relative px-5 py-4 cursor-pointer border-b border-border transition-all group ${
        isSelected
          ? "bg-success/5 border-l-2 border-l-success"
          : "bg-background hover:bg-muted border-l-2 border-l-transparent"
      } ${is_rejected ? "opacity-80" : ""}`}
    >
      {/* Rank + Avatar + Name row */}
      <div className="flex items-start gap-3 mb-2.5">
        <span className="text-[10px] font-bold text-muted-foreground/60 pt-1 w-5 shrink-0">
          #{rank}
        </span>

        <div
          className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold ${getAvatarColor(candidate?.full_name)}`}
        >
          {getInitials(candidate?.full_name)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-sm font-semibold ${isSelected ? "text-muted-foreground" : "text-foreground"}`}
            >
              {candidate?.full_name || t("company_profile.team.unknown")}
            </span>
            {hasOffer && (
              <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 bg-blue-50 text-deep-space-blue border border-deep-space-blue/30 rounded-full font-semibold">
                <Send className="w-2.5 h-2.5" />
                Offer
              </span>
            )}
            {is_rejected && (
              <span className="text-[10px] px-1.5 py-0.5 bg-destructive/10 text-red-600 border border-destructive/20 rounded font-medium">
                {t("stages.rejected")}
              </span>
            )}
            {tags.map((tag) => (
              <span
                key={tag}
                className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${TAG_COLORS[tag] || "bg-zinc-100 text-zinc-600 border-zinc-200"}`}
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
            <Calendar className="w-3 h-3" />
            <span>Applied {timeAgo(applied_at)}</span>
            {app.answers?.info?.email && (
              <span className="text-muted-foreground">
                · {app.answers.info.email}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* AI Rationale snippet */}
      {ai_rationale && (
        <div className="flex items-start gap-2 ml-8 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {ai_rationale}
          </p>
        </div>
      )}

      {/* Footer: voters + score + votes */}
      <div className="flex items-center justify-between ml-8">
        <div className="flex items-center gap-1">
          {voterAvatars.map((v, i) => (
            <div
              key={v.id || i}
              title={v.profiles?.full_name}
              className={`w-6 h-6 rounded-full border-2 border-white text-[9px] font-bold flex items-center justify-center text-white -ml-1.5 first:ml-0 ${getAvatarColor(v.profiles?.full_name)}`}
            >
              {getInitials(v.profiles?.full_name)}
            </div>
          ))}
          {remainingVoters > 0 && (
            <div className="w-6 h-6 rounded-full border-2 border-background bg-muted text-[9px] font-bold flex items-center justify-center text-muted-foreground -ml-1.5">
              +{remainingVoters}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">
            AI match{" "}
            <span
              className={`font-bold px-1.5 py-0.5 rounded ${
                composite_score >= 80
                  ? "bg-success/10 text-success"
                  : composite_score >= 65
                    ? "bg-warning/10 text-warning"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {composite_score || "—"}
            </span>
          </span>
          <div className="flex items-center gap-1.5">
            <span className="flex items-center gap-0.5 text-success">
              <ThumbsUp className="w-3 h-3" /> {upVotes}
            </span>
            <span className="text-border">—</span>
            <span className="flex items-center gap-0.5 text-destructive">
              <ThumbsDown className="w-3 h-3" /> {downVotes}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
