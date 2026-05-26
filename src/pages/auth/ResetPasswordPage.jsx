import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/userContext";

export default function ResetPasswordPage() {
  const { updateUserPassword } = useUser();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      showNotification("error", "Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await updateUserPassword(newPassword);
      showNotification("success", "Password updated successfully!");
      setTimeout(() => {
        navigate("/auth/sign-in");
        window.history.replaceState(null, null, " ");
      }, 1500);
    } catch (err) {
      showNotification("error", err.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-sm p-6">
        <h1 className="text-2xl font-bold text-slate-950 mb-6 text-center">
          Reset Password
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
          Enter a new secure password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/auth/sign-in")}
            className="w-full border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium py-2 rounded cursor-pointer"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
