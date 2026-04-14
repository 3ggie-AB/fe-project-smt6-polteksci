import { Navigate } from "react-router-dom";
import { getAuthToken } from "@/lib/api";

export function PasswordGate({ children }: { children: React.ReactNode }) {
  const authenticated = sessionStorage.getItem("scimonitor_auth") === "true" && getAuthToken();

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
