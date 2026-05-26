import { useState } from "react";

// formData shape: { name, industry, size }
// onSubmit: (formData) => void
// initial: optional existing company for editing
export const CompanyForm = ({ onSubmit, initial = null, onCancel }) => {
  const [name, setName] = useState(initial?.name || "");
  const [industry, setIndustry] = useState(initial?.industry || "");
  const [size, setSize] = useState(initial?.size || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      name,
      industry: industry || null,
      size: size ? parseInt(size) : null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2 border p-3 rounded bg-gray-50">
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Company Name *</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Acme Corp"
          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Industry</label>
        <input
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          placeholder="Tech / Finance / ..."
          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Size (employees)</label>
        <input
          type="number"
          value={size}
          onChange={(e) => setSize(e.target.value)}
          placeholder="100"
          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
        />
      </div>
      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          className="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700"
        >
          {initial ? "Update" : "Create"}
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
