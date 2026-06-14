// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useUser } from "@/features/auth/context/user.context";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import LandingPage from "@/features/landing/Pages/LandingPage";
import SignInPage from "@/features/auth/pages/SignInPage";
import SignUpPage from "@/features/auth/pages/SignUpPage";
import ForgotPasswordPage from "@/features/auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/features/auth/pages/ResetPasswordPage";
import AuthCallback from "@/features/auth/pages/AuthCallback";
import GoogleRoleSelect from "@/features/auth/pages/GoogleRoleSelect";
import { USER_ROLE } from "@/shared/constants/enums";
import ApplicantPage from "@/features/applicant/pages/ApplicantPage";
import ApplicantFeedbackPage from "@/features/applicant/pages/ApplicantFeedbackPage";
import ApplicantProfilePage from "@/features/applicant/pages/ApplicantProfilePage";
import JobsPage from "@/features/jobs/pages/JobsPage";
import CompanyLayout from "./features/companies/pages/CompanyLayout";
import MainLayout from "@/shared/ui/MainLayout";
import Recruiterscreen from "./features/recruiter/pages/recruiter_screen";
import InterviewPage from "./features/interview/pages/interviewPage";
import JobDetailsPage from "@/features/jobs/pages/JobDetailsPage";
import ApplyJobPage from "@/features/applications/pages/ApplyJobPage";
import PipelineCandidatesPage from "./features/recruiter/pages/PipelineCandidatesPage";
import PublicCompanyProfile from "./features/companies/pages/PublicCompanyProfile";
import PremiumSuccessPage from "./features/premium/pages/PremiumSuccessPage";
import PremiumCancelPage from "./features/premium/pages/PremiumCancelPage";
import LoadingSpinner from "@/shared/ui/LoadingSpinner";
import TermsPage from "./features/auth/pages/TermsPage";
import PrivacyPage from "./features/auth/pages/PrivacyPage";

// eslint-disable-next-line no-unused-vars
function RootRedirect() {
  const { user, profile, loading } = useUser();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <LandingPage />;
  }

  if (!profile) {
    return <LandingPage />;
  }

  if (profile.role === USER_ROLE.applicant) {
    return <Navigate to="/applicant" replace />;
  }

  return <Navigate to="/companies" replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route path="/auth/sign-in" element={<SignInPage />} />
      <Route path="/auth/sign-up" element={<SignUpPage />} />
      <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/auth/select-role" element={<GoogleRoleSelect />} />

      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/applicant"
          element={
            <ProtectedRoute allowedRoles={[USER_ROLE.applicant]}>
              <ApplicantPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/interview/:applicationId"
          element={
            <ProtectedRoute allowedRoles={[USER_ROLE.applicant]}>
              <InterviewPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/applicant/profile"
          element={
            <ProtectedRoute allowedRoles={[USER_ROLE.applicant]}>
              <ApplicantProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/applicant/feedback"
          element={
            <ProtectedRoute allowedRoles={[USER_ROLE.applicant]}>
              <ApplicantFeedbackPage />
            </ProtectedRoute>
          }
        />

        <Route path="/jobs" element={<JobsPage />} />

        <Route path="/jobs/:id" element={<JobDetailsPage />} />

        <Route path="/jobs/:id/apply" element={<ApplyJobPage />} />

        <Route
          path="/companies/*"
          element={
            <ProtectedRoute
              allowedRoles={[USER_ROLE.recruiter, USER_ROLE.hrManager]}
            >
              <CompanyLayout />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recruiter"
          element={
            <ProtectedRoute allowedRoles={[USER_ROLE.recruiter]}>
              <Recruiterscreen />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recruiter/candidatespipline"
          element={
            <ProtectedRoute>
              <PipelineCandidatesPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="/company/:id" element={<PublicCompanyProfile />} />

      <Route
        path="/premium/success"
        element={
          <ProtectedRoute>
            <PremiumSuccessPage />
          </ProtectedRoute>
        }
      />
      <Route path="/premium/cancel" element={<PremiumCancelPage />} />

      <Route path="/auth/terms" element={<TermsPage />} />
      <Route path="/auth/privacy" element={<PrivacyPage />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
