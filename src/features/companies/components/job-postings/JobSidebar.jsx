// src\features\companies\components\job-postings\JobSidebar.jsx
import { Building2, Plus, X, Briefcase } from "lucide-react";
import { useTranslation } from "react-i18next";
export default function JobSidebar({
  jobs,
  activeTab,
  searchQuery,
  selectedJobId,
  setSelectedJobId,
  setIsEditing,
  navigate,
  isOpen,
  onClose,
}) {
  const getJobStatus = (job) => {
    let today = Date.now();
    return Date.parse(job.closed_at) < today ? "Closed" : "Published";
  };

  const filteredJobs = jobs.filter((job) => {
    const status = getJobStatus(job);
    const matchesTab =
      activeTab === "All" ||
      (status === "Published" && activeTab === "Open") ||
      (status === "Closed" && activeTab === "Closed");
    const matchesSearch = job.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });
  const { t } = useTranslation();
  return (
    <>
      {/* Mobile/Tablet Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[100] lg:hidden transition-opacity duration-200"
          onClick={onClose}
        />
      )}

      {/* Sidebar Content */}
      <div
        className={`
          fixed inset-y-0 left-0 z-[110] w-[290px] bg-background border-r border-border/60 flex flex-col shrink-0 h-full overflow-hidden
          transform transition-transform duration-200 ease-in-out lg:relative lg:z-auto lg:transform-none lg:w-[320px]
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between bg-background shrink-0">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground/70 tracking-wider uppercase">
              {t("job_sidebar.open_roles")}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {t("job_sidebar.click_to_view")}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Click to view details</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate("/companies/jd-generator")}
              className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors lg:hidden cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1 bg-muted/20">
          {filteredJobs.length === 0 ? (
            <div className="text-xs text-muted-foreground text-center py-6 font-medium">
              {t("job_sidebar.no_jobs")}
            </div>
          ) : (
            filteredJobs.map((job) => {
              const isSelected = job.id === selectedJobId;
              const status = getJobStatus(job);
              const applicantCount = job.applications?.[0]?.count || 0;

              return (
                <button
                  key={job.id}
                  onClick={() => {
                    setSelectedJobId(job.id);
                    setIsEditing(false);
                    onClose(); // Auto close on mobile
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left border transition-all group cursor-pointer ${isSelected
                      ? "bg-accent text-accent-foreground border-border"
                      : "bg-background border-transparent hover:bg-muted/60 hover:border-border/40 shadow-xs hover:shadow-none"
                    }`}
                >
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition-colors ${isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                    }`}>
                    <Briefcase className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className={`text-xs font-semibold leading-snug truncate transition-colors ${isSelected
                          ? "text-foreground"
                          : "text-foreground/90 group-hover:text-foreground"
                        }`}>
                        {job.title}
                      </p>
                      {status === "Published" ? (
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 ml-2 shadow-[0_0_4px_rgba(16,185,129,0.4)]"
                          title="Published"
                        ></span>
                      ) : (
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 shrink-0 ml-2"
                          title="Closed"
                        ></span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground/80 truncate mt-0.5">
                      {job.seniority_level || t("job_sidebar.any_seniority")} ·{" "}
                      {applicantCount}{" "}
                      {t("job_sidebar.applicant", { count: applicantCount })}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}