//src\features\auth\pages\SignUpPage.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/user.context";
import { USER_ROLE } from "@/shared/constants/enums";
import AuthLayout from "../components/AuthLayout";
import FormField from "@/shared/ui/FormField";
import RoleToggle from "../components/RoleToggle";
import { signInWithGoogle } from "../services/auth.service";
import SocialButton from "../components/SocialButton";
import { useTranslation } from "react-i18next";
export default function SignUpPage() {
  const { signUpUser, loading, profile } = useUser();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [role, setRole] = useState(USER_ROLE.applicant);
  const [fullName, setFullName] = useState("");
  const [headline, setHeadLine] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!loading && profile) {
      if (profile.role === USER_ROLE.recruiter) {
        navigate("/companies");
      } else {
        navigate("/applicant");
      }
    }
  }, [profile, loading, navigate]);

  async function handleGoogleSignIn() {
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err.message || "Google sign-in failed.");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError(t("sign_up.errors.password_length"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("sign_up.errors.password_match"));
      return;
    }
    try {
      await signUpUser(email, password, {
        fullName,
        role,
        phone,
        headline,
        isActive: true,
      });
    } catch (err) {
      setError(err.message || t("sign_up.errors.generic"));
    }
  }

  return (
    <AuthLayout
      headline={t("sign_up.create_account")}
      subheading={t("sign_up.subheading")}
    >
      <RoleToggle value={role} onChange={setRole} />

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <FormField
          label={t("sign_up.labels.full_name")}
          placeholder={t("sign_up.placeholders.full_name")}
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />

        <FormField
          label={t("sign_up.labels.current_title")}
          placeholder={t("sign_up.placeholders.current_title")}
          type="text"
          value={headline}
          onChange={(e) => setHeadLine(e.target.value)}
          required
        />

        <FormField
          label={t("sign_up.labels.email")}
          placeholder={t("sign_up.placeholders.email")}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <FormField
          label={t("sign_up.labels.password")}
          placeholder={t("sign_up.placeholders.password")}
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <FormField
          label={t("sign_up.labels.password")}
          placeholder={t("sign_up.placeholders.password")}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <FormField
          label={t("sign_up.labels.confirm_password")}
          placeholder={t("sign_up.placeholders.confirm_password")}
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        {error && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs text-red-600 bg-red-50 border border-red-200">
            <span>⚠</span>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full h-11 rounded-xl text-white text-sm font-semibold transition-all duration-200 cursor-pointer bg-dark-amethyst-600
            ${loading ? "opacity-60 cursor-not-allowed" : "hover:bg-dark-amethyst-700"}`}
          style={{ boxShadow: "0 2px 12px rgba(132,0,255,0.2)" }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              t("sign_up.creating")
            </span>
          ) : (
            t("sign_up.create_account")
          )}
        </button>
      </form>

      <div className="flex items-center gap-3 my-5">
        <span className="flex-1 h-px bg-dark-amethyst-200" />
        <span className="text-xs text-dark-amethyst-300">or</span>
        <span className="flex-1 h-px bg-dark-amethyst-200" />
      </div>

      <SocialButton provider="google" onClick={handleGoogleSignIn} />

      <p className="text-center text-xs text-dark-amethyst-400 mt-6">
        {t("sign_up.already_have")}{" "}
        <Link
          to="/auth/sign-in"
          className="text-dark-amethyst-600 font-semibold hover:underline"
        >
          {t("sign_up.sign_in")}
        </Link>
      </p>
    </AuthLayout>
  );
}
