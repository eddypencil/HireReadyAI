// //src\features\auth\pages\SignInPage.jsx
import { useState, useEffect } from "react";
import { useUser } from "../context/user.context";
import { USER_ROLE } from "@/shared/constants/enums";
import AuthLayout from "../components/AuthLayout";
import FormField from "@/shared/ui/FormField";
import SocialButton from "../components/SocialButton";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function SignInPage() {
  const { t } = useTranslation();
  const { signInUser, loading, user, profile } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !profile) return;

    if (profile.role === USER_ROLE.applicant) {
      navigate("/applicant", { replace: true });
    } else {
      navigate("/companies", { replace: true });
    }
  }, [user, profile, navigate]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    try {
      await signInUser(email, password);
    } catch (err) {
      setError(err.message || t("sign_in.errors.generic"));
    }
  }

  return (
    <AuthLayout
      headline={t("sign_in.headline")}
      subheading={t("sign_in.subheading")}
    >
      <form dir="ltr" onSubmit={handleSubmit} className="flex flex-col gap-5">
        <FormField
          label="Email"
          type="email"
          placeholder="you@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <FormField
          label="Password"
          type="password"
          placeholder="••••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          hint={
            <Link
              to="/auth/forgot-password"
              className="text-xs text-accent hover:underline"
            >
              {t("sign_in.forgot_password")}
            </Link>
          }
        />

        {error && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs text-destructive bg-destructive/10 border border-destructive/20">
            <span>⚠</span>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full h-11 rounded-xl text-white text-sm font-semibold transition-all duration-200 cursor-pointer bg-primary
            ${loading ? "opacity-60 cursor-not-allowed" : "hover:bg-primary-hover"}`}
          style={{ boxShadow: "0 2px 12px rgba(1,73,124,0.15)" }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              {t("sign_in.signing_in")}
            </span>
          ) : (
            t("sign_in.sign_in")
          )}
        </button>
      </form>

      <div className="flex items-center gap-3 my-5">
        <span className="flex-1 h-px bg-border/20" />
        <span className="text-xs text-muted-foreground/60">or</span>
        <span className="flex-1 h-px bg-border/20" />
      </div>

      <SocialButton provider="google" />

      <p className="text-center text-xs text-muted-foreground/80 mt-5">
        {t("sign_in.terms_text")}{" "}
        <a href="#" className="underline hover:text-accent">
          {t("sign_in.terms")}
        </a>{" "}
        {t("sign_in.and")}{" "}
        <a href="#" className="underline hover:text-accent">
          {t("sign_in.privacy")}
        </a>
      </p>

      <p className="text-center text-xs text-muted-foreground/80 mt-3">
        {t("sign_in.no_account")}{" "}
        <Link
          to="/auth/sign-up"
          className="text-accent font-semibold hover:underline"
        >
          {t("sign_in.create_account")}
        </Link>
      </p>
    </AuthLayout>
  );
}