import { useState, useEffect } from "react";
import { Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";
import { Wand2 } from "lucide-react";
import { useUser } from "@/features/auth/context/user.context";
import Navbar from "@/shared/ui/Navbar";
import JobPostings from "./JobPostings";
import CompanyProfile from "./CompanyProfile";
import JDGeneratorPage from "./JDGeneratorPage";
import NoCompanyView from "./NoCompanyView";
import { Briefcase, Building2 } from "lucide-react";
import {
  fetchCompanyByProfileId,
  fetchJobsByCompanyId,
  fetchCompanyMembers,
} from "../services/companies.service";
import { addMembership } from "../services/memberships.service";
import { logOut } from "@/features/auth/services/auth.service";

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

  // Fetch company and related data
  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!profile?.id) return;

      try {
        setDataLoading(true);
        setError(null);

        // Fetch company by profile ID
        const companyData = await fetchCompanyByProfileId(profile.id);
        if (!companyData) {
          // No company - user needs to join/create one
          setCompany(null);
          setDataLoading(false);
          return;
        }

        setCompany(companyData);

        // Fetch jobs and members for this company
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

  // If user doesn't have a company, show join/create company view
  if (!company && !dataLoading) {
    return (
      <NoCompanyView
        onCompanyJoined={() => {
          // Refetch company data after joining
          setDataLoading(true);
          setTimeout(() => {
            window.location.reload();
          }, 500);
        }}
      />
    );
  }

  return (
    <div className="flex h-screen bg-gray-50/50 font-sans">
      <div className="w-64 bg-dark-amethyst-950 text-white flex flex-col p-4 shrink-0">
        <div className="space-y-6">
          <div className="px-3 py-2">
            <span className="text-xl font-bold tracking-tight bg-linear-to-r from-mauve-magic-300 to-dark-amethyst-200 bg-clip-text text-transparent">
              HireReadyAI
            </span>
          </div>

          <nav className="space-y-1">
            <Link
              to="/companies/profile"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
            >
              <Building2 className="w-4 h-4 text-mauve-magic-300" />
              Company
            </Link>
            <Link
              to="/companies/jobs"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
            >
              <Briefcase className="w-4 h-4 text-mauve-magic-300" />
              Job Postings
            </Link>
            <Link
              to="/companies/jd-generator"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
            >
              <Wand2 className="w-4 h-4 text-mauve-magic-300" />
              JD Generator
            </Link>
            <button onClick={logOut}>Logout</button>
          </nav>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onAddJobClick={() => navigate("/companies/jd-generator")}
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
            <Route
              path="jd-generator"
              element={<JDGeneratorPage company={company} profile={profile} />}
            />
            
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default CompanyLayout;
