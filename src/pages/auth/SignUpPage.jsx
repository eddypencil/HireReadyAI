import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useUser } from "../../context/userContext";
import { USER_ROLE } from "../../utils/enums";
import { User } from "../../models/user";

export default function SignUpPage() {
  const { signUpUser } = useUser();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState(USER_ROLE.applicant);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userProfile = new User(fullName, role, phone, true);
      await signUpUser(email, password, userProfile);
      showNotification(
        "success",
        "Sign up successful! Please check your email for verification.",
      );
      setTimeout(() => navigate("/auth/sign-in"), 2000);
    } catch (err) {
      showNotification("error", err.message || "An error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-sm p-6">
        <h1 className="text-2xl font-bold text-slate-950 mb-6 text-center">
          Create Account
        </h1>

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

        <form onSubmit={handleSubmit} className="space-y-3">
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
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded disabled:opacity-50 cursor-pointer mt-2"
          >
            {loading ? "Registering..." : "Create Account"}
          </button>
          <div className="text-center text-sm text-slate-500 mt-2">
            Already have an account?{" "}
            <Link
              to="/auth/sign-in"
              className="text-blue-600 hover:underline font-semibold"
            >
              Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
