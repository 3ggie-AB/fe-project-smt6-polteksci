import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Activity, Monitor, Users, MessageSquare, Shield, LogOut, User as UserIcon, Home, LayoutDashboard } from "lucide-react";

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg">
              <Activity className="h-6 w-6 text-primary" />
              <span>NetMonitor</span>
            </Link>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Link href="/login" className="text-sm font-medium hover:underline">Log in</Link>
              <Link href="/register">
                <Button>Sign up</Button>
              </Link>
            </div>
          </div>
        </header>
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </div>
    );
  }

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/devices", label: "Devices", icon: Monitor },
    { href: "/monitoring", label: "Monitoring", icon: Activity },
    { href: "/feedback", label: "Feedback", icon: MessageSquare },
    { href: "/users", label: "Users", icon: Users },
    { href: "/roles", label: "Roles", icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-sidebar text-sidebar-foreground flex flex-col">
        <div className="p-4 border-b h-16 flex items-center">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg text-primary">
            <Activity className="h-6 w-6" />
            <span>NetMonitor</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href || location.startsWith(`${item.href}/`);
            return (
              <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${isActive ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}`}>
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t space-y-2">
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-sm font-medium truncate">{user?.name}</span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
          <Link href="/profile" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${location === '/profile' ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}`}>
            <UserIcon className="h-5 w-5" />
            <span className="font-medium text-sm">Profile</span>
          </Link>
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-destructive hover:bg-destructive/10 transition-colors">
            <LogOut className="h-5 w-5" />
            <span className="font-medium text-sm">Log out</span>
          </button>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b flex items-center px-8 bg-card shadow-sm z-10">
          <h1 className="text-xl font-semibold capitalize">
            {location.split('/')[1] || 'Overview'}
          </h1>
        </header>
        <div className="flex-1 p-8 overflow-auto">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
