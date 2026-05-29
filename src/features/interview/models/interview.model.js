class Interview {
  constructor(applicationId, jobId, status, reRecordWindowMinutes) {
    this.applicationId = applicationId;
    this.jobId = jobId;
    this.status = status;
    this.reRecordWindowMinutes = reRecordWindowMinutes;
  }

  toSupabaseForm() {
    return {
      application_id: this.applicationId,
      job_id: this.jobId,
      status: this.status,
      re_record_window_minutes: this.reRecordWindowMinutes,
    };
  }
}

export default Interview;
