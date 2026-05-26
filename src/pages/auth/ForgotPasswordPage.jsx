import { useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../../context/userContext";

export default function ForgotPasswordPage() {
  const { resetUserPassword } = useUser();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      showNotification("error", "Please enter your email address.");
      return;
    }
    setLoading(true);
    try {
      await resetUserPassword(email);
      showNotification("success", "Password reset link sent to your email!");
      setEmail("");
    } catch (err) {
      showNotification("error", err.message || "Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-sm p-6">
        <h1 className="text-2xl font-bold text-slate-950 mb-6 text-center">
          Forgot Password
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

        <p className="text-xs text-slate-500 mb-4 text-center">
          We'll send you a password reset link.
        </p>

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
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
          <Link
            to="/auth/sign-in"
            className="block w-full text-center border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium py-2 rounded"
          >
            Back to Sign In
          </Link>
        </form>
      </div>
    </div>
  );
}
