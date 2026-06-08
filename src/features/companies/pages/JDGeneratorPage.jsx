//src\features\companies\pages\JDGeneratorPage.jsx
import { useState } from "react";
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
  Sparkles,
  AlertTriangle,
  Check,
  Upload
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
          salaryMin: salaryMin ? Number(salaryMin) : null,
          salaryMax: salaryMax ? Number(salaryMax) : null,
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

  async function handlePublish() {
    if (!aiResult || !company?.id) return;

    setPublishing(true);
    setPublishError(null);

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
        salary_min: aiResult.salary_min || null,
        salary_max: aiResult.salary_max || null,
      });

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


  if (published) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 font-sans">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5 shadow-xs">
            <Check className="w-6 h-6 text-primary" strokeWidth={2.5} />
          </div>
          <h2 className="text-sidebar text-xl font-bold mb-1.5">
            {t("jd_generator.published.title")}
          </h2>
          <p className="text-muted-foreground/80 text-xs font-medium leading-relaxed mb-6">
            <span className="font-bold text-sidebar">{title}</span> {t("jd_generator.published.message")}
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
            }}
            className="h-10 px-5 rounded-xl text-white text-xs font-semibold bg-primary hover:bg-primary-hover transition shadow-xs cursor-pointer select-none"
          >
            {t("jd_generator.published.generate_another")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 font-sans">

      {/* Upper Navigation / Bar */}
      <div className="max-w-6xl mx-auto mb-4 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-base font-bold text-sidebar">
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
                Publish JD
              </>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">

        {/* Column 1: Role Brief Form */}
        <div className="bg-background rounded-xl border border-border/60 p-5 shadow-xs">
          <h2 className="text-sm font-bold text-sidebar mb-0.5">Role brief</h2>
          <p className="text-muted-foreground/70 text-xs mb-5">
            Fill in the basics — AI handles the rest.
          </p>

          <form
            onSubmit={handleGenerate}
            className="flex flex-col gap-4"dir="ltr"
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
                <p className="text-xs font-medium text-destructive mt-0.5">{errors.title}</p>
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
                  Generate JD
                  <Sparkles className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>
{/* Column 2: Live Preview Panel */}
        <div className="bg-background rounded-xl border border-border/60 p-5 shadow-xs min-h-[450px] lg:h-full">
          {!generated ? (
            <div className="flex flex-col items-center justify-center h-full py-20 text-center">
              <div className="w-12 h-12 rounded-xl bg-secondary/40 border border-border flex items-center justify-center mb-3.5 text-muted-foreground/70">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sidebar font-semibold text-xs">Fill in the role brief</p>
              <p className="text-muted-foreground/70 text-[11px] mt-0.5">and click Generate JD to preview the output</p>
            </div>
          ) : (
            <div className="space-y-5">

              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-primary/90 flex items-center gap-1 bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md">
                  <Sparkles className="w-3 h-3" />
                  AI Generated
                </span>
              </div>


              <div>
                <h2 className="text-base font-bold text-sidebar">
                  {previewMeta.title}
                </h2>

                <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5 text-xs font-medium text-muted-foreground/80">
                  {company?.name && (
                    <div className="flex items-center gap-1.5">
                      <Building2 size={14} className="text-muted-foreground/60" />
                      <span>{company.name}</span>
                    </div>
                  )}
                  {company?.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-muted-foreground/60" />
                      <span>{company.location}</span>
                    </div>
                  )}
                  {previewMeta.workLocation && (
                    <div className="flex items-center gap-1.5">
                      <Monitor size={14} className="text-muted-foreground/60" />
                      <span className="capitalize">{previewMeta.workLocation.replace("_", " ")}</span>
                    </div>
                  )}
                  {previewMeta.jobType && (
                    <div className="flex items-center gap-1.5">
                      <Briefcase size={14} className="text-muted-foreground/60" />
                      <span className="capitalize">{previewMeta.jobType.replace("_", " ")}</span>
                    </div>
                  )}
                  {previewMeta.seniority && (
                    <div className="flex items-center gap-1.5">
                      <TrendingUp
                        size={14}
                        className="text-muted-foreground/60"
                      />
                      <span className="capitalize">{previewMeta.seniority}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-muted-foreground/80 text-xs font-medium mt-1.5">
                  <BanknoteIcon size={14} className="text-emerald-600/90" />
                  <span>
                    {aiResult?.salary_min && aiResult?.salary_max
                      ? `${aiResult.salary_min.toLocaleString()} – ${aiResult.salary_max.toLocaleString()} EGP`
                      : t("jd_generator.preview.salary_confidential")}
                  </span>
                </div>
              </div>

              <div className="border-t border-border/40 pt-4">
                <h3 className="text-xs font-bold text-sidebar mb-1">About the role</h3>
                <p className="text-muted-foreground/90 text-xs font-medium leading-relaxed">{aiResult?.description}</p>
              </div>


              {aiResult?.responsibilities?.length > 0 && (
                <div className="border-t border-border/40 pt-4">
                  <h3 className="text-xs font-bold text-sidebar mb-2">
                    {t("jd_generator.preview.sections.responsibilities")}
                  </h3>
                  <ul className="space-y-1.5">
                    {aiResult.responsibilities.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-muted-foreground/90 text-xs font-medium leading-relaxed"
                      >
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}


              {aiResult?.requirements?.length > 0 && (
                <div className="border-t border-border/40 pt-4">
                  <h3 className="text-xs font-bold text-sidebar mb-2">
                    {t("jd_generator.preview.sections.requirements")}
                  </h3>
                  <ul className="space-y-1.5">
                    {aiResult.requirements.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-muted-foreground/90 text-xs font-medium leading-relaxed"
                      >
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}


              {aiResult?.skills?.length > 0 && (
                <div className="border-t border-border/40 pt-4">
                  <h3 className="text-xs font-bold text-sidebar mb-2.5">
                    {t("jd_generator.preview.sections.skills")}
                  </h3>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
                    {aiResult.skills.map((skill, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground/90"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary-foreground/30" />
                        {skill}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {publishError && (
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium text-destructive bg-destructive/10 border border-destructive/20">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  
                  {publishError}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
