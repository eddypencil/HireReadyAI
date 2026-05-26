import { useState } from "react";
import { SENIORITY_LEVEL } from "../../utils/enums";

// onSubmit: (formData) => void
// initial: optional existing job for editing
export const JobForm = ({ onSubmit, initial = null, onCancel, companyId, profileId }) => {
  const [title, setTitle] = useState(initial?.title || "");
  const [seniority, setSeniority] = useState(initial?.seniority_level || SENIORITY_LEVEL.junior);
  const [description, setDescription] = useState(initial?.description || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      company_id: companyId,
      created_by_profile_id: profileId || null,
      title,
      seniority_level: seniority,
      description,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2 border p-3 rounded bg-gray-50">
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Job Title *</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Frontend Developer"
          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Seniority Level</label>
        <select
          value={seniority}
          onChange={(e) => setSeniority(e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-white"
        >
          {Object.values(SENIORITY_LEVEL).map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Description *</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={3}
          placeholder="Describe the role..."
          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
        />
      </div>
      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          className="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700"
        >
          {initial ? "Update Job" : "Post Job"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="border border-gray-300 text-sm px-3 py-1 rounded hover:bg-gray-100"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};
