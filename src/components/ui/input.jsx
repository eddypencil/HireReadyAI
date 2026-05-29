import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, ...props }) {
  return (
    <input
      data-slot="input"
      className={cn(
        "h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm text-foreground transition-shadow outline-none placeholder:text-muted-foreground/70 read-only:bg-muted read-only:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 disabled:pointer-events-none disabled:opacity-50 aria-[focused=false]:aria-invalid:border-destructive aria-[focused=false]:aria-invalid:ring-3 aria-[focused=false]:aria-invalid:ring-destructive/20 dark:aria-[focused=false]:aria-invalid:border-destructive/50 dark:aria-[focused=false]:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  );
}

export { Input }
