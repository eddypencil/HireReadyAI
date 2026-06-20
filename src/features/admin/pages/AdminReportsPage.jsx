import { useState, useEffect } from "react";
import { useUser } from "@/features/auth/context/user.context";
import { useTranslation } from "react-i18next";
import { getReports, resolveReport, getQuestionWithAnswer, getStageWithEvaluation } from "../services/admin.service";
import { supabase } from "@/shared/services/supabase";
import { X, Check, ExternalLink } from "lucide-react";

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
  const { t } = useTranslation();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: "pending",
    type: "",
    severity: "",
  });
  const [selected, setSelected] = useState(null);
  const [showResolve, setShowResolve] = useState(false);
  const [entityData, setEntityData] = useState(null);
  const [entityLoading, setEntityLoading] = useState(false);
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
    const channel = supabase
      .channel(`admin-reports-${Date.now()}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reports" },
        loadReports
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
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

  useEffect(() => {
    if (!selected) { setEntityData(null); return; }
    const rt = selected.report_type;
    if (rt === "question") {
      setEntityLoading(true);
      getQuestionWithAnswer(selected.target_id)
        .then(setEntityData)
        .catch(() => setEntityData(null))
        .finally(() => setEntityLoading(false));
    } else if (rt === "interview") {
      setEntityLoading(true);
      getStageWithEvaluation(selected.target_id)
        .then(setEntityData)
        .catch(() => setEntityData(null))
        .finally(() => setEntityLoading(false));
    } else {
      setEntityData(null);
    }
  }, [selected?.id, selected?.report_type, selected?.target_id]);

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
        <h1 className="text-2xl font-bold text-foreground">{t("admin.reports.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("admin.reports.subtitle")}
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
            {s ? t(`admin.reports.${s}`) : t("admin.reports.all_statuses")}
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
            {s ? t(`admin.reports.${s}`) : t("admin.reports.all_severities")}
          </button>
        ))}
        <div className="w-px bg-border" />
        {["", "company", "user", "interview", "question"].map((typeVal) => (
          <button
            key={typeVal}
            onClick={() => setFilter((f) => ({ ...f, type: typeVal }))}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
              filter.type === typeVal
                ? "bg-primary/10 border-primary/30 text-primary"
                : "bg-background border-border text-muted-foreground hover:border-primary/30"
            }`}
          >
            {typeVal ? t(`admin.reports.${typeVal}`) : t("admin.reports.all_types")}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-2">
        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            {t("admin.reports.loading")}
          </p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            {t("admin.reports.no_reports")}
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
              className={`w-full text-start bg-card rounded-xl border shadow-sm p-4 transition-all hover:shadow-md cursor-pointer ${
                selected?.id === report.id
                  ? "border-primary ring-1 ring-primary/30"
                  : "border-border"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-muted text-muted-foreground uppercase">
                      {t("admin.reports." + report.report_type)}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        severityColors[report.severity] || severityColors.medium
                      }`}
                    >
                      {t("admin.reports." + report.severity)} (+{severityScores[report.severity] || 0}
                      )
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        statusColors[report.status] || statusColors.pending
                      }`}
                    >
                      {t("admin.reports." + report.status)}
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
                {t("admin.reports.details_title")}
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
                    {t("admin.reports.type_label")}:
                  </span>{" "}
                  <span className="text-foreground capitalize">
                    {selected.report_type}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground">
                    {t("admin.reports.severity")}:
                  </span>{" "}
                  <span className="text-foreground">
                    {resolveData.severityOverride || selected.severity}
                    {resolveData.severityOverride && (
                      <span className="text-muted-foreground ms-1">
                        ({t("admin.reports.severity")}: {selected.severity})
                      </span>
                    )}
                    (+
                    {severityScores[
                      resolveData.severityOverride || selected.severity
                    ] || 0}
                    {t("admin.reports.pts")})
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground">
                    {t("admin.technical_issues.status_label")}:
                  </span>{" "}
                  <span className="text-foreground">{selected.status}</span>
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground">
                    {t("admin.reports.date")}:
                  </span>{" "}
                  <span className="text-foreground">
                    {new Date(selected.created_at).toLocaleDateString()}
                  </span>
                </div>
                {(() => {
                  const rt = selected.report_type;
                  const td = selected.target_details || {};

                  if (rt === "user") {
                    return (
                      <div className="col-span-2 bg-background rounded-xl border border-border p-3">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary uppercase">{t("admin.reports.user")}</span>
                        <p className="text-sm font-semibold text-foreground mt-1">{td.full_name || t("admin.reports.user")}</p>
                        <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{selected.target_id}</p>
                        <a href={`/admin/users/${selected.target_id}`} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                          {t("admin.reports.view_user_profile")} <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    );
                  }

                  if (rt === "company") {
                    return (
                      <div className="col-span-2 bg-background rounded-xl border border-border p-3">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary uppercase">{t("admin.reports.company")}</span>
                        <p className="text-sm font-semibold text-foreground mt-1">{td.name || t("admin.reports.company")}</p>
                        <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{selected.target_id}</p>
                        <a href={`/company/${selected.target_id}`} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                          {t("admin.reports.view_company_profile")} <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    );
                  }

                  if (rt === "question") {
                    if (entityLoading) {
                      return (
                        <div className="col-span-2 bg-background rounded-xl border border-border p-3 text-center">
                          <p className="text-xs text-muted-foreground">{t("admin.reports.loading")}</p>
                        </div>
                      );
                    }
                    if (!entityData) {
                      return (
                        <div className="col-span-2 bg-background rounded-xl border border-border p-3">
                          <p className="text-xs text-muted-foreground">{t("admin.reports.question_unavailable")}</p>
                        </div>
                      );
                    }
                    const q = entityData;
                    const ans = Array.isArray(q.application_answers) ? q.application_answers[0] : q.application_answers;
                    const qTypeConfig = {
                      text: { labelKey: "admin.reports.qtype_text", color: "text-sky-500 bg-sky-500/10" },
                      code: { labelKey: "admin.reports.qtype_code", color: "text-indigo-500 bg-indigo-500/10" },
                      multiple_choice: { labelKey: "admin.reports.qtype_multiple_choice", color: "text-amber-500 bg-amber-500/10" },
                      video: { labelKey: "admin.reports.qtype_video", color: "text-red-500 bg-red-500/10" },
                    };
                    const qc = qTypeConfig[q.question_type] || { label: q.question_type, color: "text-muted-foreground bg-muted" };
                    const options = q.generation_context?.options || [];
                    return (
                      <div className="col-span-2 bg-background rounded-xl border border-border p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${qc.color}`}>{qc.labelKey ? t(qc.labelKey) : qc.label}</span>
                          {ans?.score != null && (
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              ans.score >= 80 ? "text-success bg-success/10" : ans.score >= 60 ? "text-primary bg-primary/10" : "text-destructive bg-destructive/10"
                            }`}>{Math.round(ans.score)}/100</span>
                          )}
                        </div>
                        <p className="text-sm text-foreground">{q.question_text}</p>

                        {q.question_type === "text" && ans?.answer_text && (
                          <div className="bg-card rounded-lg border border-border p-3">
                            <p className="text-[10px] font-semibold text-muted-foreground mb-1">{t("admin.reports.answer_label")}</p>
                            <p className="text-xs text-foreground whitespace-pre-wrap">{ans.answer_text}</p>
                          </div>
                        )}

                        {q.question_type === "code" && ans?.answer_text && (
                          <pre className="bg-[#0f172a] rounded-lg p-3 text-[11px] text-slate-200 overflow-x-auto font-mono">{ans.answer_text}</pre>
                        )}

                        {q.question_type === "multiple_choice" && (
                          <div className="space-y-1">
                            {options.map((opt, idx) => {
                              const letter = String.fromCharCode(65 + idx);
                              const isSelected = ans?.answer_text === opt;
                              return (
                                <div key={idx} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs ${isSelected ? "border-primary bg-primary/5" : "border-border"}`}>
                                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${isSelected ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>{letter}</span>
                                  <span className="flex-1 text-foreground">{opt}</span>
                                  {isSelected && <span className="text-primary font-semibold">{t("admin.reports.selected")}</span>}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {q.question_type === "video" && (
                          <p className="text-xs text-muted-foreground italic">{t("admin.reports.video_available")}</p>
                        )}

                        {(ans?.feedback || ans?.strengths?.length > 0 || ans?.weaknesses?.length > 0) && (
                          <div className="bg-accent/5 border border-accent/20 rounded-lg p-3">
                            <p className="text-[10px] font-bold text-accent uppercase tracking-wider mb-2">{t("admin.reports.ai_feedback")}</p>
                            {ans.feedback && <p className="text-xs text-foreground mb-2">{ans.feedback}</p>}
                            {ans.strengths?.map((s, i) => (
                              <p key={`s-${i}`} className="text-xs text-muted-foreground flex items-start gap-1"><span className="text-success font-bold">+</span> {s}</p>
                            ))}
                            {ans.weaknesses?.map((w, i) => (
                              <p key={`w-${i}`} className="text-xs text-muted-foreground flex items-start gap-1"><span className="text-destructive font-bold">-</span> {w}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }

                  if (rt === "interview") {
                    if (entityLoading) {
                      return (
                        <div className="col-span-2 bg-background rounded-xl border border-border p-3 text-center">
                          <p className="text-xs text-muted-foreground">{t("admin.reports.loading")}</p>
                        </div>
                      );
                    }
                    if (!entityData) {
                      return (
                        <div className="col-span-2 bg-background rounded-xl border border-border p-3">
                          <p className="text-xs text-muted-foreground">{t("admin.reports.interview_unavailable")}</p>
                        </div>
                      );
                    }
                    const s = entityData;
                    const ev = Array.isArray(s.application_stage_evaluations) ? s.application_stage_evaluations[0] : s.application_stage_evaluations;
                    const rs = s.recruitment_stages;
                    return (
                      <div className="col-span-2 bg-background rounded-xl border border-border p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary uppercase">{t("admin.reports.interview")}</span>
                          {s.score != null && (
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              s.score >= 80 ? "text-success bg-success/10" : s.score >= 60 ? "text-primary bg-primary/10" : "text-warning bg-warning/10"
                            }`}>{Math.round(s.score)}/100</span>
                          )}
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            s.status === "passed" ? "text-success bg-success/10" : s.status === "failed" ? "text-destructive bg-destructive/10" : "text-muted-foreground bg-muted"
                          }`}>{s.status?.charAt(0).toUpperCase() + s.status?.slice(1)}</span>
                        </div>
                        <p className="text-sm font-semibold text-foreground">{rs?.name || "Stage"}</p>
                        <p className="text-xs text-muted-foreground capitalize">{rs?.stage_type?.replace(/_/g, " ") || ""}</p>

                        {ev && (
                          <div className="bg-accent/5 border border-accent/20 rounded-lg p-3">
                            <p className="text-[10px] font-bold text-accent uppercase tracking-wider mb-2">{t("admin.reports.evaluation")}</p>
                            {ev.recommendation && (
                              <p className="text-xs text-muted-foreground mb-1">{t("admin.reports.recommendation")}: <span className={`font-semibold ${
                                ev.recommendation === "proceed" ? "text-success" : ev.recommendation === "review" ? "text-warning" : "text-destructive"
                              }`}>{ev.recommendation?.charAt(0).toUpperCase() + ev.recommendation?.slice(1)}</span></p>
                            )}
                            {ev.reasoning && <p className="text-xs text-foreground mb-2">{ev.reasoning}</p>}
                            {ev.strengths?.map((s, i) => (
                              <p key={`s-${i}`} className="text-xs text-muted-foreground flex items-start gap-1"><span className="text-success font-bold">+</span> {s}</p>
                            ))}
                            {ev.weaknesses?.map((w, i) => (
                              <p key={`w-${i}`} className="text-xs text-muted-foreground flex items-start gap-1"><span className="text-destructive font-bold">-</span> {w}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div className="col-span-2">
                      <span className="font-semibold text-muted-foreground">{t("admin.reports.target")}:</span>{" "}
                      <span className="text-foreground font-mono text-[10px]">{selected.target_id}</span>
                    </div>
                  );
                })()}
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground">
                  {t("admin.reports.subject")}
                </p>
                <p className="text-sm text-foreground">{selected.subject}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground">
                  {t("admin.reports.description")}
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
                      {t("admin.reports.resolve")}
                    </button>
                    <button
                      onClick={async () => {
                        await resolveReport({
                          reportId: selected.id,
                          status: "dismissed",
                          reviewedBy: profile?.id,
                          resolutionNotes: t("admin.reports.dismiss"),
                        });
                        setSelected(null);
                        loadReports();
                      }}
                      className="flex-1 h-10 rounded-xl text-xs font-semibold bg-muted text-muted-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                    >
                      {t("admin.reports.dismiss")}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 border-t border-border pt-4">
                    <h4 className="text-xs font-bold text-foreground">
                      {t("admin.reports.resolution_notes")}
                    </h4>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        {t("admin.reports.severity_label")}{" "}
                        <span className="text-muted-foreground font-normal">
                          {t("admin.reports.overrides_original")}
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
                          {t("admin.reports.keep_original", { severity: selected.severity })}
                        </option>
                        <option value="low">{t("admin.reports.low")} (+1pt)</option>
                        <option value="medium">{t("admin.reports.medium")} (+3pts)</option>
                        <option value="high">{t("admin.reports.high")} (+5pts)</option>
                        <option value="critical">{t("admin.reports.critical")} (+10pts)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        {t("admin.reports.action_taken")}
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
                        <option value="">{t("admin.reports.none_option")}</option>
                        <option value="warning">{t("admin.warn")}</option>
                        <option value="freeze">{t("admin.freeze")}</option>
                        <option value="ban">{t("admin.ban")}</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        {t("admin.reports.score_assignment")}
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
                        <option value="">{t("admin.reports.score_platform")}</option>
                        <option value="user">{t("admin.reports.score_user")}</option>
                        <option value="company">{t("admin.reports.score_company")}</option>
                      </select>
                      {resolveData.scoredEntityType === "platform" && (
                        <p className="text-[10px] text-muted-foreground">
                          {t("admin.reports.auto_creates_issue")}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        {t("admin.reports.resolution_notes")}
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
                        {t("admin.cancel")}
                      </button>
                      <button
                        onClick={handleResolve}
                        className="flex-1 h-10 rounded-xl text-xs font-semibold text-white bg-success hover:bg-success/90 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        {t("admin.confirm")}
                      </button>
                    </div>
                  </div>
                )
              ) : (
                <div className="bg-muted rounded-xl p-3">
                  <p className="text-xs font-semibold text-muted-foreground">
                    {t("admin.reports.resolution_notes")}
                  </p>
                  <p className="text-xs text-foreground mt-1">
                    {selected.resolution_notes || t("admin.reports.none_option")}
                  </p>
                  {selected.action_taken && (
                    <p className="text-xs text-foreground mt-1">
                      {t("admin.reports.action_taken")}: {selected.action_taken}
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
