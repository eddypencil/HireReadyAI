import { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";
import { User } from "./models/user";
import { useUser } from "./context/userContext";
import { USER_ROLE } from "./utils/enums";
import { CompaniesPage } from "./views/CompaniesPage";
import { CompanyDetailsPage } from "./views/CompanyDetailsPage";
import { JobsPage } from "./views/JobsPage";

function App() {
  const {
    user,
    profile,
    loading,
    signUpUser,
    signInUser,
    signOutUser,
    resetUserPassword,
    updateUserPassword,
  } = useUser();
  const [view, setView] = useState("signin"); // signin, signup, forgot, reset
  const [notification, setNotification] = useState(null);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState(USER_ROLE.applicant);
  const [newPassword, setNewPassword] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    // Detect password reset flow from URL hash
    const hash = window.location.hash;
    if (
      hash &&
      (hash.includes("type=recovery") || hash.includes("access_token="))
    ) {
      setView("reset");
      showNotification(
        "info",
        "Recovery link detected. Please set your new password.",
      );
    }
  }, []);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 6000);
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || !fullName || !phone) {
      showNotification("error", "Please fill in all fields.");
      return;
    }
    setActionLoading(true);
    try {
      const userProfile = new User(fullName, role, phone, true);
      await signUpUser(email, password, userProfile);
      showNotification(
        "success",
        "Sign up successful! Please check your email for verification if email confirmation is enabled.",
      );
      setEmail("");
      setPassword("");
      setFullName("");
      setPhone("");
    } catch (err) {
      showNotification(
        "error",
        err.message || "An error occurred during registration.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showNotification("error", "Please enter email and password.");
      return;
    }
    setActionLoading(true);
    try {
      await signInUser(email, password);
      showNotification("success", "Welcome back!");
    } catch (err) {
      showNotification("error", err.message || "Invalid credentials.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      showNotification("error", "Please enter your email address.");
      return;
    }
    setActionLoading(true);
    try {
      // Direct back to the current origin for testing/development
      const redirectUrl = window.location.origin;
      await resetUserPassword(email, redirectUrl);
      showNotification("success", "Password reset link sent to your email!");
      setEmail("");
    } catch (err) {
      showNotification("error", err.message || "Failed to send reset link.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      showNotification("error", "Password must be at least 6 characters.");
      return;
    }
    setActionLoading(true);
    try {
      await updateUserPassword(newPassword);
      showNotification(
        "success",
        "Password updated successfully! You can now sign in.",
      );
      setView("signin");
      setNewPassword("");
      // Clear URL hash
      window.history.replaceState(null, null, " ");
    } catch (err) {
      showNotification("error", err.message || "Failed to update password.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSignOutClick = async () => {
    setActionLoading(true);
    try {
      await signOutUser();
      showNotification("success", "Signed out successfully.");
      setView("signin");
    } catch (err) {
      showNotification("error", err.message || "Failed to sign out.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-slate-900">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-2 text-slate-500 text-sm">Loading...</p>
      </div>
    );
  }

  // ── Logged-in: show full app with router ──
  if (user) {
    const isApplicant = profile?.role === USER_ROLE.applicant;
    
    return (
      <BrowserRouter>
        {/* Minimal nav bar */}
        <nav className="border-b border-gray-200 bg-white px-4 py-2 flex justify-between items-center text-sm">
          <div className="flex gap-4">
            <Link
              to="/jobs"
              className="text-blue-600 hover:underline font-medium"
            >
              Jobs
            </Link>
            {!isApplicant && (
              <Link
                to="/companies"
                className="text-blue-600 hover:underline font-medium"
              >
                Companies
              </Link>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>{profile?.full_name || user.email} ({profile?.role})</span>
            <button
              onClick={handleSignOutClick}
              className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
            >
              Sign Out
            </button>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={isApplicant ? <JobsPage /> : <CompaniesPage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/companies" element={<CompaniesPage />} />
          <Route path="/companies/:id" element={<CompanyDetailsPage />} />
        </Routes>
      </BrowserRouter>
    );
  }

  // ── Not logged in: show auth forms ──
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-slate-800 font-sans">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-900">HireReadyAI</h1>
          <p className="text-xs text-slate-500">Auth System</p>
        </div>

        {/* Notifications */}
        {notification && (
          <div
            className={`mb-4 p-3 rounded text-sm border ${
              notification.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : notification.type === "error"
                  ? "bg-red-50 border-red-200 text-red-800"
                  : "bg-blue-50 border-blue-200 text-blue-800"
            }`}
          >
            {notification.message}
          </div>
        )}

        {/* Auth forms */}
        <div>
          {view === "signin" && (
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              <h2 className="text-lg font-bold text-slate-950">Sign In</h2>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm text-slate-900 bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-slate-600">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setView("forgot")}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm text-slate-900 bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={actionLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded disabled:opacity-50 cursor-pointer"
              >
                {actionLoading ? "Signing In..." : "Sign In"}
              </button>
              <div className="text-center text-sm text-slate-500 mt-2">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setView("signup")}
                  className="text-blue-600 hover:underline font-semibold"
                >
                  Sign Up
                </button>
              </div>
            </form>
          )}

          {view === "signup" && (
            <form onSubmit={handleSignUpSubmit} className="space-y-3">
              <h2 className="text-lg font-bold text-slate-950">
                Create Account
              </h2>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm text-slate-900 bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm text-slate-900 bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm text-slate-900 bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +201XXXXXXXX"
                  required
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm text-slate-900 bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm text-slate-900 bg-white focus:border-blue-500 focus:outline-none"
                >
                  <option value={USER_ROLE.applicant}>
                    Applicant / Candidate
                  </option>
                  <option value={USER_ROLE.recruiter}>
                    Recruiter / Company Rep
                  </option>
                  <option value={USER_ROLE.hrManager}>HR Manager</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={actionLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded disabled:opacity-50 cursor-pointer mt-2"
              >
                {actionLoading ? "Registering..." : "Create Account"}
              </button>
              <div className="text-center text-sm text-slate-500 mt-2">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setView("signin")}
                  className="text-blue-600 hover:underline font-semibold"
                >
                  Sign In
                </button>
              </div>
            </form>
          )}

          {view === "forgot" && (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-950 mb-1">
                  Forgot Password
                </h2>
                <p className="text-xs text-slate-500">
                  We'll send you a password reset link.
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm text-slate-900 bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={actionLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded disabled:opacity-50 cursor-pointer"
              >
                {actionLoading ? "Sending..." : "Send Reset Link"}
              </button>
              <button
                type="button"
                onClick={() => setView("signin")}
                className="w-full border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium py-2 rounded cursor-pointer"
              >
                Back to Sign In
              </button>
            </form>
          )}

          {view === "reset" && (
            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-950 mb-1">
                  Reset Password
                </h2>
                <p className="text-xs text-slate-500">
                  Enter a new secure password.
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm text-slate-900 bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={actionLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded disabled:opacity-50 cursor-pointer"
              >
                {actionLoading ? "Updating..." : "Update Password"}
              </button>
              <button
                type="button"
                onClick={() => setView("signin")}
                className="w-full border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium py-2 rounded cursor-pointer"
              >
                Cancel
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
