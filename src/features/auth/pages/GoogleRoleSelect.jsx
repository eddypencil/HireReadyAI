import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/shared/services/supabase";
import AuthLayout from "../components/AuthLayout";
import { USER_ROLE } from "@/shared/constants/enums";

const ROLES = [
  { label: "Applicant", value: USER_ROLE.applicant, desc: "Browse and apply for jobs" },
  { label: "Recruiter", value: USER_ROLE.recruiter, desc: "Post jobs and manage candidates" },
];

export default function GoogleRoleSelect() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const user = state?.user;

  const [role, setRole] = useState(USER_ROLE.applicant);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleConfirm() {
    if (!user) { navigate("/auth/sign-in"); return; }
    setLoading(true);
    setError(null);
    try {
      const { error: profileError } = await supabase.from("profiles").insert([{
        id: user.id,
        full_name: user.user_metadata?.full_name || user.email,
        // email: user.email,
        role,
        is_active: true,
      }]);
      if (profileError) throw profileError;
      if (role === USER_ROLE.applicant) navigate("/applicant");
      else navigate("/companies");
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <AuthLayout headline="One last step" subheading="How will you be using HireReadyAI?">
      <div className="flex flex-col gap-3">
        {ROLES.map(({ label, value, desc }) => (
          <button
            key={value}
            type="button"
            onClick={() => setRole(value)}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer
              ${role === value
                ? "border-dark-amethyst-600 bg-dark-amethyst-50"
                : "border-dark-amethyst-100 hover:border-dark-amethyst-300"
              }`}
          >
            <p className={`text-sm font-semibold ${role === value ? "text-dark-amethyst-700" : "text-dark-amethyst-500"}`}>
              {label}
            </p>
            <p className="text-xs text-dark-amethyst-400 mt-0.5">{desc}</p>
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs text-red-600 bg-red-50 border border-red-200 mt-4">
          <span>⚠</span>{error}
        </div>
      )}

      <button
        onClick={handleConfirm}
        disabled={loading}
        className="w-full h-11 rounded-xl text-white text-sm font-semibold mt-5 bg-dark-amethyst-600 hover:bg-dark-amethyst-700 transition disabled:opacity-60"
      >
        {loading ? "Setting up your account..." : "Get Started"}
      </button>
    </AuthLayout>
  );
}