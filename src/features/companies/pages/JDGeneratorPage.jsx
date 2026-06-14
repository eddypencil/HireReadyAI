//src\features\companies\pages\JDGeneratorPage.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import { SENIORITY_LEVEL } from "@/shared/constants/enums";
import { useJobs } from "@/features/jobs/hooks/useJobs";
import { supabase } from "@/shared/services/supabase";
import { seedAnchorStages } from "@/features/recruiter/services/candidatesPipline.service";
import { useTranslation } from "react-i18next";
import {
  Building2,
  MapPin,
  Briefcase,
  Monitor,
  TrendingUp,
  BanknoteIcon,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  X,
  Sparkles,
  AlertTriangle,
  Check,
  Upload,
} from "lucide-react";

const SUPABASE_FUNCTION_URL =
  "https://bztehkwxefeyknoogzkr.supabase.co/functions/v1/jd-generate";

export default function JDGeneratorPage({ company, profile }) {
  const { createJob } = useJobs();
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [seniority, setSeniority] = useState("");
  const [workLocation, setWorkLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [keyNotes, setKeyNotes] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [requiredSkills, setRequiredSkills] = useState("");
  const [previewMeta, setPreviewMeta] = useState({
    title: "",
    seniority: "",
    workLocation: "",
    jobType: "",
    experienceYears: "",
  });
  const [errors, setErrors] = useState({});

  const [generated, setGenerated] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [generateError, setGenerateError] = useState(null);
  const [publishError, setPublishError] = useState(null);
  const [published, setPublished] = useState(false);

  // Questions management
  const [questions, setQuestions] = useState([]);
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);
  const questionsTypes = ["text", "textarea", "yes_no"];

  function addQuestion() {
    setQuestions((prev) => [
      ...prev,
      { question: "", type: "text", order_index: prev.length },
    ]);
  }

  function removeQuestion(index) {
    setQuestions((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((q, i) => ({ ...q, order_index: i })),
    );
  }

  function updateQuestion(index, field, value) {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, [field]: value } : q)),
    );
  }

  function moveUp(index) {
    if (index === 0) return;
    setQuestions((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next.map((q, i) => ({ ...q, order_index: i }));
    });
  }

  function moveDown(index) {
    setQuestions((prev) => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next.map((q, i) => ({ ...q, order_index: i }));
    });
  }

  const inputClass =
    "w-full h-10 rounded-xl px-3.5 text-sm text-foreground bg-background border border-input outline-none transition-all duration-200 placeholder:text-muted-foreground/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary disabled:opacity-50 disabled:cursor-not-allowed";

  const selectClass =
    "w-full h-10 rounded-xl px-3.5 text-sm text-foreground bg-background border border-input outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary cursor-pointer";

  const labelClass =
    "text-[11px] font-bold text-muted-foreground/80 uppercase tracking-wider";

  const fieldClass = (base, errorKey) =>
    `${base} ${errors[errorKey] ? "!border-destructive/60 focus-visible:ring-destructive/20 focus-visible:border-destructive" : ""}`;

  function validate() {
    const newErrors = {};
    if (!title) newErrors.title = "Job title is required";
    if (!seniority) newErrors.seniority = "Please select a seniority level";
    if (!jobType) newErrors.jobType = "Please select a job type";
    if (!workLocation) newErrors.workLocation = "Please select a work type";
    if (!experienceYears)
      newErrors.experienceYears = "Please select experience required";
    if (salaryMin || salaryMax) {
      const min = Number(salaryMin);
      const max = Number(salaryMax);
      if (salaryMin && isNaN(min)) newErrors.salary = "Salary must be a number";
      if (salaryMax && isNaN(max)) newErrors.salary = "Salary must be a number";
      else if (salaryMin && salaryMax && min > max)
        newErrors.salary = "Max salary must be greater than Min salary";
      else if (salaryMin && !salaryMax)
        newErrors.salary = "Please enter a Max salary";
      else if (salaryMax && !salaryMin)
        newErrors.salary = "Please enter a Min salary";
    }
    return newErrors;
  }

  async function handleGenerate(e) {
    e.preventDefault();

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setGenerating(true);
    setPreviewMeta({
      title,
      seniority,
      workLocation,
      jobType,
      experienceYears,
    });
    setGenerateError(null);
    setGenerated(false);
    setAiResult(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch(SUPABASE_FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          title,
          seniority,
          workLocation,
          location: company?.location || "",
          keyNotes,
          requiredSkills,
          experienceYears,
          companyName: company?.name || "",
          companyIndustry: company?.industry || "",
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to generate JD");
      }

      const result = await response.json();
      setAiResult(result);
      setGenerated(true);
    } catch (err) {
      setGenerateError(err.message);
    } finally {
      setGenerating(false);
    }
  }

  async function executePublish(withQuestions) {
    if (!aiResult || !company?.id) return;

    setPublishing(true);
    setPublishError(null);
    setShowQuestionsModal(false);

    try {
      const newJob = await createJob({
        company_id: company.id,
        created_by_profile_id: profile?.id || null,
        title,
        seniority_level: seniority || null,
        job_type: jobType || null,
        work_location: workLocation || null,
        experience_years: experienceYears || null,
        description: aiResult.description,
        responsibilities: aiResult.responsibilities,
        requirements: aiResult.requirements,
        skills: aiResult.skills,
        salary_min: salaryMin ? Number(salaryMin) : null,
        salary_max: salaryMax ? Number(salaryMax) : null,
      });

      // Step 2: Save application questions (only if withQuestions is true)
      if (withQuestions && newJob?.id && questions.length > 0) {
        const questionRows = questions
          .filter((q) => q.question.trim())
          .map((q, i) => ({
            job_id: newJob.id,
            question: q.question.trim(),
            type: q.type,
            order_index: i,
          }));
        if (questionRows.length > 0) {
          const { error: qError } = await supabase
            .from("questions")
            .insert(questionRows);
          if (qError)
            throw new Error(`Failed to save questions: ${qError.message}`);
        }
      }

      // Step 3: Seed the 3 locked anchor stages (CV Review → Shortlist → Offer)
      if (newJob?.id) {
        await seedAnchorStages(newJob.id);
      }

      setPublished(true);
    } catch (err) {
      setPublishError(err.message);
    } finally {
      setPublishing(false);
    }
  }

  function handlePublish() {
    setPublishError(null);
    setShowQuestionsModal(true);
  }

  if (published) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="min-h-screen bg-background flex items-center justify-center p-6 font-sans"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="text-center max-w-sm"
        >
          <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5 shadow-xs">
            <Check className="w-6 h-6 text-primary" strokeWidth={2.5} />
          </div>
          <h2 className="text-foreground text-xl font-bold mb-1.5">
            {t("jd_generator.published.title")}
          </h2>
          <p className="text-muted-foreground/80 text-xs font-medium leading-relaxed mb-6">
            <span className="font-bold text-foreground">{title}</span>{" "}
            {t("jd_generator.published.message")}
          </p>
          <button
            onClick={() => {
              setPublished(false);
              setGenerated(false);
              setAiResult(null);
              setTitle("");
              setSeniority("");
              setWorkLocation("");
              setJobType("");
              setSalaryMin("");
              setSalaryMax("");
              setKeyNotes("");
              setExperienceYears("");
              setRequiredSkills("");
              setErrors({});
              setPreviewMeta({
                title: "",
                seniority: "",
                workLocation: "",
                jobType: "",
                experienceYears: "",
              });
              setQuestions([]);
            }}
            className="h-10 px-5 rounded-xl text-white text-xs font-semibold bg-primary hover:bg-primary-hover transition shadow-xs cursor-pointer select-none"
          >
            {t("jd_generator.published.generate_another")}
          </button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 font-sans">
      {/* Upper Navigation / Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="max-w-6xl mx-auto mb-4 flex items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-base font-bold text-foreground">
            {t("jd_generator.header.title")}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 h-9 rounded-xl text-xs font-semibold border border-border text-muted-foreground hover:bg-secondary/40 transition bg-background cursor-pointer select-none">
            {t("jd_generator.header.save_draft")}
          </button>
          <button
            onClick={handlePublish}
            disabled={!generated || publishing}
            className={`px-4 h-9 rounded-xl text-xs font-semibold text-white flex items-center gap-1.5 transition select-none
              ${
                generated && !publishing
                  ? "bg-primary hover:bg-primary-hover cursor-pointer shadow-xs"
                  : "bg-muted text-muted-foreground/60 cursor-not-allowed border border-border/40"
              }`}
            style={
              generated ? { boxShadow: "0 2px 12px rgba(132,0,255,0.2)" } : {}
            }
          >
            {publishing ? (
              <>
                <span className="inline-block w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                {t("jd_generator.header.publishing")}
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5" />
                {t("jd_generator.header.publish")}
              </>
            )}
          </button>
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* Column 1: Role Brief Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-background rounded-xl border border-border/60 p-5 shadow-xs"
        >
          <h2 className="text-sm font-bold text-foreground mb-0.5">
            {t("jd_generator.form.title")}
          </h2>
          <p className="text-muted-foreground/70 text-xs mb-5">
            {t("jd_generator.form.subtitle")}
          </p>

          <form
            onSubmit={handleGenerate}
            className="flex flex-col gap-4"
            dir="ltr"
          >
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Role title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setErrors((p) => ({ ...p, title: "" }));
                }}
                placeholder="Job title"
                className={fieldClass(inputClass, "title")}
              />
              {errors.title && (
                <p className="text-xs font-medium text-destructive mt-0.5">
                  {errors.title}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Seniority</label>
                <select
                  value={seniority}
                  onChange={(e) => {
                    setSeniority(e.target.value);
                    setErrors((p) => ({ ...p, seniority: "" }));
                  }}
                  className={fieldClass(selectClass, "seniority")}
                >
                  <option value="">Select seniority</option>
                  {Object.values(SENIORITY_LEVEL).map((lvl) => (
                    <option key={lvl} value={lvl} className="capitalize">
                      {lvl}
                    </option>
                  ))}
                </select>
                {errors.seniority && (
                  <p className="text-xs font-medium text-destructive mt-0.5">
                    {errors.seniority}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Job type</label>
                <select
                  value={jobType}
                  onChange={(e) => {
                    setJobType(e.target.value);
                    setErrors((p) => ({ ...p, jobType: "" }));
                  }}
                  className={fieldClass(selectClass, "jobType")}
                >
                  <option value="">Select type</option>
                  <option value="full_time">Full Time</option>
                  <option value="part_time">Part Time</option>
                </select>
                {errors.jobType && (
                  <p className="text-xs font-medium text-destructive mt-0.5">
                    {errors.jobType}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Work Type</label>
              <select
                value={workLocation}
                onChange={(e) => {
                  setWorkLocation(e.target.value);
                  setErrors((p) => ({ ...p, workLocation: "" }));
                }}
                className={fieldClass(selectClass, "workLocation")}
              >
                <option value="">Select Work Type</option>
                <option value="on_site">On-Site</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
              </select>
              {errors.workLocation && (
                <p className="text-xs font-medium text-destructive mt-0.5">
                  {errors.workLocation}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Experience required</label>
              <input
                type="text"
                value={experienceYears}
                onChange={(e) => {
                  setExperienceYears(e.target.value);
                  setErrors((p) => ({ ...p, experienceYears: "" }));
                }}
                placeholder="e.g. 1-3 years"
                className={fieldClass(inputClass, "experienceYears")}
              />
              {errors.experienceYears && (
                <p className="text-xs font-medium text-destructive mt-0.5">
                  {errors.experienceYears}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>
                Required skills
                <span className="text-muted-foreground/50 normal-case font-normal">
                  (optional)
                </span>
              </label>
              <input
                type="text"
                value={requiredSkills}
                onChange={(e) => setRequiredSkills(e.target.value)}
                placeholder="Required skills"
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>
                Salary range (EGP)
                <span className="text-muted-foreground/50 normal-case font-normal">
                  (optional)
                </span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  placeholder="Min"
                  className={inputClass}
                />
                <span className="text-muted-foreground/60 text-xs shrink-0 font-medium">
                  to
                </span>
                <input
                  type="number"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  placeholder="Max"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>
                Key notes
                <span className="text-muted-foreground/50 normal-case font-normal">
                  (optional)
                </span>
              </label>
              <textarea
                rows={4}
                value={keyNotes}
                onChange={(e) => setKeyNotes(e.target.value)}
                placeholder="Additional hiring notes..."
                className="w-full rounded-xl px-3.5 py-2.5 text-sm text-foreground bg-background border border-input outline-none transition-all duration-200 placeholder:text-muted-foreground/50 resize-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary"
              />
            </div>

            {generateError && (
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium text-destructive bg-destructive/10 border border-destructive/20">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />

                {generateError}
              </div>
            )}

            <button
              type="submit"
              disabled={generating}
              className={`w-full h-10 rounded-xl text-white text-xs font-semibold transition flex items-center justify-center gap-1.5 select-none shadow-xs
                ${generating ? "bg-primary/60 cursor-not-allowed" : "bg-primary hover:bg-primary-hover cursor-pointer"}`}
            >
              {generating ? (
                <>
                  <span className="inline-block w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  {t("jd_generator.form.buttons.generating")}
                </>
              ) : (
                <>
                  {t("jd_generator.form.buttons.generate")}
                  <Sparkles className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </motion.div>
        {/* Column 2: Live Preview Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-background rounded-xl border border-border/60 p-5 shadow-xs min-h-[450px] lg:h-full"
        >
          {!generated ? (
            <div className="flex flex-col items-center justify-center h-full py-20 text-center">
              <div className="w-12 h-12 rounded-xl bg-secondary/40 border border-border flex items-center justify-center mb-3.5 text-muted-foreground/70">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <p className="text-foreground font-semibold text-xs">
                {t("jd_generator.preview.empty_title")}
              </p>
              <p className="text-muted-foreground/70 text-[11px] mt-0.5">
                {t("jd_generator.preview.empty_subtitle")}
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-primary/90 flex items-center gap-1 bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md">
                    <Sparkles className="w-3 h-3" />
                    {t("jd_generator.preview.ai_generated")}
                  </span>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    {previewMeta.title}
                  </h2>
                  <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                    {company?.name && (
                      <div className="flex items-center gap-2">
                        <Building2 size={16} className="text-blue-500" />
                        <span>{company.name}</span>
                      </div>
                    )}
                    {company?.location && (
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-red-400" />
                        <span>{company.location}</span>
                      </div>
                    )}
                    {previewMeta.workLocation && (
                      <div className="flex items-center gap-2">
                        <Monitor size={16} className="text-fuchsia-500" />
                        <span>
                          {previewMeta.workLocation.replace("_", " ")}
                        </span>
                      </div>
                    )}
                    {previewMeta.jobType && (
                      <div className="flex items-center gap-2">
                        <Briefcase size={16} className="text-orange-400" />
                        <span>{previewMeta.jobType.replace("_", " ")}</span>
                      </div>
                    )}
                    {previewMeta.seniority && (
                      <div className="flex items-center gap-2">
                        <TrendingUp size={16} className="text-primary" />
                        <span>{previewMeta.seniority}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground text-sm mt-2">
                    <BanknoteIcon size={16} className="text-green-500" />
                    <span>
                      {salaryMin && salaryMax
                        ? `${Number(salaryMin).toLocaleString()} – ${Number(salaryMax).toLocaleString()} EGP`
                        : "Salary: Confidential"}
                    </span>
                  </div>
                </div>

                {aiResult?.description && (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                      visible: { transition: { staggerChildren: 0.1 } },
                    }}
                    className="mt-6 space-y-5"
                  >
                    <motion.div
                      variants={{
                        hidden: { opacity: 0, y: 15 },
                        visible: { opacity: 1, y: 0 },
                      }}
                    >
                      <h3 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">
                        Description
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {aiResult.description}
                      </p>
                    </motion.div>

                    {aiResult.responsibilities?.length > 0 && (
                      <motion.div
                        variants={{
                          hidden: { opacity: 0, y: 15 },
                          visible: { opacity: 1, y: 0 },
                        }}
                      >
                        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">
                          Responsibilities
                        </h3>
                        <ul className="space-y-1.5">
                          {aiResult.responsibilities.map((item, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 text-sm text-muted-foreground"
                            >
                              <span className="w-1 h-1 rounded-full bg-primary mt-2 shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}

                    {aiResult.requirements?.length > 0 && (
                      <motion.div
                        variants={{
                          hidden: { opacity: 0, y: 15 },
                          visible: { opacity: 1, y: 0 },
                        }}
                      >
                        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">
                          Requirements
                        </h3>
                        <ul className="space-y-1.5">
                          {aiResult.requirements.map((item, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 text-sm text-muted-foreground"
                            >
                              <span className="w-1 h-1 rounded-full bg-accent mt-2 shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}

                    {aiResult.skills?.length > 0 && (
                      <motion.div
                        variants={{
                          hidden: { opacity: 0, y: 15 },
                          visible: { opacity: 1, y: 0 },
                        }}
                      >
                        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">
                          Skills
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {aiResult.skills.map((item, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {publishError && (
                  <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium text-destructive bg-destructive/10 border border-destructive/20">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />

                    {publishError}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Questions Modal */}
          {showQuestionsModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <div className="bg-card rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
                  <div>
                    <h2 className="text-lg font-bold text-foreground">
                      {t("application_questions_modal.title")}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t("application_questions_modal.subtitle")}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowQuestionsModal(false)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                  {questions.length === 0 && (
                    <p className="text-sm text-muted-foreground italic text-center py-8">
                      No questions yet. Click "Add Question" to get started.
                    </p>
                  )}
                  {questions.map((q, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 bg-muted rounded-xl p-3 border border-border"
                    >
                      <div className="flex flex-col gap-0.5 pt-0.5">
                        <button
                          onClick={() => moveUp(i)}
                          disabled={i === 0}
                          className="p-0.5 rounded text-muted-foreground hover:text-primary disabled:opacity-20 disabled:cursor-not-allowed transition"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => moveDown(i)}
                          disabled={i === questions.length - 1}
                          className="p-0.5 rounded text-muted-foreground hover:text-primary disabled:opacity-20 disabled:cursor-not-allowed transition"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={q.question}
                          onChange={(e) =>
                            updateQuestion(i, "question", e.target.value)
                          }
                          placeholder="Write your question..."
                          className="w-full h-9 rounded-lg px-3 text-sm text-foreground bg-background border border-input outline-none focus:border-ring transition placeholder:text-muted-foreground"
                        />
                        <select
                          value={q.type}
                          onChange={(e) =>
                            updateQuestion(i, "type", e.target.value)
                          }
                          className="h-8 rounded-lg px-2 text-xs text-foreground bg-background border border-input outline-none focus:border-ring transition"
                        >
                          {questionsTypes.map((t) => (
                            <option key={t} value={t}>
                              {t.replace("_", " ")}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        onClick={() => removeQuestion(i)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition shrink-0 mt-0.5"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted rounded-b-2xl shrink-0">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={addQuestion}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-primary bg-card border border-border hover:bg-surface-muted transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Question
                    </button>
                    {questions.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {questions.length} question
                        {questions.length !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => executePublish(false)}
                      disabled={publishing}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-foreground bg-card border border-border hover:bg-surface-muted transition disabled:opacity-50"
                    >
                      {t("application_questions_modal.skip")}
                    </button>
                    <button
                      onClick={() => executePublish(true)}
                      disabled={publishing}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-primary hover:bg-primary-hover transition disabled:opacity-50"
                    >
                      {publishing
                        ? t("jd_generator.header.publishing")
                        : t("jd_generator.header.confirm")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
