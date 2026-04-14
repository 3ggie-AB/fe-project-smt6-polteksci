import { useState } from "react";
import { Activity, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

const APP_PASSWORD = "SCINETWORK";

export function PasswordGate({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(
    () => sessionStorage.getItem("scimonitor_auth") === "true"
  );
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === APP_PASSWORD) {
      sessionStorage.setItem("scimonitor_auth", "true");
      setAuthenticated(true);
    } else {
      toast.error("Password salah!");
    }
  };

  if (authenticated) return <>{children}</>;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="card-glass rounded-xl p-8 w-full max-w-sm space-y-6 glow-cyan">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-2">
            <Activity className="h-7 w-7 text-primary" />
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
            className="w-full bg-primary text-primary-foreground px-4 py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Masuk
          </button>
        </form>
      </div>
    </div>
  );
}
