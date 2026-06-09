import { Edit, X, Save, Menu } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function JobDetailHeader({
  selectedJob,
  isEditing,
  editForm,
  setEditForm,
  handleEditClick,
  handleCancelEdit,
  handleSave,
  saving,
  onOpenSidebar,
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 font-sans">
      <div className="space-y-1.5 min-w-0 flex-1">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenSidebar}
            className="lg:hidden p-1.5 -ml-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>

          <h1 className="text-xl lg:text-2xl font-bold text-foreground tracking-tight flex-1">
            {isEditing ? (
              <input
                type="text"
                className="w-full h-10 font-bold text-foreground bg-background border border-border rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                value={editForm.title}
                onChange={(e) =>
                  setEditForm({ ...editForm, title: e.target.value })
                }
              />
            ) : (
              selectedJob.title
            )}
          </h1>
        </div>

        
      </div>

      <div className="flex items-center gap-2 shrink-0 sm:pt-0 pt-1">
        {!isEditing ? (
          <>
            <button
              onClick={handleEditClick}
              className="flex items-center gap-1.5 border border-border text-foreground bg-background hover:bg-muted px-3.5 h-9 rounded-lg text-xs font-semibold transition-colors shadow-xs cursor-pointer select-none"
            >
              <Edit className="w-3.5 h-3.5" />
              {t("job_detail_header.edit")}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleCancelEdit}
              className="flex items-center gap-1.5 border border-border text-foreground bg-background hover:bg-muted px-3.5 h-9 rounded-lg text-xs font-semibold transition-colors cursor-pointer select-none"
            >
              <X className="w-3.5 h-3.5" />
              {t("job_detail_header.cancel")}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white px-3.5 h-9 rounded-lg text-xs font-semibold transition-colors shadow-xs disabled:opacity-50 cursor-pointer select-none"
            >
              <Save className="w-3.5 h-3.5" />
              {saving
                ? t("job_detail_header.saving")
                : t("job_detail_header.save")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
