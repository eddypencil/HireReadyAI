import { APPLICATION_STAGE } from "@/shared/constants/enums";

export default function StatsCards({ applications }) {
  const stats = [
    { label: "Applications", value: applications?.length || 0 },
    { label: "Interviews", value: applications?.filter((a) => a.current_stage === APPLICATION_STAGE.interview).length || 0 },
    { label: "Offers", value: applications?.filter((a) => a.current_stage === APPLICATION_STAGE.hired).length || 0 },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-background border border-border rounded-xl p-4 shadow-xs hover:border-accent/30 transition-all duration-200"
        >
          <p className="text-sm text-muted-foreground font-medium">{s.label}</p>
          <h2 className="text-2xl font-bold text-sidebar mt-1">{s.value}</h2>
        </div>
      ))}
    </div>
  );
}