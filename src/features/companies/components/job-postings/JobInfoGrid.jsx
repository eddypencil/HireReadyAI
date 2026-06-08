//src\features\companies\components\job-postings\JobInfoGrid.jsx
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  BanknoteIcon,
  Calendar,
  TrendingUp,
  Monitor,
  MapPin,
  Wand2,
  User,
  ChevronRight,
  ExternalLink,
  Copy,
} from "lucide-react";
import { useTranslation } from "react-i18next";

export default function JobInfoGrid({
  selectedJob,
  isEditing,
  editForm,
  setEditForm,
  company,
}) {
  const navigate = useNavigate();
  const clean = (str) => {
    if (!str) return str;
    return String(str)
      .replace(/[^a-zA-Z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };
  const { t } = useTranslation();
  return (
    <div className="bg-background border border-border/60 rounded-xl shadow-xs p-5 mb-5 relative overflow-hidden font-sans">
      <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3.5 mb-4.5">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground/80 uppercase tracking-wider mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-primary" />{" "}
            {t("job_info_grid.seniority_level")}
          </div>
          {isEditing ? (
            <input
              className="w-full h-8 text-sm font-medium bg-background border border-border rounded-md px-2.5 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
              value={editForm.seniority_level || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, seniority_level: e.target.value })
              }
            />
          ) : (
            <p className="text-sm font-semibold text-sidebar capitalize pl-0.5">
              {clean(selectedJob.seniority_level) || "Engineering"}
            </p>
          )}
        </div>
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground/80 uppercase tracking-wider mb-1">
            <MapPin className="w-3.5 h-3.5 text-destructive/80" />{" "}
            {t("job_info_grid.location")}
          </div>
          <p className="text-sm font-semibold text-sidebar pl-0.5">
            {clean(company?.location) || t("job_filters.not_applicable")}
          </p>
        </div>
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground/80 uppercase tracking-wider mb-1">
            <Monitor className="w-3.5 h-3.5 text-accent" />{" "}
            {t("job_info_grid.work_type")}
          </div>
          {isEditing ? (
            <input
              className="w-full h-8 text-sm font-medium bg-background border border-border rounded-md px-2.5 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
              value={editForm.work_location || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, work_location: e.target.value })
              }
            />
          ) : (
            <p className="text-sm font-semibold text-sidebar capitalize pl-0.5">
              {clean(selectedJob.work_location) || t("job_filters.remote")}
            </p>
          )}
        </div>
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground/80 uppercase tracking-wider mb-1">
            <Briefcase className="w-3.5 h-3.5 text-orange-500/80" />{" "}
            {t("job_info_grid.type")}
          </div>
          {isEditing ? (
            <input
              className="w-full h-8 text-sm font-medium bg-background border border-border rounded-md px-2.5 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
              value={editForm.job_type || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, job_type: e.target.value })
              }
            />
          ) : (
            <p className="text-sm font-semibold text-sidebar capitalize pl-0.5">
              {clean(selectedJob.job_type) || t("job_filters.full_time")}
            </p>
          )}
        </div>
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground/80 uppercase tracking-wider mb-1">
            <BanknoteIcon className="w-3.5 h-3.5 text-emerald-500" />{" "}
            {t("job_info_grid.salary")}
          </div>
          {isEditing ? (
            <div className="flex items-center gap-1">
              <input
                type="number"
                className="w-full h-8 text-sm font-medium bg-background border border-border rounded-md px-2 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                value={editForm.salary_min || ""}
                placeholder={t("job_filters.min")}
                onChange={(e) =>
                  setEditForm({ ...editForm, salary_min: e.target.value })
                }
              />
              <span className="text-muted-foreground text-xs">-</span>
              <input
                type="number"
                className="w-full h-8 text-sm font-medium bg-background border border-border rounded-md px-2 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                value={editForm.salary_max || ""}
                placeholder={t("job_filters.max")}
                onChange={(e) =>
                  setEditForm({ ...editForm, salary_max: e.target.value })
                }
              />
            </div>
          ) : (
            <p className="text-sm font-semibold text-sidebar pl-0.5">
              {selectedJob.salary_min
                ? `$${selectedJob.salary_min.toLocaleString()}`
                : "N/A"}{" "}
              -{" "}
              {selectedJob.salary_max
                ? `$${selectedJob.salary_max.toLocaleString()}`
                : "N/A"}
            </p>
          )}
        </div>
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground/80 uppercase tracking-wider mb-1">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground/70" /> {t("job_info_grid.published")}
          </div>
          <p className="text-sm font-semibold text-sidebar pl-0.5">
            {formatDate(selectedJob.created_at)}
          </p>
        </div>
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground/80 uppercase tracking-wider mb-1">
            <Wand2 className="w-3.5 h-3.5 text-primary" />{" "}
            {t("job_info_grid.ai_shortlist")}
          </div>
          <p className="text-sm font-semibold text-sidebar pl-0.5">
            {selectedJob.shortlist_entries?.[0]?.count || 0}{" "}
            {t("job_info_grid.strong_fits")}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-border/55">
        <button
          onClick={() =>
            navigate(
              `/recruiter/candidatespipline?jobId=${selectedJob.id}&companyId=${company?.id}`,
            )
          }
          className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white px-3.5 h-9 rounded-lg text-xs font-semibold transition-colors shadow-xs cursor-pointer select-none"
        >
          <User className="w-3.5 h-3.5" />
          {t("job_info_grid.open_candidate_board")}{" "}
          <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
        </button>
        <button className="flex items-center gap-1.5 border border-border text-sidebar bg-background hover:bg-secondary/50 px-3.5 h-9 rounded-lg text-xs font-semibold transition-colors cursor-pointer select-none">
          <ExternalLink className="w-3.5 h-3.5" />
          {t("job_info_grid.view_public_posting")}
        </button>
        <button className="flex items-center gap-1.5 border border-border text-sidebar bg-background hover:bg-secondary/50 px-3.5 h-9 rounded-lg text-xs font-semibold transition-colors cursor-pointer select-none">
          <Copy className="w-3.5 h-3.5" />
          {t("job_info_grid.copy_link")}
        </button>
      </div>
    </div>
  );
}