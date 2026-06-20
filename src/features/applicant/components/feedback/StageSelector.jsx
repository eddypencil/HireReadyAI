import { Brain, MessageSquare, Monitor, Code, Video } from "lucide-react";
import { useTranslation } from "react-i18next";
const STAGE_ICONS = {
  hr_interview: MessageSquare,
  technical_interview: Monitor,
  assessment: Brain,
  assessment_test: Brain,
  coding_test: Code,
  video_interview: Video,
  manager_interview: MessageSquare,
  ai_screening: Brain,
};

export default function StageSelector({ stages, activeStage, onSelect }) {
  if (stages.length <= 1) return null;
  const { t } = useTranslation();
  return (
    <div className="border-b border-border">
      <div className="flex -mb-px overflow-x-auto">
        {stages.map((stage) => {
          const Icon =
            STAGE_ICONS[stage.recruitment_stages?.stage_type] || Brain;
          const isActive = activeStage?.id === stage.id;

          return (
            <button
              key={stage.id}
              onClick={() => onSelect(stage)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? "border-accent text-accent"
                  : "border-transparent text-muted-foreground/60 dark:text-muted-foreground/80 hover:text-foreground dark:hover:text-foreground hover:border-border dark:hover:border-border/60"
              }`}
            >
              <Icon className="w-4 h-4" />
              {stage.recruitment_stages?.name ||
                t("company_profile.team.unknown")}
            </button>
          );
        })}
      </div>
    </div>
  );
}
