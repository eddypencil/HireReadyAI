//       company_id: "company-uuid",
//       created_by_profile_id: "profile-uuid",
//       title: "Frontend Developer",
//       seniority_level: "mid",
//       description: "React developer needed",

// create table public.job_postings (
//   id uuid not null default gen_random_uuid (),
//   company_id uuid not null,
//   created_by_profile_id uuid null,
//   title text not null,
//   seniority_level public.seniority_level null,
//   description text not null,
//   created_at timestamp with time zone not null default now(),
//   closed_at timestamp with time zone not null default (now() + '14 days'::interval),
//   constraint job_postings_pkey primary key (id),
//   constraint job_postings_company_id_fkey foreign KEY (company_id) references companies (id),
//   constraint job_postings_created_by_profile_id_fkey foreign KEY (created_by_profile_id) references profiles (id)
// ) TABLESPACE pg_default;

class JobPosting {
    constructor(companyId = "8c60f346-38e9-47ea-a29a-052625690240", profileId, title, seniorityLevel, description) {
        this.companyId = companyId,
            this.profileId = profileId,
            this.title = title,
            this.seniorityLevel = seniorityLevel,
            this.description = description
    }
    toSupaBaseForm() {
        return {
            company_id: this.companyId,
            created_by_profile_id: this.profileId,
            title: this.title,
            seniority_level: this.seniorityLevel,
            description: this.description
        }
    }
}