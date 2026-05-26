// components/jobs/JobCard.jsx

import { useCompanyDetailsViewModel } from "@/features/companies/hooks/useCompanyDetails";
import { Card, CardContent } from "@/shared/ui/Card";
import { useEffect, useState } from "react";

export default function JobCard({ job }) {
  const { company } = useCompanyDetailsViewModel(job.company_id);
  return (
    <Card className="bg-white border border-gray-200 hover:shadow-md transition-all">
      <CardContent className="p-5 space-y-4">
        {/* Header */}
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-gray-900">{job.title}</h2>

          {company && <p className="text-sm text-gray-500">{company.name}</p>}
          <p className="text-sm text-gray-500">{job.description}</p>
        </div>

        {/* Tags */}
        <div className="flex gap-2 flex-wrap">
          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-violet-700">
            {job.job_type.toUpperCase().replace("_", " ")}
          </span>

          <span className="px-2 py-1 text-xs rounded-full bg-violet-100 text-violet-700">
            {job.seniority_level.toUpperCase().replace("_", " ")}
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
