import { useState } from "react";
import { X } from "lucide-react";
import { JOB_TYPE } from "@/shared/constants/enums";

export default function AddJobModal({ isOpen, onClose, onAddJob }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [seniorityLevel, setSeniorityLevel] = useState("");
  const [jobType, setJobType] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      await onAddJob({
        title,
        description,
        seniorityLevel: seniorityLevel || null,
        jobType: jobType || null,
      });
      setTitle("");
      setDescription("");
      setSeniorityLevel("");
      setJobType("");
      onClose();
    } catch (err) {
      console.error("Error adding job:", err);
      alert("Error adding job: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 font-sans">
      <div className="bg-white w-full max-w-lg rounded-xl border border-gray-100 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 bg-gray-50/50 shrink-0">
          <h3 className="text-base sm:text-lg font-bold text-dark-amethyst-950">
            Add New Job
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto grow">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              Job Title *
            </label>
            <input
              required
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Frontend Developer"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-dark-amethyst-400 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              Job Description *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter job responsibilities, requirements..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-dark-amethyst-400 resize-none bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                Seniority Level
              </label>
              <select
                value={seniorityLevel}
                onChange={(e) => setSeniorityLevel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-dark-amethyst-400 bg-white"
              >
                <option value="">Select level</option>
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior</option>
                <option value="lead">Lead</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                Job Type
              </label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-dark-amethyst-400 bg-white"
              >
                <option value="">Select type</option>
                <option value={JOB_TYPE.FULL_TIME}>Full Time</option>
                <option value={JOB_TYPE.PART_TIME}>Part Time</option>
                <option value={JOB_TYPE.FREELANCE}>FreeLance</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-50 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-dark-amethyst-950 text-white rounded-lg text-sm font-medium hover:bg-dark-amethyst-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs"
            >
              {loading ? "Saving..." : "Save Job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}