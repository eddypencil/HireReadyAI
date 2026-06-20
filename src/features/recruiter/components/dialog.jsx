//src\features\recruiter\components\dialog.jsx
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { TextareaField } from "./textArea";
import { useTranslation } from "react-i18next";

export function AddInterviewDialog() {
  const { t } = useTranslation();
  const [applicationID, setApplicationID] = useState("");
  const [jobID, setJobID] = useState("");
  const [reRecordMins, setReRecordMins] = useState(0);
  const [error, setError] = useState("");
  const [questionsText, setQuestionsText] = useState("");
  const [questionsList, setQuestionList] = useState([]);
  const [loading, setLoading] = useState(false);

  async function submitInterview(e) {
    e.preventDefault();
    if (!applicationID || !jobID) {
      setError(t("add_interview.errors.required_ids"));
      return;
    }
    setLoading(true);
    setError("");
    try {
      const array = questionsText
        .split(/\r?\n/)
        .filter((q) => q.trim() !== "")
        .map((q) => q.trim());
      setQuestionList(array);

      // Legacy: Interview creation moved to application stages
      console.warn("AddInterviewDialog is obsolete in new stage-based schema");
    } catch (err) {
      console.log(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="text-xs font-medium cursor-pointer"
        >
          {t("add_interview.buttons.open")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm border-border/60 bg-background p-5 font-sans">
        <form onSubmit={submitInterview} className="space-y-4">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-sm font-bold text-foreground tracking-tight uppercase">
              Send an Interview Invitation
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Send an automated interview to an applicant.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="space-y-3">
            <Field className="space-y-1">
              <Label
                htmlFor="application-id"
                className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider"
              >
                Application ID
              </Label>
              <Input
                id="application-id"
                name="application-id"
                value={applicationID}
                onChange={(e) => setApplicationID(e.target.value)}
                className="h-8 text-xs bg-background border-border/60 focus-visible:ring-ring"
                placeholder="e.g. app_123"
              />
            </Field>

            <Field className="space-y-1">
              <Label
                htmlFor="job-id"
                className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider"
              >
                Job ID
              </Label>
              <Input
                id="job-id"
                name="job-id"
                value={jobID}
                onChange={(e) => setJobID(e.target.value)}
                className="h-8 text-xs bg-background border-border/60 focus-visible:ring-ring"
                placeholder="e.g. job_456"
              />
            </Field>

            <Field className="space-y-1">
              <Label
                htmlFor="rerecord-input"
                className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider"
              >
                Re-record available after (mins)
              </Label>
              <Input
                id="rerecord-input"
                name="rerecord-input"
                type="number"
                className="h-8 text-xs bg-background border-border/60 focus-visible:ring-ring no-spinner"
                placeholder="0 for instant"
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (value < 0) {
                    setError("Re-record minutes must be 0 or more");
                  } else {
                    setError("");
                    setReRecordMins(value);
                  }
                }}
              />
            </Field>

            <Field className="space-y-1">
              <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Interview Questions
              </Label>
              <TextareaField
                value={questionsText}
                onChange={(e) => setQuestionsText(e.target.value)}
                placeholder="Enter each question on a new line..."
              />
            </Field>
          </FieldGroup>

          {error && (
            <p className="text-[11px] font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-2.5 py-1.5 transition-all">
              {error}
            </p>
          )}

          <DialogFooter className="gap-2 pt-2 border-t border-border/40 mt-2 sm:justify-end">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className="h-8 text-xs font-medium cursor-pointer"
              >
                {t("avatar_modal.cancel")}
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={loading || !!error}
              className="h-8 text-xs font-medium cursor-pointer"
            >
              {loading
                ? t("add_interview.buttons.sending")
                : t("add_interview.buttons.send")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
