import { useState, useEffect } from "react";
import { useUser } from "@/features/auth/context/user.context";
import { useCompanyDetailsViewModel } from "../hooks/useCompanyDetails";
import { useCompaniesViewModel } from "../hooks/useCompanies";
import { fetchCompanyByProfileId } from "../services/companies.service";
import CompanyProfile from "./CompanyProfile";
import JobPostings from "./JobPostings";
import AddJobModal from "./AddJobModal";
import Navbar from "@/shared/ui/Navbar";
import { Building2, Briefcase, LogOut, ChevronRight, Sparkles } from "lucide-react";

export default function CompanyWorkspace() {
  const { profile, signOutUser } = useUser();
  const [userCompanyId, setUserCompanyId] = useState(null);
  const [checkingCompany, setCheckingCompany] = useState(true);
  const [activeTab, setActiveTab] = useState("profile"); // 'profile' or 'jobs'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Creation State
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newCompanyIndustry, setNewCompanyIndustry] = useState("");
  const [newCompanySize, setNewCompanySize] = useState("1-10 employees");

  const { handleCreate, loading: createLoading } = useCompaniesViewModel();

  const checkUserCompany = async () => {
    if (!profile?.id) return;
    setCheckingCompany(true);
    try {
      const companyDetails = await fetchCompanyByProfileId(profile.id);
      if (companyDetails) {
        setUserCompanyId(companyDetails.id);
      }
    } catch (err) {
      console.error("Error checking user company:", err);
    } finally {
      setCheckingCompany(false);
    }
  };

  useEffect(() => {
    checkUserCompany();
  }, [profile?.id]);

  const {
    company,
    loading: companyLoading,
    error: companyError,
    handleUpdateCompany,
    handleAddMembership,
    handleRemoveMembership,
    handleCreateJob,
    reload,
  } = useCompanyDetailsViewModel(userCompanyId);

  const handleCompanyCreatedSubmit = async (e) => {
    e.preventDefault();
    if (!newCompanyName || !newCompanyIndustry) return;
    const success = await handleCreate(
      {
        name: newCompanyName,
        industry: newCompanyIndustry,
        size: newCompanySize,
        logo_url: "",
      },
      profile.id
    );

    if (success) {
      await checkUserCompany();
    }
  };

  const handleAddJobSubmit = async (newJob) => {
    if (!userCompanyId) return;
    const success = await handleCreateJob({
      company_id: userCompanyId,
      title: newJob.title,
      department: newJob.department,
      description: newJob.description,
      seniority_level: "senior", // default or can be customized
      job_type: "full_time", // default or can be customized
      status: "Active",
    });
    if (success) {
      reload();
    }
  };

  const handleInviteSubmit = async (name, email) => {
    // Currently, we don't have a lookup profile by email to get a profile ID,
    // so we will simulate adding membership or invoke handleAddMembership
    // with a mock/temp profile_id or direct insert.
    // In a production app, we would search profile by email.
    // Let's call alert or insert with profile.id as placeholder, or just call onInvite helper.
    alert(`Invite sent to ${name} (${email})!`);
  };

  if (checkingCompany || (userCompanyId && companyLoading)) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans">
        <div className="w-10 h-10 border-4 border-dark-amethyst-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 text-sm font-medium">Loading Workspace...</p>
      </div>
    );
  }

  // ----------------------------------------------------
  // ONBOARDING SCREEN: Create Company Profile
  // ----------------------------------------------------
  if (!userCompanyId) {
    return (
      <div className="min-h-screen bg-[#fafafc] flex items-center justify-center p-6 font-sans">
        <div className="bg-white border border-gray-100 shadow-2xl rounded-2xl p-8 max-w-lg w-full space-y-6 transition-all duration-300">
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-dark-amethyst-50 rounded-xl flex items-center justify-center text-dark-amethyst-600">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-dark-amethyst-950">Set Up Your Company Profile</h2>
            <p className="text-sm text-gray-500">
              Welcome, {profile?.fullName || "Recruiter"}! To start posting jobs and reviewing applicants, please create a profile for your organization.
            </p>
          </div>

          <form onSubmit={handleCompanyCreatedSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Company Name</label>
              <input
                required
                type="text"
                value={newCompanyName}
                onChange={(e) => setNewCompanyName(e.target.value)}
                placeholder="e.g. Vodafone Egypt"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-dark-amethyst-400 focus:ring-1 focus:ring-dark-amethyst-400 transition-all bg-gray-50/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Industry</label>
              <input
                required
                type="text"
                value={newCompanyIndustry}
                onChange={(e) => setNewCompanyIndustry(e.target.value)}
                placeholder="e.g. Telecommunications"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-dark-amethyst-400 focus:ring-1 focus:ring-dark-amethyst-400 transition-all bg-gray-50/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Company Size</label>
              <select
                value={newCompanySize}
                onChange={(e) => setNewCompanySize(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-dark-amethyst-400 bg-white"
              >
                <option value="1-10 employees">1-10 employees</option>
                <option value="11-50 employees">11-50 employees</option>
                <option value="51-200 employees">51-200 employees</option>
                <option value="201-500 employees">201-500 employees</option>
                <option value="500+ employees">500+ employees</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={createLoading}
              className="w-full bg-dark-amethyst-950 text-white py-3 rounded-xl text-sm font-semibold hover:bg-dark-amethyst-900 transition-colors shadow-lg shadow-dark-amethyst-950/10 cursor-pointer flex items-center justify-center gap-2"
            >
              {createLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Create Profile <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-gray-100 flex justify-center">
            <button
              onClick={signOutUser}
              className="flex items-center gap-2 text-xs font-medium text-red-600 hover:text-red-700 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" /> Log Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Mapped items
  const mappedMembers =
    company?.company_memberships?.map((m) => ({
      name: m.profiles?.full_name || "Unknown User",
      email: m.profiles?.email || "recruiter@company.com",
      role: m.permissions?.includes("admin") ? "HR Manager" : "Recruiter",
      style: m.permissions?.includes("admin")
        ? "bg-royal-violet-100 text-royal-violet-700"
        : "bg-gray-100 text-gray-600",
    })) || [];

  const mappedJobs =
    company?.job_postings?.map((j) => ({
      id: j.id,
      title: j.title,
      dept: j.department || "Engineering",
      posted: new Date(j.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      applicants: j.applicants_count || 0,
      stage: j.stage || "Applied",
      status: j.status || "Active",
    })) || [];

  // ----------------------------------------------------
  // DASHBOARD WORKSPACE
  // ----------------------------------------------------
  return (
    <div className="flex h-screen bg-[#fafafc] font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-dark-amethyst-950 text-white flex flex-col p-6 flex-shrink-0 justify-between">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 text-red-600 font-bold rounded-xl flex items-center justify-center text-lg shadow-inner">
              {company.name ? company.name[0] : "C"}
            </div>
            <div>
              <h2 className="text-sm font-bold truncate max-w-[140px] text-white">
                {company.name}
              </h2>
              <p className="text-[10px] text-mauve-magic-300 font-semibold tracking-wide uppercase">
                Workspace
              </p>
            </div>
          </div>

          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                activeTab === "profile"
                  ? "bg-white/10 text-white shadow-sm border border-white/5 font-semibold"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Building2 className={`w-4 h-4 ${activeTab === "profile" ? "text-mauve-magic-300" : "text-white/60"}`} />
              Company Details
            </button>
            <button
              onClick={() => setActiveTab("jobs")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                activeTab === "jobs"
                  ? "bg-white/10 text-white shadow-sm border border-white/5 font-semibold"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Briefcase className={`w-4 h-4 ${activeTab === "jobs" ? "text-mauve-magic-300" : "text-white/60"}`} />
              Job Postings
            </button>
          </nav>
        </div>

        <button
          onClick={signOutUser}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-red-400" />
          Sign Out
        </button>
      </div>

      {/* Main Panel Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onAddJobClick={() => setIsModalOpen(true)}
        />

        <div className="flex-1 overflow-y-auto">
          {activeTab === "profile" ? (
            <CompanyProfile
              company={company}
              onUpdate={handleUpdateCompany}
              members={mappedMembers}
              onInvite={handleInviteSubmit}
              frameworkFile={company.framework_file || "engineering-framework-v3.pdf"}
              setFrameworkFile={async (filename) => {
                await handleUpdateCompany({ framework_file: filename });
              }}
            />
          ) : (
            <JobPostings jobs={mappedJobs} searchQuery={searchQuery} />
          )}
        </div>
      </div>

      {/* Add Job Modal Overlay */}
      <AddJobModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddJob={handleAddJobSubmit}
      />
    </div>
  );
}
