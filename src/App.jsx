import { Routes, Route, Navigate } from "react-router-dom";
import { useUser } from "@/features/auth/context/user.context";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import SignInPage from "@/features/auth/pages/SignInPage";
import SignUpPage from "@/features/auth/pages/SignUpPage";
import ForgotPasswordPage from "@/features/auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/features/auth/pages/ResetPasswordPage";
import { USER_ROLE } from "@/shared/constants/enums";
import ApplicantPage from "@/features/applicant/pages/ApplicantPage";
import JobsPage from "@/features/jobs/pages/JobsPage";
import CompanyLayout from "./features/companies/pages/CompanyLayout";
import MainLayout from "@/shared/ui/MainLayout";

function RootRedirect() {
  const { user, profile, loading } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-slate-900">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-2 text-slate-500 text-sm">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  if (profile?.role === USER_ROLE.applicant) {
    return <Navigate to="/jobs" replace />;
  }

  return <Navigate to="/companies" replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/auth/sign-in" element={<SignInPage />} />
      <Route path="/auth/sign-up" element={<SignUpPage />} />
      <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/auth/reset-password" element={<ResetPasswordPage />} />

      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/applicant" element={<ApplicantPage />} />

        <Route path="/jobs" element={<JobsPage />} />

        <Route path="/companies/*" element={<CompanyLayout />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;