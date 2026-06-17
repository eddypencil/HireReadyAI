import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/features/auth/context/user.context";
import { USER_ROLE } from "@/shared/constants/enums";
import { Shield } from "lucide-react";

export default function AdminAuthPage() {
  const { user, profile, loading, signInUser } = useUser();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user || !profile || loading) return;
    if (profile.role === USER_ROLE.admin) {
      navigate("/admin", { replace: true });
    } else if (profile.role === USER_ROLE.applicant) {
      navigate("/applicant", { replace: true });
    } else {
      navigate("/companies", { replace: true });
    }
  }, [user, profile, loading, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signInUser(email, password);
    } catch (err) {
      setError(err.message || "Sign in failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-destructive/15 border border-destructive/20 flex items-center justify-center">
            <Shield className="w-6 h-6 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Admin Access</h1>
          <p className="text-sm text-muted-foreground">
            Sign in with an admin account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@company.com"
              required
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
              required
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {error && (
            <div className="px-4 py-2.5 rounded-lg text-xs text-destructive bg-destructive/10 border border-destructive/20">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-11 rounded-xl text-white text-sm font-semibold bg-destructive hover:bg-destructive/90 transition-colors disabled:opacity-60 cursor-pointer"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Signing in...
              </span>
            ) : (
              "Sign in as Admin"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
