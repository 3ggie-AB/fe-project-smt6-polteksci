import { Navigate } from "react-router-dom";

export function PasswordGate({ children }: { children: React.ReactNode }) {
  const authenticated = sessionStorage.getItem("scimonitor_auth") === "true";

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
