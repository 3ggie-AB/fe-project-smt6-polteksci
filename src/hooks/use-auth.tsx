import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocation } from "wouter";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  role_id?: number;
  is_active?: boolean;
  phone?: string | null;
  department?: string | null;
}

interface AuthContextType {
  token: string | null;
  user: UserProfile | null;
  permissions: string[];
  login: (token: string, user: UserProfile, permissions: string[]) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("auth_token"));
  const [user, setUser] = useState<UserProfile | null>(() => {
    const stored = localStorage.getItem("auth_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [permissions, setPermissions] = useState<string[]>(() => {
    const stored = localStorage.getItem("auth_permissions");
    return stored ? JSON.parse(stored) : [];
  });
  const [, setLocation] = useLocation();

  const login = (newToken: string, newUser: UserProfile, newPermissions: string[]) => {
    localStorage.setItem("auth_token", newToken);
    localStorage.setItem("auth_user", JSON.stringify(newUser));
    localStorage.setItem("auth_permissions", JSON.stringify(newPermissions));
    setToken(newToken);
    setUser(newUser);
    setPermissions(newPermissions);
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_permissions");
    setToken(null);
    setUser(null);
    setPermissions([]);
    setLocation("/login");
  };

  return (
    <AuthContext.Provider value={{ token, user, permissions, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
