import { Routes, Route, Navigate } from "react-router-dom";
import { useUser } from "./context/userContext";
import { USER_ROLE } from "./utils/enums";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import SignInPage from "./pages/auth/SignInPage";
import SignUpPage from "./pages/auth/SignUpPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import ApplicantPage from "./pages/applicant/ApplicantPage";
import JobsPage from "./pages/jobs/JobsPage";


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
    return <Navigate to="/applicant" replace />;
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
        path="/applicant"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLE.applicant]}>
            <ApplicantPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/jobs"
        element={
          <ProtectedRoute>
            <JobsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/companies"
        element={
          <ProtectedRoute>
          
          </ProtectedRoute>
        }
      />

      <Route
        path="/companies/:id"
        element={
          <ProtectedRoute>
          
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
