import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/shared/services/supabase";
import { getProfile, makeProfile } from "../services/auth.service";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    async function handleCallback() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth/sign-in");
        return;
      }

      const user = session.user;
      const profile = await getProfile(user.id);

      if (!profile) {
        // First time Google user — navigate to role selection
        navigate("/auth/select-role", { state: { user } });
      } else if (profile.role === "applicant") {
        navigate("/applicant");
      } else {
        navigate("/companies");
      }
    }
    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-amethyst-50">
      <div className="text-center">
        <span className="inline-block w-6 h-6 rounded-full border-2 border-dark-amethyst-300 border-t-dark-amethyst-600 animate-spin mb-4" />
        <p className="text-dark-amethyst-500 text-sm">Signing you in...</p>
      </div>
    </div>
  );
}