import { useState, useEffect } from "react";
import { useUser } from "@/features/auth/context/user.context";
import { getReports, resolveReport } from "../services/admin.service";
import { X, Check } from "lucide-react";

const severityColors = {
  low: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  medium: "bg-warning/10 text-warning border-warning/20",
  high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  critical: "bg-destructive/10 text-destructive border-destructive/20",
};

const statusColors = {
  pending: "bg-muted text-muted-foreground border-border",
  investigating: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  resolved: "bg-success/10 text-success border-success/20",
  dismissed: "bg-destructive/10 text-destructive border-destructive/20",
};

const severityScores = { low: 1, medium: 3, high: 5, critical: 10 };

export default function AdminReportsPage() {
  const { profile } = useUser();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: "pending",
    type: "",
    severity: "",
  });
  const [selected, setSelected] = useState(null);
  const [showResolve, setShowResolve] = useState(false);
  const [resolveData, setResolveData] = useState({
    status: "resolved",
    actionTaken: "",
    resolutionNotes: "",
    scoredEntityType: "",
    scoredEntityId: "",
    severityOverride: "",
  });

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    setLoading(true);
    try {
      const data = await getReports({});
      setReports(data);
    } catch (err) {
      console.error("Failed to load reports:", err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = reports.filter((r) => {
    if (filter.status && r.status !== filter.status) return false;
    if (filter.type && r.report_type !== filter.type) return false;
    if (filter.severity && r.severity !== filter.severity) return false;
    return true;
  });

  async function handleResolve() {
    if (!selected) return;
    try {
      await resolveReport({
        reportId: selected.id,
        status: resolveData.status,
        reviewedBy: profile?.id,
        resolutionNotes: resolveData.resolutionNotes,
        actionTaken: resolveData.actionTaken || null,
        scoredEntityType: resolveData.scoredEntityType || null,
        scoredEntityId: resolveData.scoredEntityId || null,
        severityOverride: resolveData.severityOverride || null,
      });
      setShowResolve(false);
      setSelected(null);
      loadReports();
    } catch (err) {
      console.error("Failed to resolve report:", err);
    }
  }

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reports</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review and resolve user-submitted reports
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {["", "pending", "investigating", "resolved", "dismissed"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter((f) => ({ ...f, status: s }))}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
              filter.status === s
                ? "bg-primary/10 border-primary/30 text-primary"
                : "bg-background border-border text-muted-foreground hover:border-primary/30"
            }`}
          >
            {s || "All"}
          </button>
        ))}
        <div className="w-px bg-border" />
        {["", "low", "medium", "high", "critical"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter((f) => ({ ...f, severity: s }))}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
              filter.severity === s
                ? "bg-primary/10 border-primary/30 text-primary"
                : "bg-background border-border text-muted-foreground hover:border-primary/30"
            }`}
          >
            {s || "All Severity"}
          </button>
        ))}
        <div className="w-px bg-border" />
        {["", "company", "user", "interview", "question"].map((t) => (
          <button
            key={t}
            onClick={() => setFilter((f) => ({ ...f, type: t }))}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
              filter.type === t
                ? "bg-primary/10 border-primary/30 text-primary"
                : "bg-background border-border text-muted-foreground hover:border-primary/30"
            }`}
          >
            {t || "All Types"}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-2">
        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Loading...
          </p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No reports found
          </p>
        ) : (
          filtered.map((report) => (
            <button
              key={report.id}
              onClick={() => {
                setSelected(report);
                setResolveData({
                  status: "resolved",
                  actionTaken: "",
                  resolutionNotes: "",
                  scoredEntityType: "",
                  scoredEntityId: "",
                  severityOverride: "",
                });
              }}
              className={`w-full text-left bg-card rounded-xl border shadow-sm p-4 transition-all hover:shadow-md cursor-pointer ${
                selected?.id === report.id
                  ? "border-primary ring-1 ring-primary/30"
                  : "border-border"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-muted text-muted-foreground uppercase">
                      {report.report_type}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        severityColors[report.severity] || severityColors.medium
                      }`}
                    >
                      {report.severity} (+{severityScores[report.severity] || 0}
                      )
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        statusColors[report.status] || statusColors.pending
                      }`}
                    >
                      {report.status}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-foreground truncate">
                    {report.subject}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {report.description}
                  </p>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0">
                  {new Date(report.created_at).toLocaleDateString()}
                </span>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Detail Panel */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card z-10">
              <h3 className="text-sm font-bold text-foreground">
                Report Details
              </h3>
              <button
                onClick={() => {
                  setSelected(null);
                  setShowResolve(false);
                }}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="font-semibold text-muted-foreground">
                    Type:
                  </span>{" "}
                  <span className="text-foreground capitalize">
                    {selected.report_type}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground">
                    Severity:
                  </span>{" "}
                  <span className="text-foreground">
                    {resolveData.severityOverride || selected.severity}
                    {resolveData.severityOverride && (
                      <span className="text-muted-foreground ml-1">
                        (was {selected.severity})
                      </span>
                    )}
                    (+
                    {severityScores[
                      resolveData.severityOverride || selected.severity
                    ] || 0}
                    pts)
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground">
                    Status:
                  </span>{" "}
                  <span className="text-foreground">{selected.status}</span>
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground">
                    Date:
                  </span>{" "}
                  <span className="text-foreground">
                    {new Date(selected.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="font-semibold text-muted-foreground">
                    Target ID:
                  </span>{" "}
                  <span className="text-foreground font-mono text-[10px]">
                    {selected.target_id}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground">
                  Subject
                </p>
                <p className="text-sm text-foreground">{selected.subject}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground">
                  Description
                </p>
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {selected.description}
                </p>
              </div>

              {selected.status === "pending" ||
              selected.status === "investigating" ? (
                !showResolve ? (
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setShowResolve(true)}
                      className="flex-1 h-10 rounded-xl text-xs font-semibold bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer"
                    >
                      Resolve
                    </button>
                    <button
                      onClick={async () => {
                        await resolveReport({
                          reportId: selected.id,
                          status: "dismissed",
                          reviewedBy: profile?.id,
                          resolutionNotes: "Dismissed without action",
                        });
                        setSelected(null);
                        loadReports();
                      }}
                      className="flex-1 h-10 rounded-xl text-xs font-semibold bg-muted text-muted-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 border-t border-border pt-4">
                    <h4 className="text-xs font-bold text-foreground">
                      Resolution
                    </h4>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        Severity{" "}
                        <span className="text-muted-foreground font-normal">
                          (overrides original)
                        </span>
                      </label>
                      <select
                        value={resolveData.severityOverride}
                        onChange={(e) =>
                          setResolveData((d) => ({
                            ...d,
                            severityOverride: e.target.value,
                          }))
                        }
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                      >
                        <option value="">
                          Keep original ({selected.severity})
                        </option>
                        <option value="low">Low (+1pt)</option>
                        <option value="medium">Medium (+3pts)</option>
                        <option value="high">High (+5pts)</option>
                        <option value="critical">Critical (+10pts)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        Action Taken
                      </label>
                      <select
                        value={resolveData.actionTaken}
                        onChange={(e) =>
                          setResolveData((d) => ({
                            ...d,
                            actionTaken: e.target.value,
                          }))
                        }
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                      >
                        <option value="">None</option>
                        <option value="warning">Warning</option>
                        <option value="freeze">Freeze</option>
                        <option value="ban">Ban</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        Score Assignment
                      </label>
                      <select
                        value={resolveData.scoredEntityType}
                        onChange={(e) =>
                          setResolveData((d) => ({
                            ...d,
                            scoredEntityType: e.target.value,
                            scoredEntityId: e.target.value
                              ? selected.target_id
                              : "",
                          }))
                        }
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                      >
                        <option value="">No score (platform issue)</option>
                        <option value="user">Score → User</option>
                        <option value="company">Score → Company</option>
                      </select>
                      {resolveData.scoredEntityType === "platform" && (
                        <p className="text-[10px] text-muted-foreground">
                          Auto-creates a technical issue
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        Resolution Notes
                      </label>
                      <textarea
                        value={resolveData.resolutionNotes}
                        onChange={(e) =>
                          setResolveData((d) => ({
                            ...d,
                            resolutionNotes: e.target.value,
                          }))
                        }
                        rows={3}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowResolve(false)}
                        className="flex-1 h-10 rounded-xl text-xs font-semibold bg-muted text-muted-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleResolve}
                        className="flex-1 h-10 rounded-xl text-xs font-semibold text-white bg-success hover:bg-success/90 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Confirm
                      </button>
                    </div>
                  </div>
                )
              ) : (
                <div className="bg-muted rounded-xl p-3">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Resolution Notes
                  </p>
                  <p className="text-xs text-foreground mt-1">
                    {selected.resolution_notes || "None"}
                  </p>
                  {selected.action_taken && (
                    <p className="text-xs text-foreground mt-1">
                      Action: {selected.action_taken}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
