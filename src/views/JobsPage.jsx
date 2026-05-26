import { useNavigate } from "react-router-dom";
import { useJobsViewModel } from "../viewmodels/useJobsViewModel";

export const JobsPage = () => {
  const navigate = useNavigate();
  const { jobs, loading, error } = useJobsViewModel();

  if (loading)
    return <p className="p-4 text-sm text-gray-500">Loading jobs...</p>;

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-bold text-gray-900">Job Postings</h1>
      </div>

      {error && (
        <div className="p-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
          Error: {error}
        </div>
      )}

      {jobs.length === 0 && !loading ? (
        <p className="text-sm text-gray-400 italic">No jobs found.</p>
      ) : (
        <ul className="space-y-3">
          {jobs.map((job) => (
            <li
              key={job.id}
              className="border border-gray-200 rounded p-4 bg-white"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    {job.title}
                  </h3>
                  <div className="flex gap-2 text-xs text-gray-500 mt-1">
                    <span className="capitalize">{job.seniority_level}</span>
                    <span>&bull;</span>
                    <span
                      className="text-blue-600 hover:underline cursor-pointer"
                      onClick={() => navigate(`/companies/${job.company_id}`)}
                    >
                      {job.companies?.name || "Unknown Company"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-2">
                    {job.description}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
