import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSearchParams, Link } from "react-router-dom";
import { useUser } from "@/features/auth/context/user.context";
import { supabase } from "@/shared/services/supabase";
import {
  getCandidateProfile,
  getCandidateStageQuestions,
  getJobScorePercentile,
  getPercentileTag,
} from "@/features/recruiter/services/candidateProfile.service";
import { ArrowLeft, FileText, ChevronDown, ChevronRight } from "lucide-react";
import LoadingSpinner from "@/shared/ui/LoadingSpinner";

import AppSelector from "../components/feedback/AppSelector";
import CandidateHeader from "../components/feedback/CandidateHeader";
import KeyTakeaways from "../components/feedback/KeyTakeaways";
import ApplicationTimeline from "../components/feedback/ApplicationTimeline";
import SkillsToDevelop from "../components/feedback/SkillsToDevelop";
import SimilarOpportunities from "../components/feedback/SimilarOpportunities";
import CvReviewSection from "../components/feedback/CvReviewSection";
import AssessmentsSection from "../components/feedback/AssessmentsSection";
import { useTranslation } from "react-i18next";

export default function ApplicantFeedbackPage() {
  const { t } = useTranslation();
  const { user } = useUser();
  const [searchParams] = useSearchParams();
  const [applications, setApplications] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [stagesWithQuestions, setStagesWithQuestions] = useState([]);
  const [activeStage, setActiveStage] = useState(null);
  const [percentile, setPercentile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDetailed, setShowDetailed] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    supabase
      .from("applications")
      .select(
        `id, current_stage, is_rejected, applied_at, current_recruitment_stage:recruitment_stages!current_stage_id ( stage_type ), job_postings ( id, title, companies ( id, name ) )`,
      )
      .eq("candidate_profile_id", user.id)
      .order("applied_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) {
          const filtered = data.filter(
            (a) =>
              a.current_stage === "rejected" ||
              a.is_rejected === true ||
              a.current_stage === "hired" ||
              a.current_recruitment_stage?.stage_type === "offer",
          );
          setApplications(filtered);
          const urlAppId = searchParams.get("appId");
          if (urlAppId && filtered.some((a) => a.id === urlAppId))
            setSelectedId(urlAppId);
          else if (filtered.length > 0) setSelectedId(filtered[0].id);
        }
        setLoading(false);
      });
  }, [user?.id, searchParams]);

  useEffect(() => {
    if (!selectedId) {
      setSelectedApp(null);
      setStagesWithQuestions([]);
      setActiveStage(null);
      return;
    }
    getCandidateProfile(selectedId).then(async ({ data }) => {
      setSelectedApp(data);
      if (
        data?.job_postings?.id &&
        data.composite_score != null &&
        data.composite_score !== 0
      ) {
        getJobScorePercentile(data.job_postings.id, data.composite_score).then(
          ({ percentile: p }) => setPercentile(p),
        );
      }

      const allStages = (data.application_stages || [])
        .filter((s) => s.recruitment_stages)
        .sort(
          (a, b) =>
            (a.recruitment_stages.order_index || 0) -
            (b.recruitment_stages.order_index || 0),
        );
      const interviewStages = allStages.filter((s) =>
        [
          "assessment_test",
          "coding_test",
          "video_interview",
          "technical_interview",
          "hr_interview",
          "manager_interview",
          "ai_screening",
          "assessment",
        ].includes(s.recruitment_stages?.stage_type),
      );
      if (interviewStages.length === 0) {
        setStagesWithQuestions([]);
        setActiveStage(null);
        return;
      }

      const stageQuestions = await Promise.all(
        interviewStages.map(async (stage) => {
          const { data: questions } = await getCandidateStageQuestions(
            stage.id,
          );
          return { ...stage, questions: questions || [] };
        }),
      );
      setStagesWithQuestions(stageQuestions);
      setActiveStage(stageQuestions[0]);
    });
  }, [selectedId]);

  if (loading) {
    return <LoadingSpinner />;
  }

  const app = selectedApp;
  const candidate = app?.profiles || {};
  const selectedJob = app?.job_postings;
  const percentileTag = getPercentileTag(percentile);

  const allStages = (app?.application_stages || [])
    .filter((s) => s.recruitment_stages)
    .sort(
      (a, b) =>
        (a.recruitment_stages.order_index || 0) -
        (b.recruitment_stages.order_index || 0),
    );

  const cvStage = allStages.find(
    (s) => s.recruitment_stages?.stage_type === "cv_review",
  );

  function parseAIFeedback(stage) {
    if (!stage?.ai_feedback) return null;
    try {
      return JSON.parse(stage.ai_feedback);
    } catch {
      return null;
    }
  }
  const cvFeedback = parseAIFeedback(cvStage);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <Link
            to="/applicant"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent/80 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("feedback.back_to_dashboard")}
          </Link>
        </motion.div>

        <motion.h1
          className="text-2xl font-bold text-foreground mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
        >
          {t("feedback.title")}
        </motion.h1>

        {applications.length === 0 ? (
          <motion.div
            className="text-center py-20 bg-card rounded-2xl border border-border shadow-sm"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          >
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">
              {t("feedback.no_feedback_title")}
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
              {t("feedback.no_feedback_description")}
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                to="/applicant"
                className="px-5 py-2.5 bg-accent text-white rounded-lg text-sm font-semibold hover:bg-accent/90 transition-colors"
              >
                {t("feedback.back_to_dashboard")}
              </Link>
              <Link
                to="/jobs"
                className="px-5 py-2.5 border border-border text-foreground rounded-lg text-sm font-semibold hover:bg-surface-hover transition-colors"
              >
                {t("feedback.explore_jobs")}
              </Link>
            </div>
          </motion.div>
        ) : (
          <>
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-30px" }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <AppSelector
                applications={applications}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
            </motion.div>

            <div>
              {!app ? (
                <motion.div
                  className="text-center py-20 bg-card rounded-2xl border border-border shadow-sm"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, margin: "-30px" }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-muted-foreground font-medium">
                    {t("feedback.select_application")}
                  </p>
                </motion.div>
              ) : (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, margin: "-30px" }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  >
                    <CandidateHeader
                      app={app}
                      percentile={percentile}
                      percentileTag={percentileTag}
                    />
                  </motion.div>

                  <motion.div
                    className="mt-5"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, margin: "-30px" }}
                    transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
                  >
                    <KeyTakeaways
                      cvFeedback={cvFeedback}
                      stages={stagesWithQuestions}
                    />
                  </motion.div>

                  <motion.div
                    className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-5"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, margin: "-30px" }}
                    transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
                  >
                    {allStages.length > 0 && (
                      <div className="lg:col-span-2 space-y-5">
                        <ApplicationTimeline stages={allStages} />
                      </div>
                    )}

                    {(cvFeedback ||
                      stagesWithQuestions.length > 0 ||
                      selectedJob?.id) && (
                      <div
                        className={`space-y-5 ${allStages.length === 0 ? "lg:col-span-3" : ""}`}
                      >
                        <SkillsToDevelop
                          cvFeedback={cvFeedback}
                          stages={stagesWithQuestions}
                        />
                        <SimilarOpportunities
                          jobId={selectedJob?.id}
                          seniorityLevel={selectedJob?.seniority_level}
                          jobType={selectedJob?.job_type}
                        />
                      </div>
                    )}
                  </motion.div>

                  {(cvFeedback || stagesWithQuestions.length > 0) && (
                    <motion.div
                      className="mt-5"
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: false, margin: "-30px" }}
                      transition={{
                        duration: 0.4,
                        delay: 0.3,
                        ease: "easeOut",
                      }}
                    >
                      <button
                        onClick={() => setShowDetailed(!showDetailed)}
                        className="flex items-center gap-2 w-full px-4 py-3 rounded-xl border border-border bg-card hover:bg-surface-hover transition-colors text-sm font-semibold text-foreground"
                      >
                        {showDetailed ? (
                          <ChevronDown className="w-4 h-4 text-accent" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-accent" />
                        )}
                        {t("feedback.detailed_breakdown")}
                        <span className="text-xs font-normal text-muted-foreground ml-1">
                          {t("feedback.detailed_breakdown_hint")}
                        </span>
                      </button>

                      {showDetailed && (
                        <div className="mt-5 space-y-6">
                          <CvReviewSection app={app} />

                          {stagesWithQuestions.length > 0 && (
                            <AssessmentsSection
                              stagesWithQuestions={stagesWithQuestions}
                              activeStage={activeStage}
                              onSelectStage={setActiveStage}
                              candidateName={candidate.full_name}
                              jobTitle={selectedJob?.title}
                            />
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
