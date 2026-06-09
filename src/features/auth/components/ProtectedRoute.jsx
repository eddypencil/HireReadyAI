import { Navigate } from "react-router-dom";
import { useUser } from "../context/user.context";
import { USER_ROLE } from "@/shared/constants/enums";
import LoadingSpinner from "@/shared/ui/LoadingSpinner";

export function ProtectedRoute({ children, allowedRoles }) {
  const { user, profile, loading } = useUser();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  if (allowedRoles && profile?.role && !allowedRoles.includes(profile.role)) {
    if (profile.role === USER_ROLE.applicant) {
      return <Navigate to="/applicant" replace />;
    }
    return <Navigate to="/companies" replace />;
  }

  return children;
}