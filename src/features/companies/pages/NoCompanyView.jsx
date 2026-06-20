import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Building2, Plus, LogOut, ArrowLeft, Check, Crown } from "lucide-react";
import {
  fetchAllCompanies,
  createCompany,
} from "../services/companies.service";
import { addMembership } from "../services/memberships.service";
import { logOut } from "@/features/auth/services/auth.service";
import { useUser } from "@/features/auth/context/user.context";
import { t } from "i18next";
import LoadingSpinner from "@/shared/ui/LoadingSpinner";
import { MEMBERSHIP_PERMISSION } from "@/shared/constants/enums";
import { createCheckoutSession } from "@/features/premium/services/premium.service";

export default function NoCompanyView({ onCompanyJoined }) {
  const { profile } = useUser();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joining, setJoining] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showingPricing, setShowingPricing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  // form state
  const [newCompany, setNewCompany] = useState({
    name: "",
    industry: "",
    size: "",
    location: "",
    description: "",
    culture: "",
    benefits: "",
    founding_date: "",
    website_url: "",
    linkedin_url: "",
    twitter_url: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const data = await fetchAllCompanies();
        setCompanies((data || []).filter((c) => c.account_status !== "banned"));
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

      const membershipData = {
        company_id: companyId,
        profile_id: profile.id,
        recruiter_permissions: MEMBERSHIP_PERMISSION.pending,
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
        description: newCompany.description,
        culture: newCompany.culture,
        benefits: newCompany.benefits,
        founding_date: newCompany.founding_date || null,
        website_url: newCompany.website_url,
        linkedin_url: newCompany.linkedin_url,
        twitter_url: newCompany.twitter_url,
      });

      await addMembership({
        company_id: created.id,
        profile_id: profile.id,
        recruiter_permissions: MEMBERSHIP_PERMISSION.hrManager,
      });

      if (selectedPlan === "premium") {
        const { url } = await createCheckoutSession(created.id);
        window.location.href = url;
      } else {
        onCompanyJoined(created.id);
      }
    } catch (err) {
      console.error("Error creating company:", err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message={t("no_company_view.loading")} />;
  }

  return (
    <div className="fixed inset-0 z-50 bg-background font-sans flex flex-col">
      {/* Topbar */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-background border-b border-border/60 px-6 py-4 flex items-center justify-between shrink-0 shadow-xs"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            HireReadyAI
          </span>
        </div>
        <button
          onClick={logOut}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-800 dark:bg-slate-700 border border-border rounded-xl hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
        >
          <LogOut className="w-4 h-4" />
          {t("no_company_view.sign_out")}
        </button>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="max-w-4xl mx-auto w-full">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm font-medium"
            >
              {error}
            </motion.div>
          )}

          {/* Pricing Step */}
          {showingPricing && !selectedPlan && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="max-w-2xl mx-auto"
            >
              <button
                onClick={() => setShowingPricing(false)}
                className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                {t("apply_job.buttons.back")}
              </button>
              <div className="text-center mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  {t("subscription.title")}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {t("subscription.subtitle")}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Free Plan */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-card rounded-2xl border border-border/60 p-6 shadow-sm flex flex-col justify-between"
                >
                  <div className="mb-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                      <Check className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">
                      {t("subscription.free.name")}
                    </h3>
                    <p className="text-3xl font-extrabold text-foreground mt-2">
                      {t("subscription.free.price")}
                      <span className="text-xs font-normal text-muted-foreground">
                        {t("subscription.free.period")}
                      </span>
                    </p>
                  </div>
                  <ul className="space-y-3 text-xs text-muted-foreground mb-8 flex-1">
                    <li className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-success shrink-0" />
                      {t("subscription.free.feature1")}
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-success shrink-0" />
                      {t("subscription.free.feature2")}
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-success shrink-0" />
                      {t("subscription.free.feature3")}
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-success shrink-0" />
                      {t("subscription.free.feature4")}
                    </li>
                  </ul>
                  <button
                    onClick={() => {
                      setSelectedPlan("free");
                      setIsCreating(true);
                    }}
                    className="w-full py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
                  >
                    {t("subscription.free.button")}
                  </button>
                </motion.div>

                {/* Premium Plan */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-b from-primary/5 to-background rounded-2xl border border-primary/30 p-6 shadow-sm flex flex-col justify-between relative overflow-hidden"
                >
                  <div className="absolute top-4 right-4 bg-warning text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {t("subscription.premium.badge")}
                  </div>
                  <div className="mb-6">
                    <div className="w-12 h-12 bg-warning/20 rounded-xl flex items-center justify-center mb-4">
                      <Crown className="w-6 h-6 text-warning" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">
                      {t("subscription.premium.name")}
                    </h3>
                    <p className="text-3xl font-extrabold text-foreground mt-2">
                      {t("subscription.premium.price")}
                      <span className="text-xs font-normal text-muted-foreground">
                        {t("subscription.premium.period")}
                      </span>
                    </p>
                  </div>
                  <ul className="space-y-3 text-xs text-muted-foreground mb-8 flex-1">
                    <li className="flex items-center gap-3">
                      <Check className="w-3.5 h-3.5 text-success shrink-0" />
                      {t("subscription.premium.feature1")}
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="w-3.5 h-3.5 text-success shrink-0" />
                      {t("subscription.premium.feature2")}
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="w-3.5 h-3.5 text-success shrink-0" />
                      {t("subscription.premium.feature3")}
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="w-3.5 h-3.5 text-success shrink-0" />
                      {t("subscription.premium.feature4")}
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="w-3.5 h-3.5 text-success shrink-0" />
                      {t("subscription.premium.feature5")}
                    </li>
                  </ul>
                  <button
                    onClick={() => {
                      setSelectedPlan("premium");
                      setIsCreating(true);
                    }}
                    className="w-full py-3 bg-warning text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
                  >
                    {t("subscription.premium.button")}
                  </button>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Create Company Form - Fixed Version */}
          {isCreating && (selectedPlan === "free" || selectedPlan === "premium") && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="bg-card rounded-2xl shadow-sm border border-border/60 max-w-xl mx-auto w-full overflow-hidden"
            >
              <div className="p-5 border-b border-border/60 flex items-center gap-4">
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setSelectedPlan(null);
                    setShowingPricing(true);
                  }}
                  className="p-2 hover:bg-muted rounded-xl transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-bold text-foreground">
                  Create a New Company
                </h2>
              </div>
              <form onSubmit={handleCreateCompany} className="p-6 space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                    Company Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newCompany.name}
                    onChange={(e) =>
                      setNewCompany({ ...newCompany, name: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-ring"
                    placeholder="Acme Corp"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                    Industry
                  </label>
                  <input
                    type="text"
                    value={newCompany.industry}
                    onChange={(e) =>
                      setNewCompany({ ...newCompany, industry: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-ring"
                    placeholder="e.g. Technology, Healthcare"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                      Company Size
                    </label>
                    <input
                      type="number"
                      value={newCompany.size}
                      onChange={(e) =>
                        setNewCompany({ ...newCompany, size: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-ring"
                      placeholder="Number of employees"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                      Location
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
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-ring"
                      placeholder="City, Country"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                      Founded
                    </label>
                    <input
                      type="date"
                      value={newCompany.founding_date}
                      onChange={(e) =>
                        setNewCompany({
                          ...newCompany,
                          founding_date: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                      Website
                    </label>
                    <input
                      type="url"
                      value={newCompany.website_url}
                      onChange={(e) =>
                        setNewCompany({
                          ...newCompany,
                          website_url: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-ring"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                    About
                  </label>
                  <textarea
                    value={newCompany.description}
                    onChange={(e) =>
                      setNewCompany({
                        ...newCompany,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-ring resize-none"
                    placeholder="Tell applicants about your company..."
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                      Culture
                    </label>
                    <textarea
                      value={newCompany.culture}
                      onChange={(e) =>
                        setNewCompany({
                          ...newCompany,
                          culture: e.target.value,
                        })
                      }
                      rows={2}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-ring resize-none"
                      placeholder="Company values, culture..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                      Benefits
                    </label>
                    <textarea
                      value={newCompany.benefits}
                      onChange={(e) =>
                        setNewCompany({
                          ...newCompany,
                          benefits: e.target.value,
                        })
                      }
                      rows={2}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-ring resize-none"
                      placeholder="Perks, benefits..."
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      value={newCompany.linkedin_url}
                      onChange={(e) =>
                        setNewCompany({
                          ...newCompany,
                          linkedin_url: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-ring"
                      placeholder="https://linkedin.com/company/..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                      Twitter
                    </label>
                    <input
                      type="url"
                      value={newCompany.twitter_url}
                      onChange={(e) =>
                        setNewCompany({
                          ...newCompany,
                          twitter_url: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-ring"
                      placeholder="https://twitter.com/..."
                    />
                  </div>
                </div>
                <div className="pt-4 flex items-center justify-end gap-3 border-t border-border/60">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false);
                      setSelectedPlan(null);
                      setShowingPricing(true);
                    }}
                    className="px-5 py-2.5 text-xs font-semibold text-muted-foreground bg-background border border-border rounded-xl hover:bg-muted transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer shadow-sm"
                  >
                    {isSubmitting ? "Creating..." : "Create Company"}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Main View */}
          {!showingPricing && !isCreating && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="text-center mb-10"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                  {t("no_company_view.join.title")}
                </h1>
                <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                  {t("companySelection.description")}
                </p>
                {companies.length > 0 && (
                  <button
                    onClick={() => setShowingPricing(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    {t("companySelection.createButton")}
                  </button>
                )}
              </motion.div>

              {companies.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.1 }}
                  className="text-center py-12 bg-card rounded-2xl shadow-sm border border-border/60 max-w-xl mx-auto"
                >
                  <p className="text-sm text-muted-foreground mb-6">
                    {t("companySelection.noCompanies")}
                  </p>
                  <button
                    onClick={() => setShowingPricing(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    {t("no_company_view.create.buttons.create")}
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: { transition: { staggerChildren: 0.06 } },
                  }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                >
                  {companies.map((company) => (
                    <motion.div
                      key={company.id}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 },
                      }}
                      className="bg-card rounded-2xl border border-border/60 p-5 hover:shadow-md transition-shadow flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                            <span className="text-base font-bold text-primary">
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
                          <p className="text-xs text-muted-foreground mb-4">
                            {company.size.toLocaleString()} employees
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => handleJoinCompany(company.id)}
                        disabled={joining === company.id}
                        className="w-full mt-2 px-4 py-2.5 bg-primary text-white rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                      >
                        {joining === company.id
                          ? t("no_company_view.join.joining")
                          : t("no_company_view.join.join")}
                      </button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}