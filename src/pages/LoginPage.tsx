import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NetworkBackground } from "@/components/NetworkBackground";
import { api, setAuthToken, isAuthenticated } from "@/lib/api";

export default function LoginPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.login(password);
      setAuthToken(res.token);
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      toast.error(err.message || "Password salah!");
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
            <img src="/logos.webp" alt="SCI Logo" className="h-10 w-10 animate-heartbeat" />
          </div>
          <h1 className="text-xl font-bold font-mono text-foreground">SCI Monitoring Network</h1>
          <p className="text-sm text-muted-foreground">Masukkan password untuk melanjutkan</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoFocus
              className="w-full bg-secondary text-foreground text-sm rounded-md pl-10 pr-10 py-2.5 border border-border focus:outline-none focus:ring-1 focus:ring-primary font-mono"
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
            disabled={loading}
            className="w-full bg-primary text-primary-foreground px-4 py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
}
