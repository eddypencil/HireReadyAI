import { useState, useEffect } from "react";
import { Building2, Plus } from "lucide-react";
import { fetchAllCompanies } from "../services/companies.service";
import { addMembership } from "../services/memberships.service";
import { useUser } from "@/features/auth/context/user.context";

export default function NoCompanyView({ onCompanyJoined }) {
  const { profile } = useUser();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joining, setJoining] = useState(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const data = await fetchAllCompanies();
        setCompanies(data || []);
      } catch (err) {
        console.error("Error fetching companies:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  const handleJoinCompany = async (companyId) => {
    try {
      if (!profile?.id) return;

      setJoining(companyId);

      // TODO: Handle permissions - currently setting default recruiter role
      // In future, should:
      // 1. Show a modal to select role/permissions
      // 2. May require admin approval
      // 3. Different permission levels for different roles
      const membershipData = {
        company_id: companyId,
        profile_id: profile.id,
        permissions: { role: "recruiter" },
      };

      await addMembership(membershipData);
      onCompanyJoined(companyId);
    } catch (err) {
      console.error("Error joining company:", err);
      setError(err.message);
    } finally {
      setJoining(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-slate-900 font-sans">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-2 text-slate-500 text-sm">Loading companies...</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50/50 min-h-screen font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-dark-amethyst-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-dark-amethyst-700" />
          </div>
          <h1 className="text-3xl font-bold text-dark-amethyst-950 mb-2">
            Join a Company
          </h1>
          <p className="text-gray-600">
            Select a company to get started with HireReadyAI
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {companies.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-6">
              No companies available to join.
            </p>
            <button className="flex items-center gap-2 mx-auto px-6 py-2.5 bg-dark-amethyst-950 text-white rounded-lg font-medium hover:bg-dark-amethyst-900 transition-colors cursor-pointer">
              <Plus className="w-4 h-4" />
              Create a Company
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {companies.map((company) => (
              <div
                key={company.id}
                className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-dark-amethyst-100 rounded-lg flex items-center justify-center shrink-0">
                      <span className="text-lg font-bold text-dark-amethyst-700">
                        {company.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-dark-amethyst-950">
                        {company.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {company.industry || "Organization"}
                      </p>
                    </div>
                  </div>
                </div>

                {company.size && (
                  <p className="text-xs text-gray-500 mb-4">
                    {company.size.toLocaleString()} employees
                  </p>
                )}

                <button
                  onClick={() => handleJoinCompany(company.id)}
                  disabled={joining === company.id}
                  className="w-full px-4 py-2 bg-dark-amethyst-950 text-white rounded-lg text-sm font-medium hover:bg-dark-amethyst-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {joining === company.id ? "Joining..." : "Join Company"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
