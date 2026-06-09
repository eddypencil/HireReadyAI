import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/shared/services/supabase";
import { getProfile, makeProfile } from "../services/auth.service";
import LoadingSpinner from "@/shared/ui/LoadingSpinner";

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

  return <LoadingSpinner message="Signing you in..." />;
}