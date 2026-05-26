import { useState } from "react";
import { ChevronRight, SlidersHorizontal } from "lucide-react";

export default function JobPostings({ jobs, searchQuery }) {
    const [activeTab, setActiveTab] = useState("Active");

    const filteredJobs = jobs.filter(job => {
        const matchesTab = activeTab === "All" || job.status === activeTab;
        const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.dept.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const countJobs = (status) => jobs.filter(j => status === "All" ? true : j.status === status).length;

    return (
        <div className="p-8 bg-gray-50/50 min-h-screen font-sans">
            <div className="max-w-6xl mx-auto">

                {/* Upper Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-dark-amethyst-950">Job Postings</h1>
                        <p className="text-sm text-gray-500 mt-1">All active and closed positions across the company.</p>
                    </div>
                    <button className="flex items-center gap-2 border border-gray-200 bg-white px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer">
                        <SlidersHorizontal className="w-4 h-4" /> Filters
                    </button>
                </div>

                <div className="flex gap-2 mb-6">
                    {["All", "Active", "Closed", "Drafts"].map((tab) => {
                        const isActive = activeTab === tab;
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${isActive
                                        ? "bg-indigo-velvet-50 text-indigo-velvet-600 border border-indigo-velvet-100"
                                        : "text-gray-500 hover:bg-gray-100"
                                    }`}
                            >
                                {tab} - {countJobs(tab)}
                            </button>
                        );
                    })}
                </div>

                <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/70 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Job Title</th>
                                <th className="px-6 py-4">Department</th>
                                <th className="px-6 py-4">Posted Date</th>
                                <th className="px-6 py-4 text-center">Applicants</th>
                                <th className="px-6 py-4">Current Stage</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                            {filteredJobs.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-8 text-gray-400 text-sm">No jobs match your search or filter.</td>
                                </tr>
                            ) : (
                                filteredJobs.map((job) => (
                                    <tr key={job.id} className="hover:bg-gray-50/50 transition-colors group cursor-pointer">
                                        <td className="px-6 py-4 font-medium text-dark-amethyst-950">{job.title}</td>
                                        <td className="px-6 py-4 text-gray-500">{job.dept}</td>
                                        <td className="px-6 py-4 text-gray-500">{job.posted}</td>
                                        <td className="px-6 py-4 text-center font-semibold text-dark-amethyst-900">{job.applicants}</td>
                                        <td className="px-6 py-4">
                                            <span className="bg-indigo-ink-50 text-indigo-ink-600 px-2.5 py-1 rounded-md text-xs font-medium border border-indigo-ink-100/50">
                                                {job.stage}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`font-medium text-xs flex items-center gap-1.5 ${job.status === 'Active' ? 'text-emerald-600' : job.status === 'Drafts' ? 'text-amber-600' : 'text-gray-500'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${job.status === 'Active' ? 'bg-emerald-500' : job.status === 'Drafts' ? 'bg-amber-500' : 'bg-gray-400'
                                                    }`}></span>
                                                {job.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-dark-amethyst-500 transition-colors inline" />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
}