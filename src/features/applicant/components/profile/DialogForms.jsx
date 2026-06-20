import {
  InputField,
  DEGREE_LEVELS,
  SKILL_LABELS,
  LANG_LABELS,
} from "./FormFields";
import { StarRatingInput } from "./StarRating";
import ImageUpload from "./ImageUpload";
import { useTranslation } from "react-i18next";

export default function DialogForms({ dialog, handleDialogChange, errors = {} }) {
  if (!dialog) return null;

  const { section, data } = dialog;
  const { t } = useTranslation();
  if (section === "experience") {
    return (
      <div className="space-y-3">
        <InputField
         
          label="Job Title"
         
          value={data.title || ""}
         
          onChange={(v) => handleDialogChange("title", v)}
         
          placeholder="Job title"
          error={errors.title}
       
        />
        <InputField
         
          label="Company Name"
         
          value={data.company_name || ""}
         
          onChange={(v) => handleDialogChange("company_name", v)}
         
          placeholder="Company name"
          error={errors.company_name}
       
        />
        <InputField
          label="Industry"
          value={data.industry || ""}
          onChange={(v) => handleDialogChange("industry", v)}
          placeholder="Industry"
        />

        <div className="flex items-center gap-2 bg-secondary/30 p-2 rounded-lg border border-border/40">
          <input
            type="checkbox"
            id="current_job"
            checked={data.to === "present"}
            onChange={(e) => handleDialogChange("to", e.target.checked ? "present" : "")}
            className="rounded border-border text-primary focus:ring-primary"
          />
          <label htmlFor="current_job" className="text-xs font-medium cursor-pointer select-none">I currently work here</label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <InputField
            label="Start Date"
            type="month"
            value={data.from || ""}
            onChange={(v) => handleDialogChange("from", v)} error={errors.from}
          />
          {data.to !== "present" && (
            <InputField
            label="End Date"
            type="month"
            value={data.to || ""}
            onChange={(v) => handleDialogChange("to", v)} error={errors.to}
          />
          )}
        </div>
        <InputField
          label="Description"
          value={data.description || ""}
          onChange={(v) => handleDialogChange("description", v)}
          placeholder="Describe your role..."
          multiline
        />
      </div>
    );
  }

  if (section === "education") {
    return (
      <div className="space-y-3">
        <div>
          <label className={`block text-xs font-medium mb-1 ${errors.level ? "text-destructive" : "text-muted-foreground"}`}>
            {t("dialogs.education.degreeLevel")}
          </label>
          <select
            value={data.level || ""}
            onChange={(e) => handleDialogChange("level", e.target.value)}
            className={`w-full text-sm bg-background border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 transition-all ${errors.level ? "border-destructive focus:ring-destructive/30" : "border-border/70 focus:ring-primary/30 focus:border-primary"
              }`}
          >
            <option value="">Select degree level</option>
            {DEGREE_LEVELS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          {errors.level && <p className="text-xs text-destructive mt-1 font-medium">{errors.level}</p>}
        </div>
        <InputField
         
          label="University"
         
          value={data.university || ""}
         
          onChange={(v) => handleDialogChange("university", v)}
         
          placeholder="University"
          error={errors.university}
       
        />
        <InputField
          label="Faculty"
          value={data.faculty || ""}
          onChange={(v) => handleDialogChange("faculty", v)}
          placeholder="Faculty"
        />
        <InputField
          label="Major"
          value={data.major || ""}
          onChange={(v) => handleDialogChange("major", v)}
          placeholder="Major"
        />

        <div className="flex items-center gap-2 bg-secondary/30 p-2 rounded-lg border border-border/40">
          <input
            type="checkbox"
            id="current_edu"
            checked={data.end_year === "present"}
            onChange={(e) => handleDialogChange("end_year", e.target.checked ? "present" : "")}
            className="rounded border-border text-primary focus:ring-primary"
          />
          <label htmlFor="current_edu" className="text-xs font-medium cursor-pointer select-none">I currently study here</label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <InputField
            label="Start Year"
            type="number"
            value={data.start_year || ""}
            onChange={(v) => handleDialogChange("start_year", v)}
            placeholder="Start year" error={errors.start_year}
          />
          {data.end_year !== "present" && (
            <InputField
            label="End Year"
            type="number"
            value={data.end_year || ""}
            onChange={(v) => handleDialogChange("end_year", v)}
            placeholder="End year" error={errors.end_year}
          />
          )}
        </div>
        <InputField
          label="Grade"
          value={data.grade || ""}
          onChange={(v) => handleDialogChange("grade", v)}
          placeholder="Grade"
        />
      </div>
    );
  }

  if (section === "skills") {
    return (
      <div className="space-y-3">
        <InputField
         
          label="Skill Name"
         
          value={data.name || ""}
         
          onChange={(v) => handleDialogChange("name", v)}
         
          placeholder="Skill name"
          error={errors.name}
       
        />
        <StarRatingInput
          value={parseInt(data.level, 10) || 0}
          onChange={(v) => handleDialogChange("level", v)}
          labels={SKILL_LABELS}
        />
      </div>
    );
  }

  if (section === "languages") {
    return (
      <div className="space-y-3">
        <InputField
         
          label="Language"
         
          value={data.name || ""}
         
          onChange={(v) => handleDialogChange("name", v)}
         
          placeholder="Language"
          error={errors.name}
       
        />
        <StarRatingInput
          value={parseInt(data.level, 10) || 0}
          onChange={(v) => handleDialogChange("level", v)}
          labels={LANG_LABELS}
        />
      </div>
    );
  }

  if (section === "certificates") {
    return (
      <div className="space-y-3">
        <InputField
         
          label="Certificate Name"
         
          value={data.name || ""}
         
          onChange={(v) => handleDialogChange("name", v)}
         
          placeholder="Certificate name"
          error={errors.name}
       
        />
        <InputField
         
          label="Organization"
         
          value={data.organization || ""}
         
          onChange={(v) => handleDialogChange("organization", v)}
         
          placeholder="Organization"
          error={errors.organization}
       
        />
        <div className="grid grid-cols-2 gap-3">
          <InputField
            label="Date"
            type="month"
            value={data.date || ""}
            onChange={(v) => handleDialogChange("date", v)} error={errors.date}
          />
          <InputField
            label="Field"
            value={data.field || ""}
            onChange={(v) => handleDialogChange("field", v)}
            placeholder="Field"
          />
        </div>
        <InputField
          label="Credential URL"
          value={data.url || ""}
          onChange={(v) => handleDialogChange("url", v)}
          placeholder="https://..."
        />
        <ImageUpload
          bucket="certificates"
          currentUrls={data.image ? [data.image] : []}
          onUploaded={(url, removeIdx) => {
            if (removeIdx != null) {
              handleDialogChange("image", "");
              return;
            }
            handleDialogChange("image", url);
          }}
        />
      </div>
    );
  }

  if (section === "projects") {
    return (
      <div className="space-y-3">
        <InputField
         
          label="Project Name"
         
          value={data.name || ""}
         
          onChange={(v) => handleDialogChange("name", v)}
         
          placeholder="Project name"
          error={errors.name}
       
        />
        <InputField
          label="Description"
          value={data.description || ""}
          onChange={(v) => handleDialogChange("description", v)}
          placeholder="Description..."
          multiline
        />
        <InputField
          label="Technologies"
          value={
            Array.isArray(data.technologies)
              ? data.technologies.join(", ")
              : data.technologies || ""
          }
          onChange={(v) =>
            handleDialogChange(
              "technologies",
              v.split(",").map((s) => s.trim()),
            )
          }
          placeholder="Comma-separated"
        />
        <InputField
          label="Project URL"
          value={data.url || ""}
          onChange={(v) => handleDialogChange("url", v)}
          placeholder="https://..."
        />
        <ImageUpload
          bucket="projects"
          currentUrls={data.images || []}
          onUploaded={(url, removeIdx) => {
            const imgs = [...(data.images || [])];
            if (removeIdx != null) {
              imgs.splice(removeIdx, 1);
              handleDialogChange("images", imgs);
              return;
            }
            handleDialogChange("images", [...imgs, url]);
          }}
        />
      </div>
    );
  }

  if (section === "volunteering") {
    return (
      <div className="space-y-3">
        <InputField
         
          label="Organization"
         
          value={data.organization || ""}
         
          onChange={(v) => handleDialogChange("organization", v)}
         
          placeholder="Organization"
          error={errors.organization}
       
        />
        <InputField
         
          label="Role"
         
          value={data.role || ""}
         
          onChange={(v) => handleDialogChange("role", v)}
         
          placeholder="Role"
          error={errors.role}
       
        />
        <div className="grid grid-cols-2 gap-3">
          <InputField
            label="Start Date"
            type="month"
            value={data.start || ""}
            onChange={(v) => handleDialogChange("start", v)} error={errors.start}
          />
          <InputField
            label="End Date"
            type="month"
            value={data.end || ""}
            onChange={(v) => handleDialogChange("end", v)} error={errors.end}
          />
        </div>
        <InputField
          label="Description"
          value={data.description || ""}
          onChange={(v) => handleDialogChange("description", v)}
          placeholder="Description..."
          multiline
        />
      </div>
    );
  }

  return null;
}