import { Navigate } from "react-router-dom";
import { isAuthenticated } from "@/lib/api";

export function PasswordGate({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
