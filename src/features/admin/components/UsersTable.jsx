import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Search, X, AlertTriangle, Snowflake, Ban, ShieldAlert, UserCheck, Loader2 } from "lucide-react";
import { getAllUsers } from "../services/admin.service";
import UserActionDialog from "./UserActionDialog";

const statusColors = {
  active: "bg-success/10 text-success border-success/20",
  frozen: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  banned: "bg-destructive/10 text-destructive border-destructive/20",
  flagged_for_review: "bg-warning/10 text-warning border-warning/20",
};

export default function UsersTable() {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionUser, setActionUser] = useState(null);
  const [actionType, setActionType] = useState(null);

  useEffect(() => {
    getAllUsers()
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(
    (u) =>
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleActionClick = (user, action) => {
    setActionUser(user);
    setActionType(action);
    setSelectedUser(null);
  };

  const handleActionComplete = () => {
    setActionUser(null);
    setActionType(null);
    getAllUsers().then(setUsers).catch(console.error);
  };

  const initials = (name) =>
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

  return (
    <div>
      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("admin.users_table.search_placeholder")}
          className="w-full h-10 pl-10 pr-4 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>

      {/* Cards grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">{t("admin.users_table.no_results")}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map((user) => (
            <button
              key={user.id}
              onClick={() => setSelectedUser(user)}
              className="text-left bg-card rounded-xl border border-border shadow-sm p-4 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">
                  {initials(user.full_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {user.full_name || "—"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{user.email || "—"}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] capitalize text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      {user.role?.replace("_", " ")}
                    </span>
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                        statusColors[user.account_status] || statusColors.active
                      }`}
                    >
                      {user.account_status || "active"}
                    </span>
                    <span className="text-[10px] text-muted-foreground ml-auto">
                      {t("admin.users_table.violations_count", { count: user.violationCount || 0 })}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Detail dialog */}
      {selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-sm mx-4 p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-foreground">{t("admin.users_table.details_title")}</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col items-center text-center mb-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg font-bold mb-2">
                {initials(selectedUser.full_name)}
              </div>
              <p className="text-sm font-bold text-foreground">{selectedUser.full_name || "—"}</p>
              <p className="text-xs text-muted-foreground">{selectedUser.email || "—"}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] capitalize bg-muted px-2 py-0.5 rounded text-muted-foreground">
                  {selectedUser.role?.replace("_", " ")}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                    statusColors[selectedUser.account_status] || statusColors.active
                  }`}
                >
                  {selectedUser.account_status || "active"}
                </span>
              </div>
            </div>

            <div className="bg-surface rounded-xl border border-border px-3 py-2 text-xs text-muted-foreground flex items-center justify-between mb-2">
              <span>{t("admin.users_table.severity_score")}</span>
              <span className="font-bold text-foreground">{selectedUser.severity_score ?? 0}</span>
            </div>
            <div className="bg-surface rounded-xl border border-border px-3 py-2 text-xs text-muted-foreground flex items-center justify-between mb-4">
              <span>{t("admin.users_table.violations")}</span>
              <span className="font-bold text-foreground">{selectedUser.violationCount || 0}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleActionClick(selectedUser, "warn")}
                className="h-9 rounded-xl text-xs font-semibold bg-warning/10 text-warning border border-warning/20 hover:bg-warning/20 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                {t("admin.users_table.warn")}
              </button>
              <button
                onClick={() => handleActionClick(selectedUser, "freeze")}
                className="h-9 rounded-xl text-xs font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20 hover:bg-blue-500/20 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Snowflake className="w-3.5 h-3.5" />
                {t("admin.users_table.freeze")}
              </button>
              <button
                onClick={() => handleActionClick(selectedUser, "ban")}
                className="h-9 rounded-xl text-xs font-semibold bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Ban className="w-3.5 h-3.5" />
                {t("admin.users_table.ban")}
              </button>
              {(selectedUser.account_status === "banned" || selectedUser.account_status === "frozen") && (
                <button
                  onClick={() => handleActionClick(selectedUser, "active")}
                  className="h-9 rounded-xl text-xs font-semibold bg-success/10 text-success border border-success/20 hover:bg-success/20 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  {t("admin.users_table.restore")}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {actionUser && actionType && (
        <UserActionDialog
          user={actionUser}
          actionType={actionType}
          onClose={() => {
            setActionUser(null);
            setActionType(null);
          }}
          onComplete={handleActionComplete}
        />
      )}
    </div>
  );
}
