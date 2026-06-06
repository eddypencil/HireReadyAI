import { Wand2, Edit, X, Save, Menu } from "lucide-react";

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
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 font-sans">
      <div className="space-y-1.5 min-w-0 flex-1">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenSidebar}
            className="lg:hidden p-1.5 -ml-1 text-muted-foreground hover:text-sidebar hover:bg-secondary/60 rounded-lg transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>

          <h1 className="text-xl lg:text-2xl font-bold text-sidebar tracking-tight flex-1">
            {isEditing ? (
              <input
                type="text"
                className="w-full h-10 font-bold bg-background border border-border rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
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

        <div className="flex items-center flex-wrap gap-2 text-xs font-semibold text-muted-foreground/80 capitalize pl-1">
          <span className="bg-secondary/40 px-2 py-0.5 rounded-md border border-border/40">
            {selectedJob.seniority_level || "Any Seniority"}
          </span>
          <span className="text-muted-foreground/30 font-normal">&middot;</span>
          <span className="bg-secondary/40 px-2 py-0.5 rounded-md border border-border/40">
            {selectedJob.work_location?.replace("_", " ").trim() || "Any Location"}
          </span>
          <span className="text-muted-foreground/30 font-normal">&middot;</span>
          <span className="bg-secondary/40 px-2 py-0.5 rounded-md border border-border/40">
            {selectedJob.job_type?.replace("_", "-") || "Full-time"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 sm:pt-0 pt-1">
        {!isEditing ? (
          <>
            <button className="flex items-center gap-1.5 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white px-3.5 h-9 rounded-lg text-xs font-semibold transition-all shadow-xs cursor-pointer select-none">
              <Wand2 className="w-3.5 h-3.5" />
              Regenerate with AI
            </button>
            <button
              onClick={handleEditClick}
              className="flex items-center gap-1.5 border border-border text-sidebar bg-background hover:bg-secondary/50 px-3.5 h-9 rounded-lg text-xs font-semibold transition-colors shadow-xs cursor-pointer select-none"
            >
              <Edit className="w-3.5 h-3.5" />
              Edit
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleCancelEdit}
              className="flex items-center gap-1.5 border border-border text-sidebar bg-background hover:bg-secondary/50 px-3.5 h-9 rounded-lg text-xs font-semibold transition-colors cursor-pointer select-none"
            >
              <X className="w-3.5 h-3.5" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white px-3.5 h-9 rounded-lg text-xs font-semibold transition-colors shadow-xs disabled:opacity-50 cursor-pointer select-none"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? "Saving..." : "Save"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}