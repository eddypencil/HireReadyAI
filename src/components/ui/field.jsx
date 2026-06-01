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

function FieldLabel({ className, ...props }) {
  return (
    <label
      data-slot="field-label"
      className={cn("text-sm font-medium", className)}
      {...props}
    />
  );
}

function FieldDescription({ className, ...props }) {
  return (
    <p
      data-slot="field-description"
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}

function FieldMessage({ className, ...props }) {
  return (
    <p
      data-slot="field-message"
      className={cn("text-xs text-destructive", className)}
      {...props}
    />
  );
}

export { Field, FieldGroup, FieldLabel, FieldDescription, FieldMessage }
