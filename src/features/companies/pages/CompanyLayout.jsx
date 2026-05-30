import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useUser } from "@/features/auth/context/user.context";
import Navbar from "@/shared/ui/Navbar";
import JobPostings from "./JobPostings";
import CompanyProfile from "./CompanyProfile";
import AddJobModal from "./AddJobModal";
import NoCompanyView from "./NoCompanyView";
import {
  fetchCompanyByProfileId,
  fetchJobsByCompanyId,
  fetchCompanyMembers,
} from "../services/companies.service";
import { createJob } from "@/features/jobs/services/jobs.service";
import { addMembership } from "../services/memberships.service";

function CompanyLayout() {
  const { loading, profile } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [members, setMembers] = useState([]);
  const [company, setCompany] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [frameworkFile, setFrameworkFile] = useState(
    "engineering-framework-v3.pdf",
  );
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!profile?.id) return;

      try {
        setDataLoading(true);
        setError(null);

        const companyData = await fetchCompanyByProfileId(profile.id);
        if (!companyData) {
          setCompany(null);
          setDataLoading(false);
          return;
        }

        setCompany(companyData);

        const [jobsData, membersData] = await Promise.all([
          fetchJobsByCompanyId(companyData.id),
          fetchCompanyMembers(companyData.id),
        ]);

        setJobs(jobsData);
        setMembers(membersData);
      } catch (err) {
        console.error("Error fetching company data:", err);
        setError(err.message);
      } finally {
        setDataLoading(false);
      }
    };

    fetchCompanyData();
  }, [profile?.id]);

  const handleAddJob = async (newJob) => {
    try {
      if (!company?.id) return;

      const jobData = {
        company_id: company.id,
        created_by_profile_id: profile?.id,
        title: newJob.title,
        description: newJob.description || "",
        seniority_level: newJob.seniorityLevel || null,
        job_type: newJob.jobType || null,
      };

      const createdJob = await createJob(jobData);
      setJobs([createdJob, ...jobs]);
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error adding job:", err);
      setError(err.message);
    }
  };

  const handleInviteMember = async () => {
    try {
      if (!company?.id) return;

      const membershipData = {
        company_id: company.id,
        profile_id: profile?.id,
        permissions: { role: "recruiter" },
      };

      const newMembership = await addMembership(membershipData);
      setMembers([...members, newMembership]);
    } catch (err) {
      console.error("Error adding member:", err);
      setError(err.message);
    }
  };

  if (loading || dataLoading)
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-slate-900 font-sans">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-2 text-slate-500 text-sm">Loading...</p>
      </div>
    );

  if (error) {
    return (
      <div className="p-8 text-red-500 font-sans">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!company && !dataLoading) {
    return (
      <NoCompanyView
        onCompanyJoined={() => {
          setDataLoading(true);
          setTimeout(() => {
            window.location.reload();
          }, 500);
        }}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden w-full h-full">
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onAddJobClick={() => setIsModalOpen(true)}
      />

      <div className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Navigate to="profile" replace />} />
          <Route
            path="profile"
            element={
              <CompanyProfile
                company={company}
                members={members}
                onInvite={handleInviteMember}
                frameworkFile={frameworkFile}
                setFrameworkFile={setFrameworkFile}
              />
            }
          />
          <Route
            path="jobs"
            element={<JobPostings jobs={jobs} searchQuery={searchQuery} />}
          />
        </Routes>
      </div>

      <AddJobModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddJob={handleAddJob}
      />
    </div>
  );
}

export default CompanyLayout;