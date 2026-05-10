import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NetworkBackground } from "@/components/NetworkBackground";
import { api, setAuthSession, isAuthenticated } from "@/lib/api";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.login({
        email: email.trim() || undefined,
        password,
      });
      setAuthSession(res.token, res.user);
      toast.success(res.message || "Login berhasil");
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Email atau password salah");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      <NetworkBackground />
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      <div className="card-glass rounded-xl p-8 w-full max-w-sm space-y-6 glow-cyan relative z-10">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-2">
            <img src="/logos.webp" alt="NetMonitor Logo" className="h-10 w-10 animate-heartbeat" />
          </div>
          <h1 className="text-xl font-bold font-mono text-foreground">NetMonitor API</h1>
          <p className="text-sm text-muted-foreground">Login lokal dengan JWT bearer token</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email admin (opsional saat bootstrap)"
              autoFocus
              className="w-full bg-secondary text-foreground text-sm rounded-md pl-10 pr-3 py-2.5 border border-border focus:outline-none focus:ring-1 focus:ring-primary font-mono"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-secondary text-foreground text-sm rounded-md pl-10 pr-10 py-2.5 border border-border focus:outline-none focus:ring-1 focus:ring-primary font-mono"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <ShieldCheck className="h-4 w-4" />
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>
        <p className="text-xs text-muted-foreground text-center">
          Kosongkan email untuk memakai ADMIN_EMAIL dari backend saat bootstrap pertama.
        </p>
      </div>
    </div>
  );
}
