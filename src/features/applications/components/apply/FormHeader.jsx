import { Check } from "lucide-react";

export default function FormHeader({ title, steps, currentStep, progress }) {
  return (
    <div className="p-5 border-b border-border bg-card">
      <h1 className="text-xl font-bold text-foreground">{title}</h1>

      <div className="mt-5 flex justify-center">
        <div className="flex">
          {steps.map((s, i) => {
            const isCompleted = i < currentStep;
            const isCurrent = i === currentStep;

            return (
              <div key={i} className="flex items-center justify-center">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`size-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 shrink-0 ${
                      isCompleted
                        ? "bg-accent text-white"
                        : isCurrent
                          ? "bg-accent text-white ring-4 ring-accent/20"
                          : "bg-secondary text-muted-foreground/50"
                    }`}
                  >
                    {isCompleted ? <Check size={14} /> : i + 1}
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors duration-200 ${
                      isCurrent || isCompleted
                        ? "text-accent"
                        : "text-muted-foreground/40"
                    }`}
                  >
                    {s}
                  </span>
                </div>

                {i < steps.length - 1 && (
                  <div
                    className={`w-20 h-0.5 rounded-full mx-4 transition-colors duration-300 ${
                      i < currentStep ? "bg-accent" : "bg-secondary"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
