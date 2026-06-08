//src\features\companies\pages\NoCompanyView.jsx
import { useState, useEffect } from "react";
import { Building2, Plus, LogOut, ArrowLeft } from "lucide-react";
import {
  fetchAllCompanies,
  createCompany,
} from "../services/companies.service";
import { addMembership } from "../services/memberships.service";
import { logOut } from "@/features/auth/services/auth.service";
import { useUser } from "@/features/auth/context/user.context";
import { useTranslation } from "react-i18next";
import { t } from "i18next";

export default function NoCompanyView({ onCompanyJoined }) {
  const { profile } = useUser();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joining, setJoining] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  // form state
  const [newCompany, setNewCompany] = useState({
    name: "",
    industry: "",
    size: "",
    location: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      // Add user as recruiter to existing company
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

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    if (!profile?.id) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const created = await createCompany({
        name: newCompany.name,
        industry: newCompany.industry,
        size: newCompany.size ? parseInt(newCompany.size, 10) : null,
        location: newCompany.location,
      });

      // Add user as admin (creator) to the new company
      await addMembership({
        company_id: created.id,
        profile_id: profile.id,
        permissions: { role: "admin" },
      });

      onCompanyJoined(created.id);
    } catch (err) {
      console.error("Error creating company:", err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-foreground font-sans">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-2 text-muted-foreground text-xs font-medium">
          {t("no_company_view.loading")}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 font-sans flex flex-col">
      {/* Topbar */}
      <header className="bg-background border-b border-border/60 px-5 py-3 flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
            <Building2 className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            HireReadyAI
          </span>
        </div>
        <button
          onClick={logOut}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground bg-background border border-border rounded-md hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          {t("no_company_view.sign_out")}
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-xs font-medium">
              {error}
            </div>
          )}

          {isCreating ? (
            <div className="bg-background rounded-lg shadow-xs border border-border/60 overflow-hidden max-w-xl mx-auto">
              <div className="p-4 border-b border-border/60 flex items-center gap-3">
                <button
                  onClick={() => setIsCreating(false)}
                  className="p-1.5 hover:bg-muted rounded-md transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h2 className="text-base font-bold text-foreground">
                  {t("no_company_view.create.title")}
                </h2>
              </div>
              <form onSubmit={handleCreateCompany} className="p-5 space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    {t("no_company_view.create.company_name")}
                  </label>
                  <input
                    type="text"
                    required
                    value={newCompany.name}
                    onChange={(e) =>
                      setNewCompany({ ...newCompany, name: e.target.value })
                    }
                    className="w-full px-3 py-1.5 bg-background border border-border rounded-md text-sm focus:outline-hidden focus:ring-1 focus:ring-ring"
                    placeholder={t("no_company_view.placeholders.name")}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    {t("no_company_view.create.industry")}
                  </label>
                  <input
                    type="text"
                    value={newCompany.industry}
                    onChange={(e) =>
                      setNewCompany({ ...newCompany, industry: e.target.value })
                    }
                    className="w-full px-3 py-1.5 bg-background border border-border rounded-md text-sm focus:outline-hidden focus:ring-1 focus:ring-ring"
                    placeholder={t("no_company_view.placeholders.industry")}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      {t("no_company_view.create.company_size")}
                    </label>
                    <input
                      type="number"
                      value={newCompany.size}
                      onChange={(e) =>
                        setNewCompany({ ...newCompany, size: e.target.value })
                      }
                      className="w-full px-3 py-1.5 bg-background border border-border rounded-md text-sm focus:outline-hidden focus:ring-1 focus:ring-ring"
                      placeholder={t("no_company_view.placeholders.size")}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      {t("no_company_view.create.location")}
                    </label>
                    <input
                      type="text"
                      value={newCompany.location}
                      onChange={(e) =>
                        setNewCompany({
                          ...newCompany,
                          location: e.target.value,
                        })
                      }
                      className="w-full px-3 py-1.5 bg-background border border-border rounded-md text-sm focus:outline-hidden focus:ring-1 focus:ring-ring"
                      placeholder={t("no_company_view.placeholders.location")}
                    />
                  </div>
                </div>
                <div className="pt-3 flex justify-end gap-2 border-t border-border/60 mt-4">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-3 py-1.5 text-xs font-medium text-muted-foreground bg-background border border-border rounded-md hover:bg-muted transition-colors cursor-pointer"
                  >
                    {t("no_company_view.create.buttons.cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting
                      ? t("no_company_view.create.buttons.creating")
                      : t("no_company_view.create.buttons.create")}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-1.5">
                  {t("no_company_view.join.title")}
                </h1>
                <p className="text-sm text-muted-foreground mb-4">
                  Select a company to get started with HireReadyAI or create your own
                </p>
                {companies.length > 0 && (
                  <button
                    onClick={() => setIsCreating(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 transition-colors cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {t("no_company_view.join.create_button")}
                  </button>
                )}
              </div>

              {companies.length === 0 ? (
                <div className="text-center py-10 bg-background rounded-lg shadow-xs border border-border/60">
                  <p className="text-sm text-muted-foreground mb-4">
                    {t("no_company_view.join.no_companies")}
                  </p>
                  <button
                    onClick={() => setIsCreating(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 transition-colors cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {t("no_company_view.join.create_company")}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {companies.map((company) => (
                    <div
                      key={company.id}
                      className="bg-background rounded-lg border border-border/60 p-4 hover:shadow-xs transition-shadow flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start gap-2.5 mb-3">
                          <div className="w-9 h-9 bg-primary/10 rounded-md flex items-center justify-center shrink-0">
                            <span className="text-sm font-bold text-primary">
                              {company.name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-sm text-foreground truncate">
                              {company.name}
                            </h3>
                            <p className="text-xs text-muted-foreground truncate">
                              {company.industry || "Organization"}
                            </p>
                          </div>
                        </div>

                        {company.size && (
                          <p className="text-[11px] text-muted-foreground mb-3">
                            {company.size.toLocaleString()} employees
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => handleJoinCompany(company.id)}
                        disabled={joining === company.id}
                        className="w-full mt-2 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md text-xs font-medium hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {joining === company.id
                          ? t("no_company_view.join.joining")
                          : t("no_company_view.join.join")}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}