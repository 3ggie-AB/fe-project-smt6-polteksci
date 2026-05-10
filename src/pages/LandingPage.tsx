import { Link } from "react-router-dom";
import type { ElementType } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  ArrowRight,
  Database,
  LogIn,
  Radio,
  Server,
  ServerCog,
  ShieldCheck,
  WifiOff,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NetworkBackground } from "@/components/NetworkBackground";
import { API_ORIGIN, api, isAuthenticated } from "@/lib/api";

export default function LandingPage() {
  const { data: info, error: infoError } = useQuery({
    queryKey: ["apiInfo"],
    queryFn: api.getInfo,
    retry: false,
  });
  const { data: health, error: healthError } = useQuery({
    queryKey: ["health"],
    queryFn: api.getHealth,
    retry: false,
    refetchInterval: 30000,
  });

  return (
    <div className="min-h-screen bg-background relative">
      <NetworkBackground />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 md:px-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logos.webp" alt="NetMonitor Logo" className="h-10 w-10 animate-heartbeat" />
            <div>
              <p className="font-mono text-lg font-bold text-foreground">NetMonitor</p>
              <p className="text-xs text-muted-foreground">Go + Gin + MySQL + InfluxDB</p>
            </div>
          </div>
          <ThemeToggle />
        </header>

        <main className="flex flex-1 flex-col justify-center gap-10 py-10">
          <section className="max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-mono text-primary">
              <ShieldCheck className="h-3.5 w-3.5" />
              API v2.1
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl font-bold text-foreground md:text-6xl">NetMonitor API</h1>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
                Dashboard observability jaringan untuk inventory Devices, active Monitoring Targets, realtime SSE,
                notifications, dan ML-ready feature vector.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to={isAuthenticated() ? "/dashboard" : "/login"}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                {isAuthenticated() ? "Buka Dashboard" : "Login"}
                {isAuthenticated() ? <ArrowRight className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
              </Link>
              <Link
                to="/targets"
                className="inline-flex items-center gap-2 rounded-md border border-border bg-secondary px-5 py-2.5 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
              >
                <ServerCog className="h-4 w-4" />
                Monitoring Targets
              </Link>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <StatusCard
              icon={Server}
              label="Service"
              title={info?.name || "NetMonitor API"}
              value={info?.status || (infoError ? "offline" : "checking")}
            />
            <StatusCard
              icon={Database}
              label="MySQL"
              title={health?.checks.mysql?.database || "metadata"}
              value={health?.checks.mysql?.status || (healthError ? "unavailable" : "checking")}
            />
            <StatusCard
              icon={Radio}
              label="Collectors"
              title="active / snmp / syslog"
              value={collectorStatus(health?.checks.collectors)}
            />
            <StatusCard
              icon={Activity}
              label="Backend"
              title={API_ORIGIN}
              value={health?.status || (healthError ? "offline" : "checking")}
            />
          </section>

          {(infoError || healthError) && (
            <div className="card-glass rounded-lg p-4">
              <div className="flex items-start gap-3">
                <WifiOff className="mt-0.5 h-5 w-5 text-destructive" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Backend belum bisa dijangkau</p>
                  <p className="text-xs text-muted-foreground">
                    Pastikan NetMonitor API berjalan di {API_ORIGIN}, atau set `VITE_API_BASE_URL`.
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function StatusCard({
  icon: Icon,
  label,
  title,
  value,
}: {
  icon: ElementType;
  label: string;
  title: string;
  value: string;
}) {
  const ok = ["ok", "running", "enabled"].includes(value);
  return (
    <div className="card-glass rounded-lg p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
        <Icon className={`h-4 w-4 ${ok ? "text-success" : "text-primary"}`} />
      </div>
      <p className="truncate text-sm font-semibold text-foreground">{title}</p>
      <p className={`mt-2 font-mono text-xs ${ok ? "text-success" : "text-muted-foreground"}`}>{value}</p>
    </div>
  );
}

function collectorStatus(collectors?: Record<string, string>) {
  if (!collectors) return "checking";
  const enabled = Object.values(collectors).filter((value) => value === "enabled").length;
  return `${enabled}/${Object.keys(collectors).length} enabled`;
}
