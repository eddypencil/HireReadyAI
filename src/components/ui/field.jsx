import * as React from "react"

import { cn } from "@/lib/utils"

function Field({ className, ...props }) {
  return (
    <div
      data-slot="field"
      className={cn("flex flex-col gap-1.5", className)}
      {...props}
    />
  );
}

function FieldGroup({ className, ...props }) {
  return (
    <div
      data-slot="field-group"
      className={cn("flex flex-col gap-4", className)}
      {...props}
    />
  );
}

export { Field, FieldGroup }
