// src/features/applications/pages/ApplyJobPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "@/features/auth/context/user.context";
import { fetchQuestionsByJobId } from "../services/application.service";
import { createApplication } from "../services/application.service";
import { triggerCvReview } from "../services/cv-review.service";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.js?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
import { supabase } from "@/shared/services/supabase";
import QuestionCard from "../components/apply/QuestionCard";
import { useTranslation } from "react-i18next";

export default function ApplyJobPage() {
  const { id: jobId } = useParams();
  const navigate = useNavigate();
  const { profile } = useUser();
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    resume: null,
    answers: {},
  });

  const steps = [
    t("apply_job.steps.info"),
    t("apply_job.steps.resume"),
    t("apply_job.steps.questions"),
  ];
  const progress = ((step + 1) / steps.length) * 100;
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast(null);
    }, 2000);

    return () => clearTimeout(timer);
  }, [toast]);

  const clearFieldError = (field) => {
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  };

  const validateStep = () => {
    const stepErrors = {};

    if (step === 0) {
      if (!form.fullName.trim()) {
        stepErrors.fullName = "Full name is required";
      }

      if (!form.email.trim()) {
        stepErrors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(form.email)) {
        stepErrors.email = "Invalid email format";
      }

      if (!form.phone.trim()) {
        stepErrors.phone = "Phone is required";
      } else if (form.phone.length < 10) {
        stepErrors.phone = "Invalid phone number";
      }
    }

    if (step === 1 && !form.resume) {
      stepErrors.resume = "Resume is required";
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  useEffect(() => {
    if (!jobId) return;

    const loadQuestions = async () => {
      try {
        const data = await fetchQuestionsByJobId(jobId);
        setQuestions(data);
      } catch (err) {
        console.error("Error loading questions:", err);
      }
    };

    loadQuestions();
  }, [jobId]);

  const handleAnswer = (id, value) => {
    setForm((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        [id]: value,
      },
    }));

    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[`question_${id}`];
      return copy;
    });
  };

  const uploadResume = async (file) => {
    const fileName = `${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("resumes")
      .upload(fileName, file);

    if (error) throw error;

    const { data } = supabase.storage.from("resumes").getPublicUrl(fileName);

    return data.publicUrl;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.fullName.trim()) newErrors.fullName = "This field can't be empty";

    if (!form.email.trim()) newErrors.email = "This field can't be empty";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Please enter a valid email";

    if (!form.phone.trim()) newErrors.phone = "This field can't be empty";
    else if (form.phone.length < 10)
      newErrors.phone = "Please enter a valid phone number";

    if (!form.resume) newErrors.resume = "Resume is required";
    else {
      if (form.resume.type !== "application/pdf")
        newErrors.resume = "Only PDF files are allowed";

      if (form.resume.size > 5 * 1024 * 1024)
        newErrors.resume = "Maximum file size is 5MB";
    }

    questions.forEach((q) => {
      if (!form.answers[q.id]) {
        newErrors[`question_${q.id}`] = "This field can't be empty";
      }
    });

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    try {
      if (!validateForm()) {
        setToast({
          type: "error",
          message: "Please complete all required fields",
        });
        return;
      }

      setLoading(true);

      let cvUrl = null;
      let cvName = null;
      let cvText = "";

      if (form.resume) {
        const file = form.resume;

        cvUrl = await uploadResume(file);
        cvName = file.name;

        try {
          const arrayBuffer = await file.arrayBuffer();
          const pdfDocument = await pdfjsLib.getDocument({ data: arrayBuffer })
            .promise;
          for (let i = 1; i <= pdfDocument.numPages; i++) {
            const page = await pdfDocument.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
              .map((item) => item.str)
              .join(" ");
            cvText += pageText + "\n";
          }
        } catch (extractErr) {
          console.error("Client-side PDF extraction failed:", extractErr);
        }
      }
      const { data: existing } = await supabase
        .from("applications")
        .select("id")
        .eq("candidate_profile_id", profile.id)
        .eq("job_id", jobId)
        .maybeSingle();

      if (existing) {
        setToast({
          type: "error",
          message: "You have already applied for this job",
        });

        return;
      }
      const payload = {
        candidate_profile_id: profile.id,
        job_id: jobId,
        cv_file_url: cvUrl,
        cv_file_name: cvName,
        answers: {
          info: {
            fullName: form.fullName,
            email: form.email,
            phone: form.phone,
          },
          questions: form.answers,
        },
        current_stage: "applied",
        applied_at: new Date().toISOString(),
      };

      const application = await createApplication(payload);

      triggerCvReview(application.id, cvText.trim());

      setToast({
        type: "success",
        message: "Application submitted successfully!",
      });

      setTimeout(() => {
        navigate("/jobs");
      }, 2000);
    } catch (err) {
      console.error(" Submit error:", err);
      setToast({
        type: "error",
        message: "Something went wrong!",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div
            className={`px-3.5 py-2 rounded-xl shadow-xs text-sm font-semibold border flex items-center gap-2
            ${toast.type === "success"
                ? "bg-green-500/10 text-green-600 border-green-500/20"
                : "bg-destructive/10 text-destructive border-destructive/20"
              }
          `}
          >
            <span>{toast.type === "success" ? "✅" : "❌"}</span>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-secondary/20 flex items-center justify-center px-4 py-8 font-sans">
        <div className="w-full max-w-2xl bg-background rounded-xl border border-border/70 shadow-xs overflow-hidden">
          {/* HEADER */}
          <div className="p-5 border-b border-border/60 bg-background">
            <h1 className="text-xl font-bold text-sidebar">
              {t("apply_job.title")}
            </h1>

            {/* STEPS */}
            <div className="mt-4 flex justify-between text-[11px]">
              {steps.map((s, i) => (
                <span
                  key={i}
                  className={`font-bold transition-colors duration-200 uppercase tracking-wider ${i <= step
                      ? "text-accent font-extrabold"
                      : "text-muted-foreground/40"
                    }`}
                >
                  {s}
                </span>
              ))}
            </div>

            {/* PROGRESS BAR */}
            <div className="w-full h-1.5 bg-secondary rounded-full mt-2.5 overflow-hidden border border-border/20">
              <div
                className="h-full bg-accent rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* BODY */}
          <div dir="ltr" className="p-5 space-y-4">
            {step === 0 && (
              <div className="space-y-4">
                {/* FULL NAME */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={form.fullName || ""}
                    className={`w-full h-10 rounded-lg px-3 text-sm bg-background font-medium border outline-none transition-all focus:ring-2 focus:ring-primary/10 focus:border-primary
                    ${errors.fullName
                        ? "border-destructive focus:ring-destructive/10 focus:border-destructive"
                        : "border-border"
                      }`}
                    onChange={(e) => {
                      setForm((prev) => ({
                        ...prev,
                        fullName: e.target.value,
                      }));
                      if (errors.fullName) clearFieldError("fullName");
                    }}
                  />
                  {errors.fullName && (
                    <p className="text-xs text-destructive font-medium mt-1 pl-0.5">{errors.fullName}</p>
                  )}
                </div>

                {/* EMAIL */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={form.email || ""}
                    className={`w-full h-10 rounded-lg px-3 text-sm bg-background font-medium border outline-none transition-all focus:ring-2 focus:ring-primary/10 focus:border-primary
                    ${errors.email
                        ? "border-destructive focus:ring-destructive/10 focus:border-destructive"
                        : "border-border"
                      }`}
                    onChange={(e) => {
                      setForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }));
                      if (errors.email) clearFieldError("email");
                    }}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive font-medium mt-1 pl-0.5">{errors.email}</p>
                  )}
                </div>

                {/* PHONE */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                   Phone *
                  </label>
                  <input
                    type="tel"
                    value={form.phone || ""}
                    className={`w-full h-10 rounded-lg px-3 text-sm bg-background font-medium border outline-none transition-all focus:ring-2 focus:ring-primary/10 focus:border-primary
                    ${errors.phone
                        ? "border-destructive focus:ring-destructive/10 focus:border-destructive"
                        : "border-border"
                      }`}
                    onChange={(e) => {
                      setForm((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }));
                      if (errors.phone) clearFieldError("phone");
                    }}
                  />
                  {errors.phone && (
                    <p className="text-xs text-destructive font-medium mt-1 pl-0.5">{errors.phone}</p>
                  )}
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  {t("apply_job.labels.resume")} *
                </label>
                <label
                  className={`block border border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
                  ${errors.resume
                      ? "border-destructive/60 bg-destructive/5"
                      : "border-border bg-secondary/10 hover:border-accent/40 hover:bg-secondary/30"
                    }`}
                >
                  <input
                    type="file"
                    accept=".pdf"
                    hidden
                    onChange={(e) => {
                      setForm((prev) => ({
                        ...prev,
                        resume: e.target.files[0],
                      }));
                      if (errors.resume) clearFieldError("resume");
                    }}
                  />
                  <p className="text-sm text-sidebar font-semibold">
                    {form.resume
                      ? form.resume.name
                      : t("apply_job.placeholders.upload_resume")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("apply_job.placeholders.drag_drop")}
                  </p>
                </label>
                {errors.resume && (
                  <p className="text-xs text-destructive font-medium mt-1.5 pl-0.5">{errors.resume}</p>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1 bg-secondary/10 p-4 rounded-xl border border-border/50">
                {questions.map((q) => (
                  <QuestionCard
                    key={q.id}
                    question={q}
                    value={form.answers[q.id]}
                    error={errors[`question_${q.id}`]}
                    onChange={(val) => handleAnswer(q.id, val)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="p-4 border-t border-border/60 flex justify-between bg-background">
            {step > 0 ? (
              <button
                className="px-3.5 py-1.5 rounded-lg border border-border text-sidebar font-semibold bg-background hover:bg-secondary/50 transition-colors text-sm cursor-pointer select-none"
                onClick={() => setStep(step - 1)}
              >
                {t("apply_job.buttons.back")}
              </button>
            ) : (
              <div />
            )}

            {step < 2 ? (
              <button
                className="px-4 py-1.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors cursor-pointer select-none"
                onClick={() => {
                  const isValid = validateStep();
                  if (!isValid) {
                    setToast({
                      type: "error",
                      message: "Please fix errors before continuing",
                    });
                    return;
                  }
                  setStep(step + 1);
                }}
              >
                {t("apply_job.buttons.next")}
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-1.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50 cursor-pointer select-none"
              >
                {loading
                  ? t("apply_job.buttons.submitting")
                  : t("apply_job.buttons.submit")}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}