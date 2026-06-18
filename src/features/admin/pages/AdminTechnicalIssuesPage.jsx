import { useState, useEffect } from "react";
import { useUser } from "@/features/auth/context/user.context";
import { useTranslation } from "react-i18next";
import { getTechnicalIssues, updateTechnicalIssueStatus } from "../services/admin.service";
import { X, Loader2, Bug } from "lucide-react";

const severityColors = {
  low: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  medium: "bg-warning/10 text-warning border-warning/20",
  high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  critical: "bg-destructive/10 text-destructive border-destructive/20",
};

const statusColors = {
  pending: "bg-muted text-muted-foreground border-border",
  in_progress: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  resolved: "bg-success/10 text-success border-success/20",
};

export default function AdminTechnicalIssuesPage() {
  const { profile } = useUser();
  const { t } = useTranslation();

  const typeLabels = {
    ai_evaluation: t("admin.technical_issues.ai_evaluation"),
    wrong_question: t("admin.technical_issues.wrong_question"),
    system_bug: t("admin.technical_issues.system_bug"),
    ui_issue: t("admin.technical_issues.ui_issue"),
    performance: t("admin.technical_issues.performance"),
    other: t("admin.technical_issues.other"),
  };
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showResolved, setShowResolved] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState(null);
  const [editStatus, setEditStatus] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadIssues();
  }, []);

  async function loadIssues() {
    setLoading(true);
    try {
      const data = await getTechnicalIssues({});
      setIssues(data);
    } catch (err) {
      console.error("Failed to load technical issues:", err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = issues.filter((i) => {
    if (!showResolved && i.status === "resolved") return false;
    if (statusFilter && i.status !== statusFilter) return false;
    return true;
  });

  async function handleSave() {
    if (!selected) return;
    setSaving(true);
    try {
      await updateTechnicalIssueStatus({
        id: selected.id,
        status: editStatus,
        resolutionNotes: editNotes,
      });
      setSelected(null);
      loadIssues();
    } catch (err) {
      console.error("Failed to update:", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("admin.technical_issues.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("admin.technical_issues.subtitle")}
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {["", "pending", "in_progress", "resolved"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
              statusFilter === s
                ? "bg-primary/10 border-primary/30 text-primary"
                : "bg-background border-border text-muted-foreground hover:border-primary/30"
            }`}
          >
            {s ? t(`admin.technical_issues.${s}`) : t("admin.technical_issues.all")}
          </button>
        ))}
        <div className="w-px h-6 bg-border" />
        <button
          onClick={() => setShowResolved(!showResolved)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
            showResolved
              ? "bg-success/10 border-success/30 text-success"
              : "bg-background border-border text-muted-foreground hover:border-success/30"
          }`}
        >
          {showResolved ? t("admin.technical_issues.hide_resolved") : t("admin.technical_issues.show_resolved")}
        </button>
      </div>

      {/* List */}
      <div className="space-y-2">
        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            {t("admin.technical_issues.loading")}
          </p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            {t("admin.technical_issues.empty")}
          </p>
        ) : (
          filtered.map((issue) => (
            <button
              key={issue.id}
              onClick={() => {
                setSelected(issue);
                setEditStatus(issue.status);
                setEditNotes(issue.resolution_notes || "");
              }}
              className={`w-full text-start bg-card rounded-xl border p-4 transition-all hover:shadow-sm cursor-pointer ${
                selected?.id === issue.id
                  ? "border-primary ring-1 ring-primary/30"
                  : "border-border"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-muted text-muted-foreground">
                      {typeLabels[issue.issue_type] || issue.issue_type}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        severityColors[issue.severity] || severityColors.medium
                      }`}
                    >
                      {t("admin.reports." + issue.severity)}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        statusColors[issue.status] || statusColors.pending
                      }`}
                    >
                      {t("admin.technical_issues." + issue.status)}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-foreground truncate">
                    {issue.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {issue.description}
                  </p>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0">
                  {new Date(issue.created_at).toLocaleDateString()}
                </span>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Edit Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
          <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Bug className="w-4 h-4 text-destructive" />
                <h3 className="text-sm font-bold text-foreground">
                  {t("admin.technical_issues.edit_title")}
                </h3>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="bg-muted rounded-xl p-3 space-y-1">
                <p className="text-sm font-semibold text-foreground">
                  {selected.title}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {selected.description}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  {t("admin.technical_issues.status_label")}
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="pending">{t("admin.technical_issues.pending")}</option>
                  <option value="in_progress">{t("admin.technical_issues.in_progress")}</option>
                  <option value="resolved">{t("admin.technical_issues.resolved")}</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  {t("admin.reports.resolution_notes")}
                </label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={4}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                  placeholder={t("admin.technical_issues.resolution_notes_placeholder")}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setSelected(null)}
                  className="flex-1 h-10 rounded-xl text-xs font-semibold bg-muted text-muted-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                >
                  {t("admin.technical_issues.cancel")}
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 h-10 rounded-xl text-xs font-semibold text-white bg-primary hover:bg-primary-hover transition-colors disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {saving ? t("admin.technical_issues.saving") : t("admin.technical_issues.save")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
