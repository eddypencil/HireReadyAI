import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

export function TextareaField({ value, onChange, placeholder }) {
  return (
    <Field className="space-y-1 font-sans">
      <FieldLabel
        htmlFor="textarea-questions"
        className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider"
      >
        Questions
      </FieldLabel>
      <FieldDescription className="text-[10px] text-muted-foreground/80 italic">
        Enter each question on a new line.
      </FieldDescription>
      <Textarea
        id="textarea-questions"
        placeholder={placeholder || "Question 1\nQuestion 2\nQuestion 3"}
        value={value}
        onChange={onChange}
        className="min-h-[100px] text-xs bg-background border-border/60 focus-visible:ring-ring resize-y py-2 px-3 placeholder:text-muted-foreground/50 leading-relaxed"
      />
    </Field>
  );
}