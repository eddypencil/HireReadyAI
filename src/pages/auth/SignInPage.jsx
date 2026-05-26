import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useUser } from "../../context/userContext";

export default function SignInPage() {
  const { signInUser } = useUser();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      await signInUser(email, password);
      navigate("/");
    } catch (err) {
      showNotification("error", err.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-sm p-6">
        <h1 className="text-2xl font-bold text-slate-950 mb-6 text-center">
          Sign In
        </h1>

        {notification && (
          <div
            className={`mb-4 p-3 rounded text-sm border ${
              notification.type === "error"
                ? "bg-red-50 border-red-200 text-red-800"
                : "bg-blue-50 border-blue-200 text-blue-800"
            }`}
          >
            {notification.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
              <Link
                to="/auth/forgot-password"
                className="text-xs text-blue-600 hover:underline"
              >
                Forgot password?
              </Link>
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
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
          <div className="text-center text-sm text-slate-500 mt-2">
            Don't have an account?{" "}
            <Link
              to="/auth/sign-up"
              className="text-blue-600 hover:underline font-semibold"
            >
              Sign Up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
