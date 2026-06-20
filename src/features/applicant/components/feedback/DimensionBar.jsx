import { motion } from "framer-motion";

export default function DimensionBar({ label, score }) {
  const barColor =
    score >= 80
      ? "bg-success"
      : score >= 60
        ? "bg-accent"
        : score >= 40
          ? "bg-amber-500"
          : "bg-destructive";

  return (
    <motion.div
      className="flex items-center gap-3"
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: false, margin: "-30px" }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <span className="text-sm font-medium text-muted-foreground w-36 shrink-0 capitalize">
        {label}
      </span>
      <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${barColor}`}
          initial={{ width: 0 }}
          whileInView={{ width: `${score}%` }}
          viewport={{ once: false, margin: "-30px" }}
          transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
        />
      </div>
      <span className="text-sm font-bold text-foreground w-8 text-right">
        {score}
      </span>
    </motion.div>
  );
}
