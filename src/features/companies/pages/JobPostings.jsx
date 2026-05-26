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
    <div className="p-8 bg-gray-50/50 min-h-screen font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Upper Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-dark-amethyst-950">
              Job Postings
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              All active and closed positions across the company.
            </p>
          </div>
          <button className="flex items-center gap-2 border border-gray-200 bg-white px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer">
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          {["All", "Active", "Closed"].map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                  isActive
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
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-500">
            No jobs found
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-6 py-3 text-xs font-semibold text-gray-600">
                    Job Title
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-600">
                    Posted
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-600">
                    Seniority
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-600">
                    Job Type
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-600">
                    Status
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-600"></th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((job) => (
                  <tr
                    key={job.id}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-sm text-dark-amethyst-950">
                          {job.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {job.description?.substring(0, 50)}...
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(job.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                      {job.seniority_level || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                      {job.job_type || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          getJobStatus(job) === "Active"
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {getJobStatus(job)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-400 hover:text-gray-600 cursor-pointer">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
