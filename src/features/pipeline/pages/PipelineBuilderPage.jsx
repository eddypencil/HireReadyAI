//src\features\pipeline\pages\PipelineBuilderPage.jsx
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { usePipeline } from "../hooks/usePipeline";
import LoadingSpinner from "@/shared/ui/LoadingSpinner";
import PipelineBuilder from "../components/PipelineBuilder";
import { useTranslation } from "react-i18next";

export default function PipelineBuilderPage() {
  const { jobId } = useParams();
  const { t } = useTranslation();
  const {
    job,
    stages,
    loading,
    error,
    warning,
    isCompanyPremium,
    handleAddStage,
    handleUpdateStage,
    handleDeleteStage,
    handleReorderStages,
  } = usePipeline(jobId);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 p-8 bg-background">
        <AlertCircle className="w-8 h-8 text-destructive" />
        <p className="text-sm text-destructive text-center font-medium">{error}</p>
        <Link
          to="/companies/pipelines"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary-hover font-bold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("pipeline_builder.back_to_pipelines")}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-dvh lg:h-full font-sans bg-background text-foreground relative">
      {warning && (
        <div className="fixed sm:absolute top-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md z-50 flex items-start gap-3 bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl shadow-lg transition-all dark:bg-destructive/20">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-semibold leading-relaxed">{warning}</p>
        </div>
      )}

      <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-border bg-surface/95 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <Link
            to="/companies/pipelines"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary font-semibold transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">
              {t("pipeline_builder.pipelines")}
            </span>
          </Link>
          <span className="text-border/60 shrink-0" aria-hidden>
            /
          </span>
          <span className="text-sm font-bold text-foreground truncate">
            {job?.title}
          </span>
        </div>

        {job?.seniority_level && (
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-muted text-muted-foreground dark:bg-muted/80 dark:text-foreground shrink-0 capitalize whitespace-nowrap border border-border/40">
            {job.seniority_level}
          </span>
        )}
      </div>


      <div className="flex-1 overflow-hidden bg-slate-50/40 dark:bg-background/20">
        <PipelineBuilder
          job={job}
          stages={stages}
          isCompanyPremium={isCompanyPremium}
          onAddStage={handleAddStage}
          onUpdateStage={handleUpdateStage}
          onDeleteStage={handleDeleteStage}
          onReorderStages={handleReorderStages}
        />
      </div>
    </div>
  );
}