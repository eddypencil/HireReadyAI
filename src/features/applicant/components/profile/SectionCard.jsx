export default function SectionCard({ icon: Icon, title, children, className = "" }) {
  return (
    <div className={`bg-background rounded-xl border border-border/60 p-5 shadow-xs ${className}`}>
      <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-primary/60" />}
        {title}
      </h2>
      {children}
    </div>
  );
}
