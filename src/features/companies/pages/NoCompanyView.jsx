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
        className="bg-background border-b border-border/60 px-5 py-3 flex items-center justify-between shrink-0 shadow-xs"
      >
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
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-xs font-medium"
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
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
              <div className="text-center mb-6">
                <h1 className="text-xl font-bold text-foreground mb-1">
                  Choose your plan
                </h1>
                <p className="text-sm text-muted-foreground">
                  Start with a free plan and upgrade anytime
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Free Plan */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-background rounded-xl border border-border/60 p-6 shadow-xs flex flex-col"
                >
                  <div className="mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                      <Check className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-base font-bold text-foreground">
                      Free
                    </h3>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      $0
                      <span className="text-xs font-normal text-muted-foreground">
                        /forever
                      </span>
                    </p>
                  </div>
                  <ul className="space-y-2 text-xs text-muted-foreground mb-6 flex-1">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-success shrink-0" />
                      Up to 10 active job postings
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-success shrink-0" />
                      Basic candidate management
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-success shrink-0" />
                      Team collaboration (up to 5 members)
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-success shrink-0" />
                      Email support
                    </li>
                  </ul>
                  <button
                    onClick={() => {
                      setSelectedPlan("free");
                      setIsCreating(true);
                    }}
                    className="w-full py-2 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 transition-colors cursor-pointer"
                  >
                    Get Started Free
                  </button>
                </motion.div>

                {/* Premium Plan */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-b from-primary/5 to-background rounded-xl border border-primary/30 p-6 shadow-xs flex flex-col relative overflow-hidden"
                >
                  <div className="absolute top-3 right-3 bg-warning text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    One-time
                  </div>
                  <div className="mb-4">
                    <div className="w-10 h-10 bg-warning/20 rounded-lg flex items-center justify-center mb-3">
                      <Crown className="w-5 h-5 text-warning" />
                    </div>
                    <h3 className="text-base font-bold text-foreground">
                      Premium
                    </h3>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      $29
                      <span className="text-xs font-normal text-muted-foreground">
                        /one-time
                      </span>
                    </p>
                  </div>
                  <ul className="space-y-2 text-xs text-muted-foreground mb-6 flex-1">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-success shrink-0" />
                      Unlimited job postings
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-success shrink-0" />
                      AI-powered candidate screening
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-success shrink-0" />
                      Advanced analytics & reports
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-success shrink-0" />
                      Priority support
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-success shrink-0" />
                      Custom branding
                    </li>
                  </ul>
                  <button
                    onClick={() => {
                      setSelectedPlan("premium");
                      setIsCreating(true);
                    }}
                    className="w-full py-2 bg-warning text-white rounded-md text-xs font-medium hover:bg-warning/90 transition-colors cursor-pointer"
                  >
                    Buy Premium
                  </button>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Create Company Form */}
          {isCreating && (selectedPlan === "free" || selectedPlan === "premium") && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="bg-background rounded-lg shadow-xs border border-border/60 max-w-xl mx-auto"
            >
              <div className="p-4 border-b border-border/60 flex items-center gap-3">
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setSelectedPlan(null);
                    setShowingPricing(true);
                  }}
                  className="p-1.5 hover:bg-muted rounded-md transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h2 className="text-base font-bold text-foreground">
                  Create a New Company
                </h2>
              </div>
              <form onSubmit={handleCreateCompany} className="p-5 space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newCompany.name}
                    onChange={(e) =>
                      setNewCompany({ ...newCompany, name: e.target.value })
                    }
                    className="w-full px-3 py-1.5 bg-background border border-border rounded-md text-sm focus:outline-hidden focus:ring-1 focus:ring-ring"
                    placeholder="Acme Corp"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Industry
                  </label>
                  <input
                    type="text"
                    value={newCompany.industry}
                    onChange={(e) =>
                      setNewCompany({ ...newCompany, industry: e.target.value })
                    }
                    className="w-full px-3 py-1.5 bg-background border border-border rounded-md text-sm focus:outline-hidden focus:ring-1 focus:ring-ring"
                    placeholder="e.g. Technology, Healthcare"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      Company Size
                    </label>
                    <input
                      type="number"
                      value={newCompany.size}
                      onChange={(e) =>
                        setNewCompany({ ...newCompany, size: e.target.value })
                      }
                      className="w-full px-3 py-1.5 bg-background border border-border rounded-md text-sm focus:outline-hidden focus:ring-1 focus:ring-ring"
                      placeholder="Number of employees"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
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
                      className="w-full px-3 py-1.5 bg-background border border-border rounded-md text-sm focus:outline-hidden focus:ring-1 focus:ring-ring"
                      placeholder="City, Country"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
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
                      className="w-full px-3 py-1.5 bg-background border border-border rounded-md text-sm focus:outline-hidden focus:ring-1 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
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
                      className="w-full px-3 py-1.5 bg-background border border-border rounded-md text-sm focus:outline-hidden focus:ring-1 focus:ring-ring"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
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
                    className="w-full px-3 py-1.5 bg-background border border-border rounded-md text-sm focus:outline-hidden focus:ring-1 focus:ring-ring resize-none"
                    placeholder="Tell applicants about your company..."
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
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
                      className="w-full px-3 py-1.5 bg-background border border-border rounded-md text-sm focus:outline-hidden focus:ring-1 focus:ring-ring resize-none"
                      placeholder="Company values, culture..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
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
                      className="w-full px-3 py-1.5 bg-background border border-border rounded-md text-sm focus:outline-hidden focus:ring-1 focus:ring-ring resize-none"
                      placeholder="Perks, benefits..."
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
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
                      className="w-full px-3 py-1.5 bg-background border border-border rounded-md text-sm focus:outline-hidden focus:ring-1 focus:ring-ring"
                      placeholder="https://linkedin.com/company/..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
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
                      className="w-full px-3 py-1.5 bg-background border border-border rounded-md text-sm focus:outline-hidden focus:ring-1 focus:ring-ring"
                      placeholder="https://twitter.com/..."
                    />
                  </div>
                </div>
                <div className="pt-3 flex justify-end gap-2 border-t border-border/60 mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false);
                      setSelectedPlan(null);
                      setShowingPricing(true);
                    }}
                    className="px-3 py-1.5 text-xs font-medium text-muted-foreground bg-background border border-border rounded-md hover:bg-muted transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-3 py-1.5 bg-primary text-white rounded-md text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
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
                className="text-center mb-8"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-1.5">
                  {t("no_company_view.join.title")}
                </h1>
                <p className="text-sm text-muted-foreground mb-4">
                  Select a company to get started with HireReadyAI or create
                  your own
                </p>
                {companies.length > 0 && (
                  <button
                    onClick={() => setShowingPricing(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 transition-colors cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Create a New Company
                  </button>
                )}
              </motion.div>

              {companies.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.1 }}
                  className="text-center py-10 bg-background rounded-lg shadow-xs border border-border/60"
                >
                  <p className="text-sm text-muted-foreground mb-4">
                    No companies available to join.
                  </p>
                  <button
                    onClick={() => setShowingPricing(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 transition-colors cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Create a Company
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: { transition: { staggerChildren: 0.06 } },
                  }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5"
                >
                  {companies.map((company) => (
                    <motion.div
                      key={company.id}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 },
                      }}
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
                        {joining === company.id ? "Joining..." : "Join"}
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
