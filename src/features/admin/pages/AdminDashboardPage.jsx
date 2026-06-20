import { useState, useEffect } from "react";
import { useUser } from "@/features/auth/context/user.context";
import { useTranslation } from "react-i18next";
import { Shield, Users, Briefcase, AlertTriangle, Building2, MessageCircle } from "lucide-react";
import { getUserCountsByRole, getFlaggedEntities, getAllCompaniesWithStats, getPendingAppeals } from "../services/admin.service";
import UsersTable from "../components/UsersTable";
import CreateAdminDialog from "../components/CreateAdminDialog";

export default function AdminDashboardPage() {
  const { profile } = useUser();
  const { t } = useTranslation();
  const [stats, setStats] = useState({ recruiter: 0, applicant: 0 });
  const [flagged, setFlagged] = useState({ users: [], companies: [] });
  const [companyCount, setCompanyCount] = useState(0);
  const [appealCount, setAppealCount] = useState(0);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [counts, flaggedData, companies, appeals] = await Promise.all([
          getUserCountsByRole(),
          getFlaggedEntities(),
          getAllCompaniesWithStats(),
          getPendingAppeals(),
        ]);
        setStats(counts);
        setFlagged(flaggedData);
        setCompanyCount(companies.length);
        setAppealCount(appeals.users.length + appeals.companies.length);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t("admin.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("admin.welcome", { name: profile?.fullName || t("admin.unknown_user") })}
          </p>
        </div>
        <button
          onClick={() => setShowCreateAdmin(true)}
          className="h-10 px-4 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Shield className="w-4 h-4" />
          {t("admin.create_admin.title")}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        <div className="bg-card rounded-xl border border-border shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">
                {loading ? "..." : stats.applicant + stats.recruiter}
              </p>
              <p className="text-[10px] text-muted-foreground">{t("admin.total_users")}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">
                {loading ? "..." : stats.recruiter}
              </p>
              <p className="text-[10px] text-muted-foreground">{t("admin.recruiters")}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-green-500" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">
                {loading ? "..." : stats.applicant}
              </p>
              <p className="text-[10px] text-muted-foreground">{t("admin.applicants")}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-destructive" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">
                {loading
                  ? "..."
                  : flagged.users.length + flagged.companies.length}
              </p>
              <p className="text-[10px] text-muted-foreground">{t("admin.flagged")}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-purple-500" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">
                {loading ? "..." : companyCount}
              </p>
              <p className="text-[10px] text-muted-foreground">{t("admin.companies.title")}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-warning/10 flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-warning" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">
                {loading ? "..." : appealCount}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {t("admin.pending_appeals")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <UsersTable />

      {/* Create Admin Dialog */}
      {showCreateAdmin && (
        <CreateAdminDialog onClose={() => setShowCreateAdmin(false)} />
      )}
    </div>
  );
}
