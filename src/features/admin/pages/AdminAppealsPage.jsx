import { useState, useEffect } from "react";
import { getPendingAppeals } from "../services/admin.service";
import { supabase } from "@/shared/services/supabase";
import AppealChat from "../components/AppealChat";
import { MessageCircle, Loader2 } from "lucide-react";

const statusColors = {
  pending_review: "bg-warning/10 text-warning border-warning/20",
  approved: "bg-success/10 text-success border-success/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function AdminAppealsPage() {
  const [tab, setTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
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

  const list = tab === "users" ? users : companies;

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Appeals</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review and respond to ban appeals and company closure appeals
        </p>
      </div>

      {/* Tabs */}
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
          User Appeals {users.length > 0 && `(${users.length})`}
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
          Company Appeals {companies.length > 0 && `(${companies.length})`}
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : list.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-40" />
          <p className="text-sm text-muted-foreground">No pending appeals</p>
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
                className="w-full text-left bg-card rounded-xl border border-border shadow-sm p-4 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-foreground">
                        {displayName}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusColors.pending_review}`}
                      >
                        {item.appeal_status}
                      </span>
                    </div>
                    {item.suspension_reason && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        Reason: {item.suspension_reason}
                      </p>
                    )}
                    {item.appeal_message && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        Appeal: {item.appeal_message}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    {deadline && (
                      <p className="text-[10px] text-muted-foreground">
                        Deadline: {new Date(deadline).toLocaleDateString()}
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
