// ─── SecurityViolationModal ──────────────────────────────────────────────────
// Displays a warning dialog when a security violation is detected during the
// interview. The modal is rendered via the existing shadcn/ui Dialog primitive
// so it inherits the project's design tokens and behaviour.
//
// When the violation count reaches `maxViolations` the dialog switches to a
// terminal state – the user cannot dismiss it (no close button, no continue).
//
// Props:
//   open          – boolean, controls visibility
//   onDismiss     – callback to close the modal (not called when max reached)
//   violation     – the current violation object { type, message, timestamp, count }
//   violationCount – current total count
//   maxViolations  – threshold after which the interview is considered terminated

import { AlertTriangle, XCircle } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// Human-readable titles for each violation type.
const VIOLATION_TITLES = {
  shortcut_blocked: "Keyboard Shortcut Blocked",
  tab_switch: "Tab Switch Detected",
  window_blur: "Window Focus Lost",
  fullscreen_exited: "Fullscreen Mode Exited",
  devtools_detected: "Developer Tools Detected",
};

// Human-readable descriptions shown in the modal body.
const VIOLATION_DESCRIPTIONS = {
  shortcut_blocked:
    "Keyboard shortcuts are disabled during the interview.",
  tab_switch:
    "You switched away from the interview window. Please stay on this tab.",
  window_blur:
    "The interview window lost focus. Please keep the window active.",
  fullscreen_exited:
    "Fullscreen mode was exited. Please remain in fullscreen for the interview.",
  devtools_detected:
    "Developer tools appear to be open. Please close them to continue.",
};

/**
 * @param {object}   props
 * @param {boolean}  props.open
 * @param {Function} props.onDismiss
 * @param {object|null} props.violation
 * @param {number}   props.violationCount
 * @param {number}   props.maxViolations
 */
export default function SecurityViolationModal({
  open,
  onDismiss,
  violation,
  violationCount,
  maxViolations,
}) {
  if (!violation) return null;

  const isMaxReached = violationCount >= maxViolations;
  const title =
    VIOLATION_TITLES[violation.type] || "Security Violation";
  const description =
    VIOLATION_DESCRIPTIONS[violation.type] || violation.message;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !isMaxReached) onDismiss();
      }}
    >
      <DialogPrimitive.Portal data-slot="dialog-portal">
        <DialogPrimitive.Overlay
          data-slot="dialog-overlay"
          className="
    fixed inset-0 z-50
    bg-background/70 backdrop-blur-sm
    data-open:animate-in
    data-open:fade-in-0
    data-closed:animate-out
    data-closed:fade-out-0
  "
        />

        <DialogPrimitive.Content
          data-slot="dialog-content"
          className={cn(
            "fixed top-1/2 left-1/2 z-50 w-full max-w-md",
            "-translate-x-1/2 -translate-y-1/2",
            "rounded-2xl border border-border bg-background",
            "shadow-xl p-6 text-foreground",
            "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",
            "data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95"
          )}
        >
          <DialogHeader>
            <div className="flex items-start gap-3">
              {isMaxReached ? (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                  <XCircle className="h-6 w-6 text-destructive" />
                </div>
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <AlertTriangle className="h-6 w-6 text-primary" />
                </div>
              )}

              <div className="space-y-1">
                <DialogTitle className="text-lg">
                  {isMaxReached ? "Interview Terminated" : title}
                </DialogTitle>

                <DialogDescription>
                  {isMaxReached
                    ? "Maximum security violations have been reached."
                    : description}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="mt-4 flex items-center justify-between rounded-xl border border-border bg-muted px-4 py-3">
            <span className="text-xs font-medium text-muted-foreground">
              Violation {violationCount} of {maxViolations}
            </span>

            <span className="text-xs font-mono text-muted-foreground">
              {new Date(violation.timestamp).toLocaleTimeString()}
            </span>
          </div>

          {isMaxReached ? (
            <div className="mt-5 space-y-4 text-center">
              <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted-foreground">
                Your interview has been terminated due to repeated security
                violations. Please contact support if you believe this is an error.
              </p>

              <button
                onClick={onDismiss}
                className="
              inline-flex items-center justify-center
              rounded-xl border border-border
              bg-background px-5 py-2.5
              text-sm font-medium text-foreground
              transition-colors hover:bg-muted
            "
              >
                Go Back
              </button>
            </div>
          ) : (
            <button
              onClick={onDismiss}
              className="
            mt-5 w-full
            rounded-xl bg-primary
            px-4 py-2.5
            text-sm font-medium
            text-primary-foreground
            transition-opacity hover:opacity-90
          "
            >
              Continue Interview
            </button>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </Dialog>
  );
}
