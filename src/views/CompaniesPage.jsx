import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCompaniesViewModel } from "../viewmodels/useCompaniesViewModel";
import { CompanyForm } from "./components/CompanyForm";
import { useUser } from "../context/userContext";
import { USER_ROLE } from "../utils/enums";

export const CompaniesPage = () => {
  const navigate = useNavigate();
  const { companies, loading, error, handleCreate, handleUpdate, handleDelete } =
    useCompaniesViewModel();
  const { profile } = useUser();
  const canManage = profile?.role === USER_ROLE.recruiter || profile?.role === USER_ROLE.hrManager;

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCompanyId, setEditingCompanyId] = useState(null);

  if (loading) return <p className="p-4 text-sm text-gray-500">Loading companies...</p>;

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-bold text-gray-900">Companies</h1>
        {canManage && (
          <button
            onClick={() => {
              setShowCreateForm((v) => !v);
              setEditingCompanyId(null);
            }}
            className="bg-blue-600 text-white text-sm px-3 py-1.5 rounded hover:bg-blue-700"
          >
            {showCreateForm ? "Cancel" : "+ New Company"}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
          Error: {error}
        </div>
      )}

      {showCreateForm && (
        <div className="mb-4">
          <CompanyForm
            onSubmit={async (data) => {
              const ok = await handleCreate(data, profile?.id);
              if (ok) setShowCreateForm(false);
            }}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      )}

      {companies.length === 0 ? (
        <p className="text-sm text-gray-400 italic">No companies found.</p>
      ) : (
        <ul className="space-y-2">
          {companies.map((company) => (
            <li key={company.id} className="border border-gray-200 rounded p-3 bg-white">
              {editingCompanyId === company.id ? (
                <CompanyForm
                  initial={company}
                  onSubmit={async (data) => {
                    const ok = await handleUpdate(company.id, data);
                    if (ok) setEditingCompanyId(null);
                  }}
                  onCancel={() => setEditingCompanyId(null)}
                />
              ) : (
                <div className="flex justify-between items-start">
                  <div>
                    <p
                      className="text-sm font-semibold text-blue-700 hover:underline cursor-pointer"
                      onClick={() => navigate(`/companies/${company.id}`)}
                    >
                      {company.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {company.industry || "No industry"} &bull;{" "}
                      {company.size ? `${company.size} employees` : "Size unknown"}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      ID: {company.id}
                    </p>
                  </div>
                  {canManage && (
                    <div className="flex gap-1 ml-2 shrink-0">
                      <button
                        onClick={() => setEditingCompanyId(company.id)}
                        className="text-xs border border-gray-300 px-2 py-0.5 rounded hover:bg-gray-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(company.id)}
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
