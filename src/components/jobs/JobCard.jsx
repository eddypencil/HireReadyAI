// components/jobs/JobCard.jsx

import { Card, CardContent } from "../ui/Card";

export default function JobCard({ job }) {
  return (
    <Card className="bg-white border border-gray-200 hover:shadow-md transition-all">
      <CardContent className="p-5 space-y-4">
        {/* Header */}
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-gray-900">{job.title}</h2>

          <p className="text-sm text-gray-500">
            {job.company} • {job.location}
          </p>
        </div>

        {/* Tags */}
        <div className="flex gap-2 flex-wrap">
          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
            {job.type}
          </span>

          <span className="px-2 py-1 text-xs rounded-full bg-violet-100 text-violet-700">
            {job.level.charAt(0).toUpperCase() + job.level.slice(1)}
          </span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2">
          <button className="text-sm font-medium text-violet-600 hover:text-violet-700">
            View Job →
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
