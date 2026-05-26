import { useState } from "react";
import { X } from "lucide-react";
import { postJob } from "../services/database_service";

export default function AddJobModal({ isOpen, onClose, onAddJob }) {
    const [title, setTitle] = useState("");
    const [department, setDepartment] = useState("");
    const [description, setDescription] = useState("");

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await postJob({ title, department, description });

            onAddJob({ title, department, description });

            setTitle("");
            setDepartment("");
            setDescription("");
            onClose();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans">
            <div className="bg-white w-full max-w-lg rounded-xl border border-gray-100 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-lg font-bold text-dark-amethyst-950">Add New Job</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg cursor-pointer">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Job Title</label>
                        <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Frontend Developer" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-dark-amethyst-400" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Department</label>
                        <input required type="text" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. Engineering" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-dark-amethyst-400" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Job Description</label>
                        <textarea required rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter job responsibilities..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-dark-amethyst-400 resize-none" />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-dark-amethyst-950 text-white rounded-lg text-sm font-medium hover:bg-dark-amethyst-900 transition-colors cursor-pointer">Save Job</button>
                    </div>
                </form>
            </div>
        </div>
    );
}