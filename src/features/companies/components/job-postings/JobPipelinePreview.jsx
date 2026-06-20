//src\features\companies\components\job-postings\JobPipelinePreview.jsx
import { GitBranch, Wand2, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
export default function JobPipelinePreview({
  pipelineStages,
  loadingStages,
  selectedJobId,
  selectedJobTitle,
  navigate,
}) {
  const { t } = useTranslation();
  return (
    <div className="bg-background border border-border/60 rounded-xl shadow-xs p-5 lg:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="text-[10px] font-bold tracking-wider uppercase text-primary mb-1">
            {t("job_pipeline_preview.title")}
          </h2>
          <div className="flex items-center gap-1.5">
            <GitBranch className="w-4 h-4 text-foreground" />
            <h3 className="text-base font-bold text-foreground">
              {selectedJobTitle} {t("job_pipeline_preview.pipeline")}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {pipelineStages.length} {t("job_pipeline_preview.stages")} ·{" "}
            {t("job_pipeline_preview.owned_by_job")}
          </p>
        </div>
        <button
          onClick={() => navigate(`/companies/pipelines/${selectedJobId}`)}
          className="self-start sm:self-center flex items-center gap-1.5 bg-surface text-foreground border border-border/80 hover:bg-muted px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer select-none"        >
          <GitBranch className="w-3.5 h-3.5" />
          {t("job_pipeline_preview.edit_pipeline")}
        </button>
      </div>

      <div className="overflow-x-auto pb-2 scrollbar-none">
        {loadingStages ? (
          <div className="flex gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-56 h-20 shrink-0 bg-muted/50 rounded-xl animate-pulse border border-border/40"
              ></div>
            ))}
          </div>
        ) : pipelineStages.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-border rounded-xl text-muted-foreground text-xs font-medium">
            {t("job_pipeline_preview.no_stages")}
          </div>
        ) : (
          <div className="flex gap-2 min-w-max items-center">
            {pipelineStages.map((stage, idx) => (
              <div key={stage.id} className="flex items-center">
                <div className="w-56 border border-border/60 rounded-xl p-3.5 bg-background shadow-xs">
                  <p className="text-[9px] font-bold tracking-wider text-muted-foreground/70 uppercase mb-1">
                    {t("job_pipeline_preview.stage_label")} {idx + 1}
                  </p>
                  <p className="text-xs font-bold text-foreground mb-2.5 truncate">
                    {stage.name}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span className="bg-muted text-muted-foreground px-1.5 py-0.5 rounded text-[10px] font-semibold">
                      {Math.round((stage.weight || 0) * 100)}%
                    </span>
                    <span className="bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1">
                      <Wand2 className="w-2.5 h-2.5" />{" "}
                      {t("job_pipeline_preview.ai")}
                    </span>
                  </div>
                </div>
                {idx < pipelineStages.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-muted-foreground/40 mx-1 shrink-0" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
