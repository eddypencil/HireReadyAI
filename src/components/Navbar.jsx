import { Search, Plus } from "lucide-react";

export default function Navbar({ searchQuery, setSearchQuery, onAddJobClick }) {
    return (
        <div className="flex items-center justify-between bg-white border-b border-gray-100 px-8 py-4 font-sans">
            <div className="relative w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search jobs by title or department..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-dark-amethyst-400 focus:bg-white transition-colors"
                />
            </div>

            <div className="flex items-center gap-4">
                <button onClick={onAddJobClick} className="flex items-center gap-2 bg-dark-amethyst-950 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-dark-amethyst-900 transition-colors cursor-pointer">
                    <Plus className="w-4 h-4" />
                    Add Job
                </button>
            </div>
        </div>
    );
}