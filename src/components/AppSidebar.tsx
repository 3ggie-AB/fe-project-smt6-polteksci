import { NavLink as RouterNavLink, useNavigate } from "react-router-dom";
import { Activity, Target, ClipboardList, GitBranch, LayoutDashboard, LogOut } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { clearAuthToken } from "@/lib/api";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/targets", label: "Targets", icon: Target },
  { to: "/pings", label: "Ping Log", icon: Activity },
  { to: "/correlation", label: "Korelasi", icon: GitBranch },
];

export function AppSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuthToken();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-56 bg-card border-r border-border flex flex-col z-50">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          <span className="font-mono font-bold text-lg text-foreground">SCI Monitoring</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1 font-mono">v1.0</p>
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
        <ThemeToggle />
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-secondary transition-colors w-full"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
        <div className="flex items-center gap-2 px-3">
          <div className="pulse-dot pulse-dot-online" />
          <span className="text-xs text-muted-foreground font-mono">Backend: localhost:8080</span>
        </div>
      </div>
    </aside>
  );
}
