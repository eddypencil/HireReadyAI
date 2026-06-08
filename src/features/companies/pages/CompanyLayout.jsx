//src\features\companies\pages\CompanyLayout.jsx
import { useState, useEffect } from "react";
import { Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";
import { useUser } from "@/features/auth/context/user.context";
import Navbar from "@/shared/ui/Navbar";
import JobPostings from "./JobPostings";
import CompanyProfile from "./CompanyProfile";
import JDGeneratorPage from "./JDGeneratorPage";
import NoCompanyView from "./NoCompanyView";
import RecruiterDashboardPage from "../../recruiter/pages/RecruiterDashboardPage";
import PipelineCandidatesPage from "../../recruiter/pages/PipelineCandidatesPage";
import ShortlistsPage from "../../shortlist/pages/ShortlistsPage";
import PipelineBuilderPage from "../../pipeline/pages/PipelineBuilderPage";
import {
  fetchCompanyByProfileId,
  fetchJobsByCompanyId,
  fetchCompanyMembers,
} from "../services/companies.service";
import { addMembership } from "../services/memberships.service";
import { useTranslation } from "react-i18next";

function CompanyLayout() {
  const { loading, profile } = useUser();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [members, setMembers] = useState([]);
  const [company, setCompany] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [frameworkFile, setFrameworkFile] = useState(
    "engineering-framework-v3.pdf",
  );
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useTranslation();

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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-sidebar font-sans select-none">
        <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-2.5 text-muted-foreground text-xs font-semibold tracking-wide">
          {t("company_layout.loading system data")}
        </p>
      </div>
    );

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-5 font-sans">
        <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-xl p-4 max-w-md text-center shadow-xs">
          <p className="text-sm font-semibold mb-1">Failed to load system state</p>
          <p className="text-xs opacity-90 leading-relaxed font-mono">{error}</p>
        </div>
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
    <div className="flex-1 flex flex-col overflow-hidden w-full h-full bg-background font-sans">
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onAddJobClick={() => navigate("/companies/jd-generator")}
      />

      <div className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<RecruiterDashboardPage />} />
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
            element={
              <JobPostings
                jobs={jobs}
                searchQuery={searchQuery}
                company={company}
              />
            }
          />
          <Route path="shortlists" element={<ShortlistsPage jobs={jobs} />} />
          <Route
            path="shortlists/:jobId"
            element={<ShortlistsPage jobs={jobs} />}
          />
          <Route
            path="candidates"
            element={<PipelineCandidatesPage company={company} jobs={jobs} />}
          />
          <Route path="pipelines/:jobId" element={<PipelineBuilderPage />} />
          <Route
            path="jd-generator"
            element={<JDGeneratorPage company={company} profile={profile} />}
          />
        </Routes>
      </div>
    </div>
  );
}

export default CompanyLayout;