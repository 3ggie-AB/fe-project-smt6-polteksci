import { createStreamUrl } from "@/lib/api";
import { useRealtimeEvents } from "@/hooks/use-realtime-events";
import { Activity, Clock, Radio, Trash2 } from "lucide-react";

export default function PingLog() {
  const { events, status, error, lastHeartbeat, clearEvents } = useRealtimeEvents(100);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Realtime Stream</h1>
          <p className="text-sm text-muted-foreground">
            Subscribe Server-Sent Events dari `/api/stream` untuk alert latency, packet loss, TCP down, anomaly, dan syslog.
          </p>
        </div>
        <button
          type="button"
          onClick={clearEvents}
          className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-secondary px-3 py-2 text-sm text-secondary-foreground hover:bg-secondary/80"
        >
          <Trash2 className="h-4 w-4" />
          Clear
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="card-glass rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Status</span>
            <Radio className={`h-4 w-4 ${status === "open" ? "text-success" : "text-destructive"}`} />
          </div>
          <p className="stat-value mt-2 text-foreground">{status}</p>
        </div>
        <div className="card-glass rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Events</span>
            <Activity className="h-4 w-4 text-accent" />
          </div>
          <p className="stat-value mt-2 text-foreground">{events.length}</p>
        </div>
        <div className="card-glass rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Heartbeat</span>
            <Clock className="h-4 w-4 text-warning" />
          </div>
          <p className="mt-2 truncate font-mono text-sm text-foreground">{formatDateTime(lastHeartbeat)}</p>
        </div>
      </div>

      <div className="card-glass rounded-lg p-4 space-y-3">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">EventSource URL</p>
          <p className="mt-1 break-all font-mono text-xs text-foreground">
            {maskToken(createStreamUrl())}
          </p>
        </div>
        {error && <p className="rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning">{error}</p>}
      </div>

      <div className="space-y-3">
        {events.map((event, index) => (
          <article key={`${event.type}-${event.occurred_at}-${index}`} className="card-glass rounded-lg p-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full border px-2 py-0.5 text-[11px] font-mono ${severityClass(event.severity)}`}>
                    {event.type}
                  </span>
                  <span className="rounded-full border border-border bg-secondary/70 px-2 py-0.5 text-[11px] font-mono text-muted-foreground">
                    {event.workspace}
                  </span>
                  {event.ip && (
                    <span className="rounded-full border border-border bg-secondary/70 px-2 py-0.5 text-[11px] font-mono text-muted-foreground">
                      {event.ip}
                    </span>
                  )}
                </div>
                <h2 className="mt-3 text-base font-semibold text-foreground">{event.title}</h2>
                <p className="text-sm text-muted-foreground">{event.message}</p>
              </div>
              <time className="shrink-0 font-mono text-xs text-muted-foreground">{formatDateTime(event.occurred_at)}</time>
            </div>
            {event.attributes && Object.keys(event.attributes).length > 0 && (
              <pre className="mt-3 overflow-x-auto rounded-md border border-border bg-background/70 p-3 text-xs text-muted-foreground">
                {JSON.stringify(event.attributes, null, 2)}
              </pre>
            )}
          </article>
        ))}

        {events.length === 0 && (
          <div className="card-glass rounded-lg p-12 text-center">
            <Radio className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Belum ada event realtime pada sesi ini.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function severityClass(severity: string) {
  if (severity === "critical" || severity === "error") return "status-offline";
  if (severity === "warning") return "border-warning/30 bg-warning/10 text-warning";
  return "border-primary/30 bg-primary/10 text-primary";
}

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function maskToken(url: string) {
  return url.replace(/access_token=([^&]+)/, "access_token=<jwt_token>");
}
