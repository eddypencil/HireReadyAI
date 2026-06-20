import { useState, useEffect } from "react";
import { useUser } from "@/features/auth/context/user.context";
import { useTranslation } from "react-i18next";
import {
  getAllCompaniesWithStats,
  applyCompanyAction,
  processExpiredDeadlines,
} from "../services/admin.service";
import { supabase } from "@/shared/services/supabase";
import CompanyActionDialog from "../components/CompanyActionDialog";
import {
  Building2, Search, X, Loader2, AlertTriangle, Ban, ShieldAlert,
} from "lucide-react";

const statusColors = {
  active: "bg-success/10 text-success border-success/20",
  closing_warning: "bg-warning/10 text-warning border-warning/20",
  banned: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function AdminCompaniesPage() {
  const { profile } = useUser();
  const { t } = useTranslation();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [actionData, setActionData] = useState(null);
  const [actionType, setActionType] = useState("");
  const [stats, setStats] = useState({ total: 0, active: 0, closing: 0, banned: 0 });

  useEffect(() => {
    loadCompanies();
    processExpiredDeadlines().catch(() => {});
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("admin-companies-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "companies" }, () => { loadCompanies(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function loadCompanies() {
    setLoading(true);
    try {
      const data = await getAllCompaniesWithStats();
      setCompanies(data);
      setStats({
        total: data.length,
        active: data.filter((c) => c.account_status === "active").length,
        closing: data.filter((c) => c.account_status === "closing_warning").length,
        banned: data.filter((c) => c.account_status === "banned").length,
      });
    } catch (err) {
      console.error("Failed to load companies:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleApplyAction({ actionType, reason }) {
    if (!actionData) return;
    await applyCompanyAction({
      companyId: actionData.id,
      actionType,
      reason,
      adminId: profile?.id,
    });
    setActionData(null);
    setActionType("");
    setSelected(null);
    await loadCompanies();
  }

  const filtered = companies.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

  const statusLabel = (status) => {
    if (status === "closing_warning") return t("admin.companies.closing_label");
    return status || "active";
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("admin.companies.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("admin.companies.subtitle")}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-2xl font-bold text-foreground">
            {loading ? "..." : stats.total}
          </p>
          <p className="text-xs text-muted-foreground">{t("admin.companies.total")}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-2xl font-bold text-success">
            {loading ? "..." : stats.active}
          </p>
          <p className="text-xs text-muted-foreground">{t("admin.companies.active")}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-2xl font-bold text-warning">
            {loading ? "..." : stats.closing}
          </p>
          <p className="text-xs text-muted-foreground">{t("admin.companies.closing_warning")}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-2xl font-bold text-destructive">
            {loading ? "..." : stats.banned}
          </p>
          <p className="text-xs text-muted-foreground">{t("admin.companies.banned")}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("admin.companies.search_placeholder")}
          className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>

      {/* Cards grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">
          {t("admin.companies.no_results")}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelected(c)}
              className="text-left bg-card rounded-xl border border-border shadow-sm p-4 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {c.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {c.industry || "—"}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                        statusColors[c.account_status] || statusColors.active
                      }`}
                    >
                      {statusLabel(c.account_status)}
                      {c.closing_deadline && (
                        <span className="ml-0.5 opacity-70">
                          ({new Date(c.closing_deadline).toLocaleDateString()})
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {t("admin.companies.jobs_count", { active: c.activeJobs, total: c.totalJobs })}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {t("admin.companies.members_count", { count: c.memberCount })}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Detail dialog */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-sm mx-4 p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-foreground">
                {t("admin.companies.details_title")}
              </h3>
              <button
                onClick={() => setSelected(null)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col items-center text-center mb-4">
              <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2">
                <Building2 className="w-7 h-7" />
              </div>
              <p className="text-sm font-bold text-foreground">
                {selected.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {selected.industry || "—"}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                    statusColors[selected.account_status] || statusColors.active
                  }`}
                >
                  {statusLabel(selected.account_status)}
                  {selected.closing_deadline && (
                    <span className="ml-0.5 opacity-70">
                      {t("admin.companies.deadline", { date: new Date(selected.closing_deadline).toLocaleDateString() })}
                    </span>
                  )}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="bg-surface rounded-xl border border-border px-3 py-2 text-xs text-muted-foreground text-center">
                <p className="font-bold text-foreground text-sm">
                  {selected.activeJobs}
                </p>
                <p>{t("admin.companies.active_jobs")}</p>
              </div>
              <div className="bg-surface rounded-xl border border-border px-3 py-2 text-xs text-muted-foreground text-center">
                <p className="font-bold text-foreground text-sm">
                  {selected.totalJobs}
                </p>
                <p>{t("admin.companies.total_jobs")}</p>
              </div>
              <div className="bg-surface rounded-xl border border-border px-3 py-2 text-xs text-muted-foreground text-center">
                <p className="font-bold text-foreground text-sm">
                  {selected.memberCount}
                </p>
                <p>{t("admin.companies.members")}</p>
              </div>
              <div className="bg-surface rounded-xl border border-border px-3 py-2 text-xs text-muted-foreground text-center">
                <p
                  className={`font-bold text-sm ${
                    selected.severity_score >= 20
                      ? "text-destructive"
                      : "text-foreground"
                  }`}
                >
                  {selected.severity_score ?? 0}
                </p>
                <p>{t("admin.companies.score")}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setActionData(selected);
                  setActionType("warn");
                  setSelected(null);
                }}
                className="h-9 rounded-xl text-xs font-semibold bg-warning/10 text-warning border border-warning/20 hover:bg-warning/20 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                {t("admin.companies.warn")}
              </button>
              <button
                onClick={() => {
                  setActionData(selected);
                  setActionType("closing_warning");
                  setSelected(null);
                }}
                className="h-9 rounded-xl text-xs font-semibold bg-orange-500/10 text-orange-500 border border-orange-500/20 hover:bg-orange-500/20 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                {t("admin.companies.close")}
              </button>
              <button
                onClick={() => {
                  setActionData(selected);
                  setActionType("ban");
                  setSelected(null);
                }}
                className="h-9 rounded-xl text-xs font-semibold bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Ban className="w-3.5 h-3.5" />
                {t("admin.companies.ban")}
              </button>
              {selected.account_status !== "active" && (
                <button
                  onClick={() => {
                    setActionData(selected);
                    setActionType("active");
                    setSelected(null);
                  }}
                  className="h-9 rounded-xl text-xs font-semibold bg-success/10 text-success border border-success/20 hover:bg-success/20 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  {t("admin.companies.restore")}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action Dialog */}
      {actionData && (
        <CompanyActionDialog
          company={actionData}
          initialActionType={actionType}
          onClose={() => {
            setActionData(null);
            setActionType("");
          }}
          onApply={handleApplyAction}
        />
      )}
    </div>
  );
}
