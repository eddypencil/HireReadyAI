import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useUser } from "@/features/auth/context/user.context";
import { supabase } from "@/shared/services/supabase";
import Navbar from "@/shared/ui/Navbar";
import JobPostings from "./JobPostings";
import CompanyProfile from "./CompanyProfile";
import JDGeneratorPage from "./JDGeneratorPage";
import NoCompanyView from "./NoCompanyView";
import PendingApprovalPage from "./PendingApprovalPage";
import RecruiterDashboardPage from "../../recruiter/pages/RecruiterDashboardPage";
import LoadingSpinner from "@/shared/ui/LoadingSpinner";
import CompanySuspended from "@/shared/ui/CompanySuspended";
import PipelineCandidatesPage from "../../recruiter/pages/PipelineCandidatesPage";
import CandidateProfilePage from "../../recruiter/pages/CandidateProfilePage";
import CandidateAssessmentsPage from "../../recruiter/pages/CandidateAssessmentsPage";
import ApplicantProfilePage from "../../applicant/pages/ApplicantProfilePage";
import ShortlistsPage from "../../shortlist/pages/ShortlistsPage";
import PipelineBuilderPage from "../../pipeline/pages/PipelineBuilderPage";
import {
  fetchCompanyByProfileId,
  fetchJobsByCompanyId,
  fetchCompanyMembers,
} from "../services/companies.service";
import { addMembership } from "../services/memberships.service";
import { MEMBERSHIP_PERMISSION } from "@/shared/constants/enums";
import { useTranslation } from "react-i18next";

function CompanyLayout() {
  const { loading, profile } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const isFullscreenRoute =
    location.pathname.includes("/shortlists") ||
    /\/companies\/candidates$/.test(location.pathname);
  const [jobs, setJobs] = useState([]);
  const [members, setMembers] = useState([]);
  const [company, setCompany] = useState(null);
  const [permission, setPermission] = useState(null);
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

        const { company: companyData, permission: perm } = await fetchCompanyByProfileId(profile.id);
        if (!companyData) {
          setCompany(null);
          setPermission(null);
          setDataLoading(false);
          return;
        }

        setCompany(companyData);
        setPermission(perm);

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

  useEffect(() => {
    if (!company?.id) return;
    const channel = supabase
      .channel(`company-status-layout-${company.id}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "companies", filter: `id=eq.${company.id}` }, (payload) => {
        setCompany((prev) => (prev ? { ...prev, ...payload.new } : prev));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [company?.id]);

  useEffect(() => {
    if (!profile?.id) return;
    const channel = supabase
      .channel(`membership-${profile.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "company_memberships", filter: `profile_id=eq.${profile.id}` }, (payload) => {
        if (!payload.new) {
          setCompany(null);
          setPermission(null);
        } else {
          setPermission(payload.new.recruiter_permissions);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [profile?.id]);

  const handleInviteMember = async () => {
    try {
      if (!company?.id) return;

      const membershipData = {
        company_id: company.id,
        profile_id: profile?.id,
        recruiter_permissions: MEMBERSHIP_PERMISSION.pending,
      };

      const newMembership = await addMembership(membershipData);
      setMembers([...members, newMembership]);
    } catch (err) {
      console.error("Error adding member:", err);
      setError(err.message);
    }
  };

  if (loading || dataLoading)
    return <LoadingSpinner message={t("company_layout.loading")} />;

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-5 font-sans">
        <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-xl p-4 max-w-md text-center shadow-xs">
          <p className="text-sm font-semibold mb-1">
            Failed to load system state
          </p>
          <p className="text-xs opacity-90 leading-relaxed font-mono">
            {error}
          </p>
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

  if (permission === MEMBERSHIP_PERMISSION.pending) {
    return <PendingApprovalPage companyName={company?.name} companyId={company?.id} />;
  }

  if (company?.account_status === "banned") {
    return <CompanySuspended company={company} membershipPermission={permission} />;
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden w-full h-full bg-background font-sans">
      {!isFullscreenRoute && (
        <Navbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onAddJobClick={() => navigate("/companies/jd-generator")}
        />
      )}

      <div className={isFullscreenRoute ? "flex-1" : "flex-1 overflow-y-auto"}>
        <Routes>
          <Route path="/" element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<RecruiterDashboardPage />} />
          <Route
            path="profile"
            element={
              <CompanyProfile
                company={company}
                members={members}
                currentUserPermission={permission}
                currentUserId={profile?.id}
                onInvite={handleInviteMember}
                onMembersChange={setMembers}
                onCompanyUpdate={setCompany}
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
          <Route
            path="shortlists"
            element={<ShortlistsPage jobs={jobs} company={company} />}
          />
          <Route
            path="shortlists/:jobId"
            element={<ShortlistsPage jobs={jobs} company={company} />}
          />
          <Route
            path="candidates"
            element={<PipelineCandidatesPage company={company} jobs={jobs} />}
          />
          <Route path="candidates/:id" element={<CandidateProfilePage />} />
          <Route
            path="candidates/:id/assessments"
            element={<CandidateAssessmentsPage />}
          />
          <Route
            path="applicants/:id/profile"
            element={<ApplicantProfilePage />}
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
