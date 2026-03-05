import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function PingLog() {
  const { data: pings, isLoading } = useQuery({
    queryKey: ["latestPings"],
    queryFn: api.getLatestPings,
    refetchInterval: 5000,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Ping Log</h1>
        <p className="text-sm text-muted-foreground">100 ping terbaru dari semua target</p>
      </div>

      <div className="card-glass rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-xs text-muted-foreground uppercase tracking-wider">Waktu</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground uppercase tracking-wider">IP</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground uppercase tracking-wider">Label</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground uppercase tracking-wider">Latency</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground uppercase tracking-wider">Pkt Loss</th>
              </tr>
            </thead>
            <tbody>
              {isLoading &&
                [...Array(10)].map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    <td colSpan={6} className="px-4 py-3"><div className="h-4 bg-muted rounded animate-pulse" /></td>
                  </tr>
                ))}
              {pings?.map((p) => (
                <tr key={p.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                  <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                    {new Date(p.created_at).toLocaleTimeString("id-ID")}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-foreground text-xs">{p.ip_address}</td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">{p.label}</td>
                  <td className="px-4 py-2.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${p.is_reachable ? "status-online" : "status-offline"}`}>
                      {p.is_reachable ? "OK" : "FAIL"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-foreground">{p.latency_ms.toFixed(2)} ms</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-foreground">{p.packet_loss.toFixed(1)}%</td>
                </tr>
              ))}
              {pings?.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Belum ada data ping.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
