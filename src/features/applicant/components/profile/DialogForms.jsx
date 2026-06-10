import { InputField, DEGREE_LEVELS, SKILL_LABELS, LANG_LABELS } from "./FormFields";
import { StarRatingInput } from "./StarRating";
import ImageUpload from "./ImageUpload";

export default function DialogForms({ dialog, handleDialogChange }) {
  if (!dialog) return null;

  const { section, data } = dialog;

  if (section === "experience") {
    return (
      <div className="space-y-3">
        <InputField label="Job Title" value={data.title || ""} onChange={(v) => handleDialogChange("title", v)} placeholder="Job title" />
        <InputField label="Company Name" value={data.company_name || ""} onChange={(v) => handleDialogChange("company_name", v)} placeholder="Company name" />
        <InputField label="Industry" value={data.industry || ""} onChange={(v) => handleDialogChange("industry", v)} placeholder="Industry" />
        <div className="grid grid-cols-2 gap-3">
          <InputField label="Start Date" type="month" value={data.from || ""} onChange={(v) => handleDialogChange("from", v)} />
          <InputField label="End Date" type="month" value={data.to || ""} onChange={(v) => handleDialogChange("to", v)} />
        </div>
        <InputField label="Description" value={data.description || ""} onChange={(v) => handleDialogChange("description", v)} placeholder="Describe your role..." multiline />
      </div>
    );
  }

  if (section === "education") {
    return (
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Degree Level</label>
          <select
            value={data.level || ""}
            onChange={(e) => handleDialogChange("level", e.target.value)}
            className="w-full text-sm bg-background border border-border/70 rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          >
            <option value="">Select degree level</option>
            {DEGREE_LEVELS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <InputField label="University" value={data.university || ""} onChange={(v) => handleDialogChange("university", v)} placeholder="University" />
        <InputField label="Faculty" value={data.faculty || ""} onChange={(v) => handleDialogChange("faculty", v)} placeholder="Faculty" />
        <InputField label="Major" value={data.major || ""} onChange={(v) => handleDialogChange("major", v)} placeholder="Major" />
        <div className="grid grid-cols-2 gap-3">
          <InputField label="Start Year" type="number" value={data.start_year || ""} onChange={(v) => handleDialogChange("start_year", v)} placeholder="Start year" />
          <InputField label="End Year" type="number" value={data.end_year || ""} onChange={(v) => handleDialogChange("end_year", v)} placeholder="End year" />
        </div>
        <InputField label="Grade" value={data.grade || ""} onChange={(v) => handleDialogChange("grade", v)} placeholder="Grade" />
      </div>
    );
  }

  if (section === "skills") {
    return (
      <div className="space-y-3">
        <InputField label="Skill Name" value={data.name || ""} onChange={(v) => handleDialogChange("name", v)} placeholder="Skill name" />
        <StarRatingInput value={parseInt(data.level, 10) || 0} onChange={(v) => handleDialogChange("level", v)} labels={SKILL_LABELS} />
      </div>
    );
  }

  if (section === "languages") {
    return (
      <div className="space-y-3">
        <InputField label="Language" value={data.name || ""} onChange={(v) => handleDialogChange("name", v)} placeholder="Language" />
        <StarRatingInput value={parseInt(data.level, 10) || 0} onChange={(v) => handleDialogChange("level", v)} labels={LANG_LABELS} />
      </div>
    );
  }

  if (section === "certificates") {
    return (
      <div className="space-y-3">
        <InputField label="Certificate Name" value={data.name || ""} onChange={(v) => handleDialogChange("name", v)} placeholder="Certificate name" />
        <InputField label="Organization" value={data.organization || ""} onChange={(v) => handleDialogChange("organization", v)} placeholder="Organization" />
        <div className="grid grid-cols-2 gap-3">
          <InputField label="Date" type="month" value={data.date || ""} onChange={(v) => handleDialogChange("date", v)} />
          <InputField label="Field" value={data.field || ""} onChange={(v) => handleDialogChange("field", v)} placeholder="Field" />
        </div>
        <InputField label="Credential URL" value={data.url || ""} onChange={(v) => handleDialogChange("url", v)} placeholder="https://..." />
        <ImageUpload bucket="certificates" currentUrls={data.image ? [data.image] : []} onUploaded={(url, removeIdx) => {
          if (removeIdx != null) { handleDialogChange("image", ""); return; }
          handleDialogChange("image", url);
        }} />
      </div>
    );
  }

  if (section === "projects") {
    return (
      <div className="space-y-3">
        <InputField label="Project Name" value={data.name || ""} onChange={(v) => handleDialogChange("name", v)} placeholder="Project name" />
        <InputField label="Description" value={data.description || ""} onChange={(v) => handleDialogChange("description", v)} placeholder="Description..." multiline />
        <InputField label="Technologies" value={Array.isArray(data.technologies) ? data.technologies.join(", ") : data.technologies || ""} onChange={(v) => handleDialogChange("technologies", v.split(",").map((s) => s.trim()))} placeholder="Comma-separated" />
        <InputField label="Project URL" value={data.url || ""} onChange={(v) => handleDialogChange("url", v)} placeholder="https://..." />
        <ImageUpload bucket="projects" currentUrls={data.images || []} onUploaded={(url, removeIdx) => {
          const imgs = [...(data.images || [])];
          if (removeIdx != null) { imgs.splice(removeIdx, 1); handleDialogChange("images", imgs); return; }
          handleDialogChange("images", [...imgs, url]);
        }} />
      </div>
    );
  }

  if (section === "volunteering") {
    return (
      <div className="space-y-3">
        <InputField label="Organization" value={data.organization || ""} onChange={(v) => handleDialogChange("organization", v)} placeholder="Organization" />
        <InputField label="Role" value={data.role || ""} onChange={(v) => handleDialogChange("role", v)} placeholder="Role" />
        <div className="grid grid-cols-2 gap-3">
          <InputField label="Start Date" type="month" value={data.start || ""} onChange={(v) => handleDialogChange("start", v)} />
          <InputField label="End Date" type="month" value={data.end || ""} onChange={(v) => handleDialogChange("end", v)} />
        </div>
        <InputField label="Description" value={data.description || ""} onChange={(v) => handleDialogChange("description", v)} placeholder="Description..." multiline />
      </div>
    );
  }

  return null;
}
