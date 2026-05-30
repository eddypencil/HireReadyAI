import { useState } from "react";
import { ChevronRight, SlidersHorizontal } from "lucide-react";

export default function JobPostings({ jobs, searchQuery }) {
  const [activeTab, setActiveTab] = useState("Active");

  const getJobStatus = (job) => {
    return job.closed_at ? "Closed" : "Active";
  };

  const filteredJobs = jobs.filter((job) => {
    const status = getJobStatus(job);
    const matchesTab = activeTab === "All" || status === activeTab;
    const matchesSearch = job.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const countJobs = (status) => {
    if (status === "All") return jobs.length;
    return jobs.filter((j) => getJobStatus(j) === status).length;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="p-4 sm:p-8 bg-gray-50/50 min-h-screen font-sans">
      <div className="max-w-6xl mx-auto">

        {/* Upper Header Responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-dark-amethyst-950">
              Job Postings
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              All active and closed positions across the company.
            </p>
          </div>
          <button className="flex items-center justify-center gap-2 border border-gray-200 bg-white px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer w-full sm:w-auto transition-all shadow-2xs">
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-1.5 max-w-full scrollbar-none">
          {["All", "Active", "Closed"].map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer shrink-0 ${isActive
                    ? "bg-indigo-velvet-50 text-indigo-velvet-600 border border-indigo-velvet-100"
                    : "text-gray-500 hover:bg-gray-100"
                  }`}
              >
                {tab} - {countJobs(tab)}
              </button>
            );
          })}
        </div>

        {filteredJobs.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-500 shadow-xs">
            No jobs found
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden w-full">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="px-6 py-3.5 text-xs font-semibold text-gray-600">
                      Job Title
                    </th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-gray-600">
                      Posted
                    </th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-gray-600">
                      Seniority
                    </th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-gray-600">
                      Job Type
                    </th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-gray-600">
                      Status
                    </th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-gray-600 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJobs.map((job) => (
                    <tr
                      key={job.id}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 max-w-xs">
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-dark-amethyst-950 truncate">
                            {job.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5 truncate">
                            {job.description || "No description provided."}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {formatDate(job.created_at)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 capitalize whitespace-nowrap">
                        {job.seniority_level || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 capitalize whitespace-nowrap">
                        {job.job_type || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getJobStatus(job) === "Active"
                              ? "bg-green-50 text-green-700 border border-green-100"
                              : "bg-gray-100 text-gray-600"
                            }`}
                        >
                          {getJobStatus(job)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors p-1 rounded-lg">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}