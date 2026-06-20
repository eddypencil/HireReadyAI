//src\features\companies\components\job-postings\JobContentCards.jsx
import { CheckCircle, X } from "lucide-react";
import { useTranslation } from "react-i18next";
export default function JobContentCards({
  selectedJob,
  isEditing,
  editForm,
  setEditForm,
}) {
  // Helper for array inputs
  const handleArrayInputKeyDown = (e, field) => {
    if (e.key === "Enter" && e.target.value.trim()) {
      e.preventDefault();
      const value = e.target.value.trim();
      setEditForm((prev) => ({
        ...prev,
        [field]: [...(prev[field] || []), value],
      }));
      e.target.value = "";
    }
  };

  const removeArrayItem = (index, field) => {
    setEditForm((prev) => {
      const newArray = [...(prev[field] || [])];
      newArray.splice(index, 1);
      return { ...prev, [field]: newArray };
    });
  };

  const { t } = useTranslation();

  return (
    <div className="space-y-4 font-sans">
      {/* Job Summary */}
      <div className="bg-background border border-border/60 rounded-xl shadow-xs p-5 hover:border-accent/30 transition-colors duration-200">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-3">
          {t("job_content_cards.job_summary")}
        </h3>
        {isEditing ? (
          <textarea
            rows={3}
            className="w-full text-sm font-medium text-foreground bg-background border border-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all resize-y"
            value={editForm.description || ""}
            onChange={(e) =>
              setEditForm({ ...editForm, description: e.target.value })
            }
          />
        ) : (
          <div className="text-sm text-muted-foreground font-medium leading-relaxed whitespace-pre-wrap">
            {selectedJob.description || t("job_content_cards.no_description")}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Responsibilities */}
        <div className="bg-background border border-border/60 rounded-xl shadow-xs p-5 hover:border-accent/30 transition-colors duration-200">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-3">
            {t("job_content_cards.responsibilities")}
          </h3>
          <ul className="space-y-2.5">
            {isEditing ? (
              <>
                {(editForm.responsibilities || []).map((resp, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <button
                      onClick={() => removeArrayItem(i, "responsibilities")}
                      className="text-muted-foreground/60 hover:text-destructive transition-colors shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <input
                      value={resp}
                      onChange={(e) => {
                        const newArr = [...editForm.responsibilities];
                        newArr[i] = e.target.value;
                        setEditForm({ ...editForm, responsibilities: newArr });
                      }}
                      className="w-full text-sm font-medium text-foreground bg-muted border border-border rounded-lg h-9 px-2.5 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                    />
                  </li>
                ))}
                <li>
                  <input
                    type="text"
                    placeholder={t("job_content_cards.placeholders.add_item")}
                    onKeyDown={(e) =>
                      handleArrayInputKeyDown(e, "responsibilities")
                    }
                    className="w-full text-sm font-medium text-foreground bg-background border border-border border-dashed rounded-lg h-9 px-3 placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                  />
                </li>
              </>
            ) : (
              (selectedJob.responsibilities || []).map((resp, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground font-medium leading-relaxed">
                    {resp}
                  </span>
                </li>
              ))
            )}
            {!isEditing &&
              (!selectedJob.responsibilities ||
                selectedJob.responsibilities.length === 0) && (
                <span className="text-xs text-muted-foreground/50 font-medium pl-0.5">
                  {t("job_content_cards.none_specified")}
                </span>
              )}
          </ul>
        </div>

        {/* Requirements */}
        <div className="bg-background border border-border/60 rounded-xl shadow-xs p-5 hover:border-accent/30 transition-colors duration-200">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-3">
            {t("job_content_cards.requirements")}
          </h3>
          <ul className="space-y-2.5">
            {isEditing ? (
              <>
                {(editForm.requirements || []).map((req, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <button
                      onClick={() => removeArrayItem(i, "requirements")}
                      className="text-muted-foreground/60 hover:text-destructive transition-colors shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <input
                      value={req}
                      onChange={(e) => {
                        const newArr = [...editForm.requirements];
                        newArr[i] = e.target.value;
                        setEditForm({ ...editForm, requirements: newArr });
                      }}
                      className="w-full text-sm font-medium text-foreground bg-muted border border-border rounded-lg h-9 px-2.5 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                    />
                  </li>
                ))}
                <li>
                  <input
                    type="text"
                    placeholder={t("job_content_cards.placeholders.add_item")}
                    onKeyDown={(e) =>
                      handleArrayInputKeyDown(e, "requirements")
                    }
                    className="w-full text-sm font-medium text-foreground bg-background border border-border border-dashed rounded-lg h-9 px-3 placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                  />
                </li>
              </>
            ) : (
              (selectedJob.requirements || []).map((req, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground font-medium leading-relaxed">
                    {req}
                  </span>
                </li>
              ))
            )}
            {!isEditing &&
              (!selectedJob.requirements ||
                selectedJob.requirements.length === 0) && (
                <span className="text-xs text-muted-foreground/50 font-medium pl-0.5">
                  {t("job_content_cards.none_specified")}
                </span>
              )}
          </ul>
        </div>
      </div>

      {/* Skills */}
      <div className="bg-background border border-border/60 rounded-xl shadow-xs p-5 hover:border-accent/30 transition-colors duration-200">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-3">
          {t("job_content_cards.skills")}
        </h3>
        <div className="flex flex-wrap gap-2">
          {isEditing ? (
            <>
              {(editForm.skills || []).map((skill, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 px-3 h-8 rounded-full text-xs font-semibold"
                >
                  <span>{skill}</span>
                  <button
                    onClick={() => removeArrayItem(i, "skills")}
                    className="hover:text-destructive transition-colors ml-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <input
                type="text"
                placeholder={t("job_content_cards.placeholders.add_skill")}
                onKeyDown={(e) => handleArrayInputKeyDown(e, "skills")}
                className="text-xs font-semibold text-foreground bg-background border border-border border-dashed rounded-full px-3 h-8 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary placeholder:text-muted-foreground/40 transition-all w-28"
              />
            </>
          ) : (
            (selectedJob.skills || []).map((skill, i) => (
              <span
                key={i}
                className="bg-primary/10 text-primary border border-primary/15 px-3 py-1 rounded-full text-xs font-semibold tracking-wide"
              >
                {skill}
              </span>
            ))
          )}
          {!isEditing &&
            (!selectedJob.skills || selectedJob.skills.length === 0) && (
              <span className="text-xs text-muted-foreground/50 font-medium pl-0.5">
                {t("job_content_cards.none_specified")}
              </span>
            )}
        </div>
      </div>
    </div>
  );
}
