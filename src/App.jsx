import { useState } from "react";
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import { useUser } from "./context/userContext";
import Navbar from "./components/Navbar";
import JobPostings from "./pages/JobPostings";
import CompanyProfile from "./pages/CompanyProfile";
import AddJobModal from "./pages/AddJobModal";
import { Briefcase, Building2 } from "lucide-react";

const initialJobsData = [
  { id: 1, title: "Senior Backend Engineer", dept: "Engineering", posted: "May 18, 2026", applicants: 142, stage: "Screening", status: "Active" },
  { id: 2, title: "Product Designer", dept: "Design", posted: "May 12, 2026", applicants: 87, stage: "Interviewing", status: "Active" },
  { id: 3, title: "React Frontend Developer", dept: "Engineering", posted: "May 25, 2026", applicants: 0, stage: "Applied", status: "Drafts" },
  { id: 4, title: "Growth Marketing Lead", dept: "Marketing", posted: "May 9, 2026", applicants: 56, stage: "Shortlisting", status: "Active" },
  { id: 5, title: "Customer Success Manager", dept: "CS", posted: "May 4, 2026", applicants: 34, stage: "Applied", status: "Closed" },
];

const initialMembersData = [
  { name: "Ahmed Ali", email: "ahmed@vodafone.com", role: "HR Manager", style: "bg-royal-violet-100 text-royal-violet-700" },
  { name: "Mostafa Omar", email: "mostafa@vodafone.com", role: "Recruiter", style: "bg-gray-100 text-gray-600" }
];

function App() {
  const { loading } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jobs, setJobs] = useState(initialJobsData);
  const [members, setMembers] = useState(initialMembersData);
  const [searchQuery, setSearchQuery] = useState("");
  const [frameworkFile, setFrameworkFile] = useState("engineering-framework-v3.pdf");

  const handleAddJob = (newJob) => {
    const formattedJob = {
      id: jobs.length + 1,
      title: newJob.title,
      dept: newJob.department,
      posted: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      applicants: 0,
      stage: "Applied",
      status: "Active"
    };
    setJobs([formattedJob, ...jobs]);
  };

  const handleInviteMember = (name, email) => {
    const newMember = {
      name: name,
      email: email,
      role: "Recruiter",
      style: "bg-gray-100 text-gray-600"
    };
    setMembers([...members, newMember]);
  };

  if (loading) return <div className="p-8 text-gray-500 font-sans">Loading session...</div>;

  return (
    <BrowserRouter>
      <div className="flex h-screen bg-gray-50/50 font-sans">

        <div className="w-64 bg-dark-amethyst-950 text-white flex flex-col p-4 flex-shrink-0">
          <div className="space-y-6">
            <div className="px-3 py-2">
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-mauve-magic-300 to-dark-amethyst-200 bg-clip-text text-transparent">
                HireReadyAI
              </span>
            </div>

            <nav className="space-y-1">
              <Link to="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors">
                <Building2 className="w-4 h-4 text-mauve-magic-300" />
                Company
              </Link>
              <Link to="/jobs" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors">
                <Briefcase className="w-4 h-4 text-mauve-magic-300" />
                Job Postings
              </Link>
            </nav>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onAddJobClick={() => setIsModalOpen(true)}
          />

          <div className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Navigate to="/profile" replace />} />
              <Route
                path="/profile"
                element={
                  <CompanyProfile
                    members={members}
                    onInvite={handleInviteMember}
                    frameworkFile={frameworkFile}
                    setFrameworkFile={setFrameworkFile}
                  />
                }
              />
              <Route
                path="/jobs"
                element={<JobPostings jobs={jobs} searchQuery={searchQuery} />}
              />
            </Routes>
          </div>
        </div>

        <AddJobModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddJob={handleAddJob} />
      </div>
    </BrowserRouter>
  );
}

export default App;