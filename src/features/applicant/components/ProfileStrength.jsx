import { useMemo } from "react";
import { useUser } from "@/features/auth/context/user.context";
import { useApplications } from "@/features/applications/context/application.context";

export default function ProfileStrength() {
  const { profile } = useUser();
  const { applications } = useApplications();

  const strength = useMemo(() => {
    let score = 40;

    if (profile?.cv_url) score += 20;
    if (profile?.skills?.length >= 5) score += 15;
    if (applications?.length > 0) score += 15;
    if (profile?.experience) score += 10;

    return Math.min(score, 100);
  }, [profile, applications]);

  const checklist = [
    {
      label: "CV uploaded",
      done: !!profile?.cv_url,
    },
    {
      label: "Work experience",
      done: !!profile?.experience,
    },
    {
      label: "Add portfolio links",
      done: !!profile?.portfolio,
    },
    {
      label: "Add 5+ skills",
      done: (profile?.skills?.length || 0) >= 5,
    },
  ];

  const remaining = checklist.filter((i) => !i.done).length;

  return (
    <div className="bg-background rounded-2xl border border-border p-7 shadow-xs space-y-5">
      <div className="flex justify-between items-start">
        <h2 className="text-base font-bold text-sidebar">
          Profile strength
        </h2>

        <span className="text-2xl font-bold text-accent">
          {strength}%
        </span>
      </div>

      <p className="text-sm text-muted-foreground -mt-2">
        Complete profile = better matches
      </p>

      <div className="w-full bg-secondary rounded-full h-2.5">
        <div
          className="bg-accent h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${strength}%` }}
        />
      </div>

      <div className="space-y-2 text-sm font-medium">
        {checklist.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className={`text-xs ${item.done ? "text-green-500" : "text-muted-foreground/40"}`}>
              {item.done ? "✓" : "○"}
            </span>
            <p className={item.done ? "text-sidebar" : "text-muted-foreground"}>
              {item.label}
            </p>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground/60">
        {remaining} things left to complete profile
      </p>
    </div>
  );
}