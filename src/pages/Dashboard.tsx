import { useQuery } from "@tanstack/react-query";
import { api, PingSummary, Survey } from "@/lib/api";
import { Activity, Clock, Wifi, WifiOff, Gauge, ClipboardList, Star } from "lucide-react";
import { LatencyChart } from "@/components/LatencyChart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Dashboard() {
  const { data: summary, isLoading, error } = useQuery({
    queryKey: ["pingSummary"],
    queryFn: api.getPingSummary,
    refetchInterval: 10000,
  });

  const { data: surveys, isLoading: surveysLoading } = useQuery({
    queryKey: ["surveys"],
    queryFn: api.getSurveys,
    refetchInterval: 30000,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Monitoring jaringan real-time</p>
      </div>

      {isLoading && <LoadingSkeleton />}
      {error && (
        <div className="card-glass rounded-lg p-6 text-center">
          <WifiOff className="h-10 w-10 text-destructive mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Gagal terhubung ke backend API</p>
          <p className="text-xs text-muted-foreground mt-1 font-mono">{(error as Error).message}</p>
        </div>
      )}

      {summary && summary.length > 0 && (
        <>
          <OverviewCards summary={summary} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {summary.map((s) => (
              <SummaryCard key={s.ip_address} data={s} />
            ))}
          </div>
          <LatencyChart />
        </>
      )}

      {summary && summary.length === 0 && (
        <div className="card-glass rounded-lg p-12 text-center">
          <Activity className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Belum ada data ping.</p>
          <p className="text-xs text-muted-foreground mt-1">Tambahkan target IP terlebih dahulu.</p>
        </div>
      )}

      {/* Survey History */}
      <SurveyHistory surveys={surveys} isLoading={surveysLoading} />
    </div>
  );
}

function OverviewCards({ summary }: { summary: PingSummary[] }) {
  const totalTargets = summary.length;
  const onlineTargets = summary.filter((s) => s.last_status).length;
  const avgUptime = summary.reduce((a, b) => a + b.uptime_percent, 0) / totalTargets;
  const avgLatency = summary.reduce((a, b) => a + b.avg_latency_ms, 0) / totalTargets;

  const cards = [
    { label: "Total Target", value: totalTargets, icon: Activity, accent: "text-accent" },
    { label: "Online", value: onlineTargets, icon: Wifi, accent: "text-success" },
    { label: "Avg Uptime", value: `${avgUptime.toFixed(1)}%`, icon: Clock, accent: "text-primary" },
    { label: "Avg Latency", value: `${avgLatency.toFixed(1)}ms`, icon: Gauge, accent: "text-warning" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div key={c.label} className="card-glass rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">{c.label}</span>
            <c.icon className={`h-4 w-4 ${c.accent}`} />
          </div>
          <p className="stat-value text-foreground">{c.value}</p>
        </div>
      ))}
    </div>
  );
}

function SummaryCard({ data }: { data: PingSummary }) {
  const isOnline = data.last_status;
  return (
    <div className={`card-glass rounded-lg p-4 ${isOnline ? "glow-green" : "glow-red"}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`pulse-dot ${isOnline ? "pulse-dot-online" : "pulse-dot-offline"}`} />
          <span className="font-mono text-sm font-semibold text-foreground">{data.ip_address}</span>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full border ${isOnline ? "status-online" : "status-offline"}`}>
          {isOnline ? "ONLINE" : "OFFLINE"}
        </span>
      </div>
      <p className="text-xs text-muted-foreground mb-3">{data.label}</p>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <p className="text-xs text-muted-foreground">Uptime</p>
          <p className="font-mono text-sm font-semibold text-foreground">{data.uptime_percent.toFixed(1)}%</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Latency</p>
          <p className="font-mono text-sm font-semibold text-foreground">{data.avg_latency_ms.toFixed(1)}ms</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Pings</p>
          <p className="font-mono text-sm font-semibold text-foreground">{data.reachable_pings}/{data.total_pings}</p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-3 font-mono">
        Last: {new Date(data.last_seen).toLocaleTimeString("id-ID")}
      </p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="card-glass rounded-lg p-4 animate-pulse">
          <div className="h-3 bg-muted rounded w-20 mb-3" />
          <div className="h-7 bg-muted rounded w-16" />
        </div>
      ))}
    </div>
  );
}
