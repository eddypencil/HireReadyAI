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
import { useTranslation } from "react-i18next";

import FormHeader from "../components/apply/FormHeader";
import PersonalInfoStep from "../components/apply/PersonalInfoStep";
import ResumeUploadStep from "../components/apply/ResumeUploadStep";
import QuestionsStep from "../components/apply/QuestionsStep";
import FormFooter from "../components/apply/FormFooter";

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


  const clearFieldError = (field) => {
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
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

      setTimeout(() => {
        navigate("/jobs");
      }, 2000);
    } catch (err) {
      console.error(" Submit error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-muted flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl bg-card rounded-xl border border-border shadow-xs overflow-hidden">
        <FormHeader
          title={t("apply_job.title")}
          steps={steps}
          currentStep={step}
          progress={progress}
        />

        <div className="p-5 space-y-4">
          {step === 0 && (
            <PersonalInfoStep
              form={form}
              errors={errors}
              onChange={handleFormChange}
              clearFieldError={clearFieldError}
            />
          )}

          {step === 1 && (
            <ResumeUploadStep
              form={form}
              errors={errors}
              onChange={handleFormChange}
              clearFieldError={clearFieldError}
            />
          )}

          {step === 2 && (
            <QuestionsStep
              questions={questions}
              answers={form.answers}
              errors={errors}
              onAnswer={handleAnswer}
            />
          )}
        </div>

        <FormFooter
          currentStep={step}
          totalSteps={steps.length}
          onBack={() => setStep(step - 1)}
          onNext={() => {
            if (!validateStep()) return;
            setStep(step + 1);
          }}
          onSubmit={handleSubmit}
          loading={loading}
        />
      </div>
    </div>
  );
}
