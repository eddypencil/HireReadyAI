// src/features/auth/pages/GoogleRoleSelect.jsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/shared/services/supabase";
import AuthLayout from "../components/AuthLayout";
import { USER_ROLE } from "@/shared/constants/enums";
import { useTranslation } from "react-i18next";

export default function GoogleRoleSelect() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const user = state?.user;
  const { t } = useTranslation();
  const [role, setRole] = useState(USER_ROLE.applicant);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getRoles = (t) => [
    {
      label: t("googleRoleSelect.roles.applicant.label"),
      value: USER_ROLE.applicant,
      desc: t("googleRoleSelect.roles.applicant.desc"),
    },
    {
      label: t("googleRoleSelect.roles.recruiter.label"),
      value: USER_ROLE.recruiter,
      desc: t("googleRoleSelect.roles.recruiter.desc"),
    },
  ];
  const ROLES = getRoles(t);
  async function handleConfirm() {
    if (!user) {
      navigate("/auth/sign-in");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: user.id,
          full_name: user.user_metadata?.full_name || user.email,
          role,
          is_active: true,
        },
      ]);
      if (profileError) throw profileError;
      if (role === USER_ROLE.applicant) navigate("/applicant");
      else navigate("/companies");
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      headline={t("googleRoleSelect.headline")}
      subheading={t("googleRoleSelect.subheading")}
    >
      <div className="flex flex-col gap-3">
        {ROLES.map(({ label, value, desc }) => (
          <button
            key={value}
            type="button"
            onClick={() => setRole(value)}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer
              ${
                role === value
                  ? "border-accent bg-muted"
                  : "border-border hover:border-accent/50 bg-background"
              }`}
          >
            <p
              className={`text-sm font-semibold ${
                role === value ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {label}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs text-destructive bg-destructive/10 border border-destructive/20 mt-4">
          <span>{t("googleRoleSelect.alert")}</span>
          {error}
        </div>
      )}

      <button
        onClick={handleConfirm}
        disabled={loading}
        className="w-full h-11 rounded-xl text-white text-sm font-semibold mt-5 bg-primary hover:bg-primary-hover transition-all duration-200 disabled:opacity-60 cursor-pointer"
      >
        {loading
          ? t("googleRoleSelect.error.settingUp")
          : t("googleRoleSelect.error.getStarted")}
      </button>
    </AuthLayout>
  );
}
