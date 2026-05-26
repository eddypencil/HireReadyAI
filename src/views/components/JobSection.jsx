import { useState } from "react";
import { JobForm } from "./JobForm";
import { useUser } from "../../context/userContext";

export const JobSection = ({
  jobs = [],
  companyId,
  onCreateJob,
  onUpdateJob,
  onDeleteJob,
  canManage = false,
}) => {
  const { user } = useUser();
  const [showCreate, setShowCreate] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-bold text-gray-700">
          Job Postings ({jobs.length})
        </h3>
        {canManage && (
          <button
            onClick={() => {
              setShowCreate((v) => !v);
              setEditingJobId(null);
            }}
            className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
          >
            {showCreate ? "Cancel" : "+ Post Job"}
          </button>
        )}
      </div>

      {showCreate && (
        <div className="mb-3">
          <JobForm
            companyId={companyId}
            profileId={user?.id}
            onSubmit={async (data) => {
              const ok = await onCreateJob(data);
              if (ok) setShowCreate(false);
            }}
            onCancel={() => setShowCreate(false)}
          />
        </div>
      )}

      {jobs.length === 0 ? (
        <p className="text-xs text-gray-400 italic">No jobs posted yet.</p>
      ) : (
        <ul className="space-y-2">
          {jobs.map((job) => (
            <li key={job.id} className="border border-gray-200 rounded p-2">
              {editingJobId === job.id ? (
                <JobForm
                  companyId={companyId}
                  profileId={user?.id}
                  initial={job}
                  onSubmit={async (data) => {
                    const ok = await onUpdateJob(job.id, data);
                    if (ok) setEditingJobId(null);
                  }}
                  onCancel={() => setEditingJobId(null)}
                />
              ) : (
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {job.title}
                      <span className="ml-2 text-xs text-gray-500 capitalize">
                        [{job.seniority_level}]
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {job.description}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Closes: {new Date(job.closed_at).toLocaleDateString()}
                    </p>
                  </div>
                  {canManage && (
                    <div className="flex gap-1 ml-2 shrink-0">
                      <button
                        onClick={() => setEditingJobId(job.id)}
                        className="text-xs border border-gray-300 px-2 py-0.5 rounded hover:bg-gray-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDeleteJob(job.id)}
                        className="text-xs text-red-500 border border-red-200 px-2 py-0.5 rounded hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
