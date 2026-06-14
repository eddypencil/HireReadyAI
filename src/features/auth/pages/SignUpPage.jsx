//src\features\auth\pages\SignUpPage.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
  const [acceptTerms, setAcceptTerms] = useState(false);
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
    if (!acceptTerms) {
      setError("You must accept the Terms of Service and Privacy Policy to continue.");
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
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05, ease: "easeOut" }}
      >
        <RoleToggle value={role} onChange={setRole} />
      </motion.div>

      <form dir="ltr" onSubmit={handleSubmit} className="flex flex-col gap-5">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
        >
          <FormField
            label="Full Name"
            placeholder="Enter Your Full Name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
        >
          <FormField
            label="Current title"
            placeholder="e.g. HR Manager, Frontend Developer"
            type="text"
            value={headline}
            onChange={(e) => setHeadLine(e.target.value)}
            required
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
        >
          <FormField
            label="Email"
            placeholder="you@gmail.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25, ease: "easeOut" }}
        >
          <FormField
            label="Phone (optional)"
            placeholder="+20 10 0000 0000"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
        >
          <FormField
            label="Password"
            placeholder="Min. 8 characters"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35, ease: "easeOut" }}
        >
          <FormField
            label="Confirm password"
            placeholder="Repeat your password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.38, ease: "easeOut" }}
          className="flex items-start gap-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed"
        >
          <input
            type="checkbox"
            id="terms-privacy"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="w-4 h-4 mt-0.5 rounded border-border text-accent focus:ring-accent shrink-0"
          />
          <label htmlFor="terms-privacy" className="leading-relaxed">
            {t("sign_in.terms_text")}{" "}
            <Link to="/auth/terms" className="underline hover:text-accent font-semibold">
              {t("sign_in.terms")}
            </Link>{" "}
            {t("sign_in.and")}{" "}
            <Link to="/auth/privacy" className="underline hover:text-accent font-semibold">
              {t("sign_in.privacy")}
            </Link>
          </label>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs text-destructive bg-destructive/10 border border-destructive/20 dark:border-destructive/30">
              <span>⚠</span>
              {error}
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.42, ease: "easeOut" }}
        >
          <button
            type="submit"
            disabled={loading}
            className={`w-full h-11 rounded-xl text-white text-sm font-semibold transition-all duration-200 cursor-pointer bg-primary
              ${loading ? "opacity-60 cursor-not-allowed" : "hover:opacity-90"}`}
            style={{ boxShadow: "0 2px 12px rgba(1,73,124,0.15)" }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                {t("sign_up.creating")}
              </span>
            ) : (
              t("sign_up.create_account")
            )}
          </button>
        </motion.div>
      </form>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.47, ease: "easeOut" }}
        className="flex items-center gap-3 my-5"
      >
        <span className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground">or</span>
        <span className="flex-1 h-px bg-border" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.52, ease: "easeOut" }}
      >
        <SocialButton provider="google" onClick={handleGoogleSignIn} />
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.57, ease: "easeOut" }}
        className="text-center text-xs text-muted-foreground mt-6"
      >
        {t("sign_up.already_have")}{" "}
        <Link
          to="/auth/sign-in"
          className="text-primary font-semibold hover:underline"
        >
          {t("sign_up.sign_in")}
        </Link>
      </motion.p>
    </AuthLayout>
  );
}