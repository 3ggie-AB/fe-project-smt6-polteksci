import { NavLink as RouterNavLink, useNavigate } from "react-router-dom";
import { Activity, Bell, Cpu, LayoutDashboard, LogOut, Radio, Server, ServerCog } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ThemeToggle } from "./ThemeToggle";
import { API_ORIGIN, api, clearAuthToken, getStoredUser } from "@/lib/api";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/devices", label: "Devices", icon: Server },
  { to: "/targets", label: "Monitoring Targets", icon: ServerCog },
  { to: "/stream", label: "Realtime", icon: Radio },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/features", label: "ML Features", icon: Cpu },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const storedUser = getStoredUser();
  const { data: identity } = useQuery({
    queryKey: ["me"],
    queryFn: api.me,
    retry: false,
  });

  const handleLogout = () => {
    clearAuthToken();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-56 bg-card border-r border-border flex flex-col z-50">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <img src="/logos.webp" alt="NetMonitor Logo" className="h-8 w-8 animate-heartbeat" />
          <span className="font-mono font-bold text-lg text-foreground">NetMonitor</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1 font-mono">API v2.1</p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <RouterNavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </RouterNavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-border space-y-2">
        <div className="px-3 py-2 rounded-md bg-secondary/50 border border-border">
          <p className="text-xs font-mono text-foreground truncate">
            {identity?.email || storedUser?.email || "Authenticated"}
          </p>
          <p className="text-[11px] text-muted-foreground font-mono">
            {identity?.role || storedUser?.role?.name || "JWT active"}
          </p>
        </div>
        <ThemeToggle />
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-secondary transition-colors w-full"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
        <div className="flex items-center gap-2 px-3">
          <Activity className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs text-muted-foreground font-mono truncate">{API_ORIGIN}</span>
        </div>
      </div>
    </aside>
  );
}
