import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getPendingAppeals, getResolvedAppeals } from "../services/admin.service";
import { supabase } from "@/shared/services/supabase";
import AppealChat from "../components/AppealChat";
import { MessageCircle, Loader2, Clock } from "lucide-react";

const statusColors = {
  pending_review: "bg-warning/10 text-warning border-warning/20",
  approved: "bg-success/10 text-success border-success/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function AdminAppealsPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState("users");
  const [view, setView] = useState("pending"); // "pending" | "history"
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [historyData, setHistoryData] = useState({ users: [], companies: [] });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const loadAppeals = async () => {
    setLoading(true);
    try {
      const data = await getPendingAppeals();
      setUsers(data.users);
      setCompanies(data.companies);
    } catch (err) {
      console.error("Failed to load appeals:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await getResolvedAppeals();
      setHistoryData(data);
    } catch (err) {
      console.error("Failed to load appeal history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view === "pending") {
      loadAppeals();
    } else {
      loadHistory();
    }
  }, [view]);

  useEffect(() => {
    loadAppeals();

    const channel = supabase
      .channel(`appeals-list-${Date.now()}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: "appeal_status=eq.pending_review",
        },
        () => loadAppeals(),
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "companies",
          filter: "appeal_status=eq.pending_review",
        },
        () => loadAppeals(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const list = view === "history"
    ? (tab === "users" ? historyData.users : historyData.companies)
    : (tab === "users" ? users : companies);

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("admin.appeals.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("admin.appeals.subtitle")}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => {
            setView("pending");
            setTab("users");
            setSelected(null);
          }}
          className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
            view === "pending"
              ? "bg-primary/10 border-primary/30 text-primary"
              : "bg-background border-border text-muted-foreground hover:border-primary/30"
          }`}
        >
          {t("admin.appeals.pending_tab")} {users.length + companies.length > 0 && `(${users.length + companies.length})`}
        </button>
        <button
          onClick={() => {
            setView("history");
            setTab("users");
            setSelected(null);
          }}
          className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer flex items-center gap-1.5 ${
            view === "history"
              ? "bg-primary/10 border-primary/30 text-primary"
              : "bg-background border-border text-muted-foreground hover:border-primary/30"
          }`}
        >
          <Clock className="w-3 h-3" />
          {t("admin.appeals.history_tab")}
        </button>
      </div>

      {view === "pending" && (
        <div className="flex gap-2">
          <button
            onClick={() => {
              setTab("users");
              setSelected(null);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
              tab === "users"
                ? "bg-primary/10 border-primary/30 text-primary"
                : "bg-background border-border text-muted-foreground hover:border-primary/30"
            }`}
          >
            {t("admin.appeals.user_appeals")} {users.length > 0 && `(${users.length})`}
          </button>
          <button
            onClick={() => {
              setTab("companies");
              setSelected(null);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
              tab === "companies"
                ? "bg-primary/10 border-primary/30 text-primary"
                : "bg-background border-border text-muted-foreground hover:border-primary/30"
            }`}
          >
            {t("admin.appeals.company_appeals")} {companies.length > 0 && `(${companies.length})`}
          </button>
        </div>
      )}

      {view === "history" && (
        <div className="flex gap-2">
          <button
            onClick={() => {
              setTab("users");
              setSelected(null);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
              tab === "users"
                ? "bg-primary/10 border-primary/30 text-primary"
                : "bg-background border-border text-muted-foreground hover:border-primary/30"
            }`}
          >
            {t("admin.appeals.user_appeals")} {historyData.users.length > 0 && `(${historyData.users.length})`}
          </button>
          <button
            onClick={() => {
              setTab("companies");
              setSelected(null);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
              tab === "companies"
                ? "bg-primary/10 border-primary/30 text-primary"
                : "bg-background border-border text-muted-foreground hover:border-primary/30"
            }`}
          >
            {t("admin.appeals.company_appeals")} {historyData.companies.length > 0 && `(${historyData.companies.length})`}
          </button>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : list.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-40" />
          <p className="text-sm text-muted-foreground">{t("admin.appeals.no_pending")}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {list.map((item) => {
            const displayName = item.full_name || item.name;
            const deadline = item.appeal_deadline || item.closing_deadline;
            return (
              <button
                key={item.id}
                onClick={() =>
                  setSelected({
                    entityType: tab === "users" ? "profile" : "company",
                    entity: item,
                  })
                }
                className="w-full text-start bg-card rounded-xl border border-border shadow-sm p-4 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-foreground">
                        {displayName}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusColors[item.appeal_status] || statusColors.pending_review}`}
                      >
                        {item.appeal_status}
                      </span>
                    </div>
                    {item.suspension_reason && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {t("admin.appeals.reason", { reason: item.suspension_reason })}
                      </p>
                    )}
                    {item.appeal_message && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {t("admin.appeals.appeal_text", { message: item.appeal_message })}
                      </p>
                    )}
                  </div>
                  <div className="text-end shrink-0">
                    {deadline && (
                      <p className="text-[10px] text-muted-foreground">
                        {t("admin.appeals.deadline", { date: new Date(deadline).toLocaleDateString() })}
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {item.email || ""}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Chat Modal */}
      {selected && (
        <AppealChat
          entityType={selected.entityType}
          entity={selected.entity}
          onClose={() => setSelected(null)}
          onResolved={() => {
            setSelected(null);
            loadAppeals();
          }}
        />
      )}
    </div>
  );
}
