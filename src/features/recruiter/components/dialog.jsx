import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { createInterview } from "@/features/interview/services/interview_database_service"
import InterviewModel from "@/features/interview/models/interview.model"
import { INTERVIEW_STATUS } from "@/shared/constants/enums"

export function AddInterviewDialog() {
    const [applicationID, setApplicationID] = useState("");
    const [jobID, setJobID] = useState("");
    const [reRecordMins, setReRecordMins] = useState(0);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function submitInterview(e) {
      e.preventDefault();
      if (!applicationID || !jobID) {
        setError("Application ID and Job ID are required");
        return;
      }
      setLoading(true);
      setError("");
      try {
        const interview = new InterviewModel(
        applicationID,
          jobID,
          INTERVIEW_STATUS.scheduled,
          new Date().toISOString(),
          reRecordMins
        );
        await createInterview(interview.toSupabaseForm());
      } catch (err) {
        console.log(err)
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open Dialog</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={submitInterview}>
          <DialogHeader>
            <DialogTitle>SEND AN INTERVIEW INVITATION</DialogTitle>
            <DialogDescription>
              send an interview to an applicant
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <Label htmlFor="applicant-id">applicant id</Label>
              <Input id="applicant-id" name="applicant-id" onChange={(e)=>{setApplicationID(e.target.value)}}/>
            </Field>
            <Field>
              <Label htmlFor="job-id">job id</Label>
              <Input id="job-id" name="job-id" onChange={(e) => setJobID(e.target.value)} />
            </Field>
            <Field>
              <Label htmlFor="rerecord-input">rerecord availible after </Label>
              <Input id="rerecord-input" name="rerecord-input" type="number" className="no-spinner" onChange={(e) => {
                    const value = Number(e.target.value);
                    if(value < 0){
                        setError("Rerecord minutes has to be more than 0")
                    }else{
                        setError("")
                        setReRecordMins(value)
                    }
              }}/>
              {error&&<p className="italic text-red-400 text-sm">{error}</p>}
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>{loading ? "Sending..." : "Send interview"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
