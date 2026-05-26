export const USER_ROLE = Object.freeze({
  applicant: "applicant",
  recruiter: "recruiter",
  hrManager: "hr_manager",
});

// intern, junior, mid, senior, lead
export const SENIORITY_LEVEL = Object.freeze({
  intern: 'intern', 
  junior: 'junior', 
  mid: 'mid', 
  senior: 'senior', 
  lead: 'lead'
})

export const APPLICATION_STAGE = Object.freeze({
  applied: 'applied',
  screening: 'screening',
  shortlisted: 'shortlisted',
  interview: 'interview',
  hired: 'hired',
  rejected: 'rejected',
})