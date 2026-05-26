import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCompanyDetailsViewModel } from "../viewmodels/useCompanyDetailsViewModel";
import { CompanyForm } from "./components/CompanyForm";
import { MembershipSection } from "./components/MembershipSection";
import { JobSection } from "./components/JobSection";
import { useUser } from "../context/userContext";
import { USER_ROLE } from "../utils/enums";

export const CompanyDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    company,
    loading,
    error,
    handleUpdateCompany,
    handleAddMembership,
    handleRemoveMembership,
    handleCreateJob,
    handleUpdateJob,
    handleDeleteJob,
  } = useCompanyDetailsViewModel(id);

  const { profile } = useUser();
  const canManage = profile?.role === USER_ROLE.recruiter || profile?.role === USER_ROLE.hrManager;

  const [editingInfo, setEditingInfo] = useState(false);

  if (loading) return <p className="p-4 text-sm text-gray-500">Loading company details...</p>;
  if (!company) return <p className="p-4 text-sm text-gray-400">Company not found.</p>;

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-6">
      {/* Back navigation */}
      <button
        onClick={() => navigate("/companies")}
        className="text-xs text-blue-600 hover:underline"
      >
        &larr; Back to Companies
      </button>

      {error && (
        <div className="p-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
          Error: {error}
        </div>
      )}

      {/* Company Info */}
      <section className="border border-gray-200 rounded p-3 bg-white">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-base font-bold text-gray-900">{company.name}</h2>
          {canManage && (
            <button
              onClick={() => setEditingInfo((v) => !v)}
              className="text-xs border border-gray-300 px-2 py-0.5 rounded hover:bg-gray-100"
            >
              {editingInfo ? "Cancel" : "Edit"}
            </button>
          )}
        </div>

        {editingInfo ? (
          <CompanyForm
            initial={company}
            onSubmit={async (data) => {
              const ok = await handleUpdateCompany(data);
              if (ok) setEditingInfo(false);
            }}
            onCancel={() => setEditingInfo(false)}
          />
        ) : (
          <div className="text-xs text-gray-500 space-y-0.5">
            <p><span className="font-semibold text-gray-700">Industry:</span> {company.industry || "—"}</p>
            <p><span className="font-semibold text-gray-700">Size:</span> {company.size ? `${company.size} employees` : "—"}</p>
            <p><span className="font-semibold text-gray-700">ID:</span> {company.id}</p>
            <p><span className="font-semibold text-gray-700">Created:</span> {new Date(company.created_at).toLocaleString()}</p>
          </div>
        )}
      </section>

      {/* Memberships */}
      <section className="border border-gray-200 rounded p-3 bg-white">
        <MembershipSection
          memberships={company.company_memberships || []}
          companyId={company.id}
          onAdd={handleAddMembership}
          onRemove={handleRemoveMembership}
          canManage={canManage}
        />
      </section>

      {/* Jobs */}
      <section className="border border-gray-200 rounded p-3 bg-white">
        <JobSection
          jobs={company.job_postings || []}
          companyId={company.id}
          onCreateJob={handleCreateJob}
          onUpdateJob={handleUpdateJob}
          onDeleteJob={handleDeleteJob}
          canManage={canManage}
        />
      </section>
    </div>
  );
};
