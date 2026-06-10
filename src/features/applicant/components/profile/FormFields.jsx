export const DEGREE_LEVELS = [
  "High School", "Associate's", "Bachelor's", "Master's",
  "Doctorate (PhD)", "MBA", "JD (Law)", "MD (Medicine)",
  "Professional Certificate", "Diploma", "Other",
];

export const SKILL_LABELS = ["", "Beginner", "Elementary", "Intermediate", "Advanced", "Expert"];
export const LANG_LABELS = ["", "Beginner", "Elementary", "Intermediate", "Advanced", "Native Speaker"];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function formatDateRange(from, to) {
  const parts = [];
  if (from) {
    const [y, m] = from.split("-");
    parts.push(`${MONTHS[parseInt(m) - 1] || ""} ${y}`);
  }
  parts.push(to && to !== "present" ? (() => {
    const [y, m] = to.split("-");
    return `${MONTHS[parseInt(m) - 1] || ""} ${y}`;
  })() : "Present");
  return parts.join(" – ");
}

export function getInitials(name = "") {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?";
}

export function InputField({ label, value, onChange, multiline = false, placeholder = "", type = "text" }) {
  return (
    <div>
      {label && <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>}
      {multiline ? (
        <textarea
          className="w-full text-sm bg-background border border-border/70 rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all min-h-[80px] resize-y"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          className="w-full text-sm bg-background border border-border/70 rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}

export function EmptyState({ message }) {
  return <p className="text-sm text-muted-foreground/60 italic">{message}</p>;
}
