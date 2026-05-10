import type { ElementType } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  api,
  Device,
  HealthResponse,
  MonitoringTarget,
  Notification as NetNotification,
  RealtimeEvent,
} from "@/lib/api";
import { useRealtimeEvents } from "@/hooks/use-realtime-events";
import {
  Activity,
  AlertTriangle,
  Bell,
  CircleCheck,
  Clock,
  Database,
  Radio,
  Server,
  ServerCog,
  ShieldAlert,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Dashboard() {
  const { data: health, isLoading: healthLoading, error: healthError } = useQuery({
    queryKey: ["health"],
    queryFn: api.getHealth,
    refetchInterval: 30000,
  });

  const { data: devices, isLoading: devicesLoading, error: devicesError } = useQuery({
    queryKey: ["devices"],
    queryFn: api.getDevices,
    refetchInterval: 10000,
  });

  const { data: targets, isLoading: targetsLoading, error: targetsError } = useQuery({
    queryKey: ["monitoringTargets"],
    queryFn: api.getMonitoringTargets,
    refetchInterval: 10000,
  });

  const { data: notifications, isLoading: notificationsLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: api.getNotifications,
    refetchInterval: 15000,
  });

  const realtime = useRealtimeEvents(8);
  const activeDevices = devices?.filter((device) => device.is_active).length || 0;
  const activeTargets = targets?.filter((target) => target.is_active).length || 0;
  const downTargets = targets?.filter((target) => target.last_status === false).length || 0;
  const criticalNotifications =
    notifications?.filter((item) => item.severity === "critical" || item.severity === "error").length || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Overview NetMonitor: health check, device metadata, notifikasi, dan realtime event.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-border bg-secondary/50 px-3 py-2">
          <span className={`pulse-dot ${realtime.status === "open" ? "pulse-dot-online" : "pulse-dot-offline"}`} />
          <span className="text-xs font-mono text-muted-foreground">SSE {realtime.status}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-6 gap-4">
        <MetricCard
          label="Devices"
          value={devices?.length ?? (devicesLoading ? "..." : 0)}
          icon={Server}
          accent="text-primary"
        />
        <MetricCard label="Active Device" value={activeDevices} icon={Wifi} accent="text-success" />
        <MetricCard
          label="Targets"
          value={targets?.length ?? (targetsLoading ? "..." : 0)}
          icon={ServerCog}
          accent="text-accent"
        />
        <MetricCard label="Down Target" value={downTargets} icon={WifiOff} accent="text-destructive" />
        <MetricCard
          label="Unread Alert"
          value={notifications?.length ?? (notificationsLoading ? "..." : 0)}
          icon={Bell}
          accent={criticalNotifications > 0 ? "text-destructive" : "text-warning"}
        />
        <MetricCard
          label="Realtime Event"
          value={realtime.events.length}
          icon={Radio}
          accent={realtime.status === "open" ? "text-accent" : "text-destructive"}
        />
      </div>

      {healthError && (
        <div className="card-glass rounded-lg p-6 text-center">
          <WifiOff className="h-10 w-10 text-destructive mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Gagal membaca health check backend.</p>
          <p className="text-xs text-muted-foreground mt-1 font-mono">{(healthError as Error).message}</p>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <HealthPanel health={health} isLoading={healthLoading} />
        <LatestEvents events={realtime.events} error={realtime.error} />
        <UnreadNotifications notifications={notifications} isLoading={notificationsLoading} />
      </div>

      <DeviceOverview devices={devices} isLoading={devicesLoading} error={devicesError as Error | null} />
      <TargetOverview targets={targets} isLoading={targetsLoading} error={targetsError as Error | null} />
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number | string;
  icon: ElementType;
  accent: string;
}) {
  return (
    <div className="card-glass rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
        <Icon className={`h-4 w-4 ${accent}`} />
      </div>
      <p className="stat-value text-foreground">{value}</p>
    </div>
  );
}

function HealthPanel({ health, isLoading }: { health?: HealthResponse; isLoading: boolean }) {
  const checks = health?.checks;
  return (
    <section className="card-glass rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Health Check</h2>
        </div>
        <StatusPill status={health?.status || (isLoading ? "loading" : "unknown")} />
      </div>

      {isLoading && <PanelSkeleton rows={4} />}
      {!isLoading && checks && (
        <div className="space-y-3">
          <HealthRow icon={Database} label="MySQL" value={checks.mysql?.database || "metadata"} status={checks.mysql?.status} />
          <HealthRow icon={Database} label="InfluxDB" value={checks.influxdb?.bucket || "bucket"} status={checks.influxdb?.status} />
          <div className="grid grid-cols-2 gap-2 pt-1">
            {Object.entries(checks.collectors || {}).map(([name, status]) => (
              <div key={name} className="rounded-md border border-border bg-secondary/50 px-3 py-2">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{name}</p>
                <p className="text-xs font-mono text-foreground">{status}</p>
              </div>
            ))}
          </div>
          {health?.time && (
            <p className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <Clock className="h-3.5 w-3.5" />
              {formatDateTime(health.time)}
            </p>
          )}
        </div>
      )}
    </section>
  );
}

function HealthRow({
  icon: Icon,
  label,
  value,
  status,
}: {
  icon: ElementType;
  label: string;
  value: string;
  status?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-secondary/40 px-3 py-2">
      <div className="flex min-w-0 items-center gap-2">
        <Icon className="h-4 w-4 text-accent" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="truncate text-xs font-mono text-muted-foreground">{value}</p>
        </div>
      </div>
      <StatusPill status={status || "unknown"} />
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const ok = ["ok", "enabled", "running"].includes(status);
  return (
    <span
      className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-mono ${
        ok ? "status-online" : status === "loading" ? "border-border text-muted-foreground" : "status-offline"
      }`}
    >
      {status}
    </span>
  );
}

function LatestEvents({ events, error }: { events: RealtimeEvent[]; error?: string | null }) {
  return (
    <section className="card-glass rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Radio className="h-5 w-5 text-accent" />
        <h2 className="text-lg font-semibold text-foreground">Realtime Events</h2>
      </div>
      {error && <p className="rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning">{error}</p>}
      {events.length === 0 && (
        <p className="text-sm text-muted-foreground py-6 text-center">Belum ada event realtime pada sesi ini.</p>
      )}
      <div className="space-y-2">
        {events.map((event, index) => (
          <EventItem key={`${event.type}-${event.occurred_at}-${index}`} event={event} />
        ))}
      </div>
    </section>
  );
}

function EventItem({ event }: { event: RealtimeEvent }) {
  return (
    <div className="rounded-md border border-border bg-secondary/40 px-3 py-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full border px-2 py-0.5 text-[11px] font-mono ${severityClass(event.severity)}`}>
            {event.type}
          </span>
          {event.target_id && (
            <span className="rounded-full border border-border bg-background/60 px-2 py-0.5 text-[11px] font-mono text-muted-foreground">
              target #{event.target_id}
            </span>
          )}
        </div>
        <span className="text-[11px] text-muted-foreground font-mono">{formatDateTime(event.occurred_at)}</span>
      </div>
      <p className="mt-2 text-sm font-medium text-foreground">{event.title}</p>
      <p className="text-xs text-muted-foreground">{event.message}</p>
    </div>
  );
}

function TargetOverview({
  targets,
  isLoading,
  error,
}: {
  targets?: MonitoringTarget[];
  isLoading: boolean;
  error?: Error | null;
}) {
  return (
    <section className="card-glass rounded-lg overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <ServerCog className="h-5 w-5 text-accent" />
          <h2 className="text-lg font-semibold text-foreground">Monitoring Targets</h2>
        </div>
        <span className="text-xs text-muted-foreground font-mono">{targets?.length || 0} target</span>
      </div>
      {error && (
        <div className="px-4 py-6 text-sm text-destructive">
          <ShieldAlert className="inline h-4 w-4 mr-2" />
          {error.message}
        </div>
      )}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Host</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Interval</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              [...Array(4)].map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={5}>
                    <div className="h-4 bg-muted rounded animate-pulse" />
                  </TableCell>
                </TableRow>
              ))}
            {targets?.map((target) => (
              <TableRow key={target.id}>
                <TableCell>
                  <span className={`rounded-full border px-2 py-0.5 text-[11px] font-mono ${targetStatusClass(target.last_status)}`}>
                    {targetStatus(target.last_status)}
                  </span>
                </TableCell>
                <TableCell>
                  <p className="font-medium text-foreground">{target.name}</p>
                  <p className="text-xs text-muted-foreground">{target.is_active ? "active" : "disabled"}</p>
                </TableCell>
                <TableCell className="font-mono text-xs">{target.host}</TableCell>
                <TableCell className="text-xs">
                  <p>{target.check_type}</p>
                  <p className="text-muted-foreground">{target.port ? `port ${target.port}` : "no port"}</p>
                </TableCell>
                <TableCell className="text-xs font-mono">{target.interval_sec}s</TableCell>
              </TableRow>
            ))}
            {targets?.length === 0 && !isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  Belum ada monitoring target. Tambahkan dari menu Monitoring Targets.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

function UnreadNotifications({
  notifications,
  isLoading,
}: {
  notifications?: NetNotification[];
  isLoading: boolean;
}) {
  return (
    <section className="card-glass rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Bell className="h-5 w-5 text-warning" />
        <h2 className="text-lg font-semibold text-foreground">Unread Notifications</h2>
      </div>
      {isLoading && <PanelSkeleton rows={3} />}
      {notifications?.length === 0 && (
        <p className="text-sm text-muted-foreground py-6 text-center">Tidak ada notifikasi unread.</p>
      )}
      <div className="space-y-2">
        {notifications?.slice(0, 6).map((item) => (
          <div key={item.id} className="rounded-md border border-border bg-secondary/40 px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <span className={`rounded-full border px-2 py-0.5 text-[11px] font-mono ${severityClass(item.severity)}`}>
                {item.severity}
              </span>
              <span className="text-[11px] text-muted-foreground font-mono">{formatDateTime(item.created_at)}</span>
            </div>
            <p className="mt-2 text-sm font-medium text-foreground">{item.title}</p>
            <p className="text-xs text-muted-foreground">{item.message}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function DeviceOverview({
  devices,
  isLoading,
  error,
}: {
  devices?: Device[];
  isLoading: boolean;
  error?: Error | null;
}) {
  return (
    <section className="card-glass rounded-lg overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Server className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Device Metadata</h2>
        </div>
        <span className="text-xs text-muted-foreground font-mono">{devices?.length || 0} device</span>
      </div>
      {error && (
        <div className="px-4 py-6 text-sm text-destructive">
          <ShieldAlert className="inline h-4 w-4 mr-2" />
          {error.message}
        </div>
      )}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Device</TableHead>
              <TableHead>IP</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Last Seen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              [...Array(4)].map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={6}>
                    <div className="h-4 bg-muted rounded animate-pulse" />
                  </TableCell>
                </TableRow>
              ))}
            {devices?.map((device) => (
              <TableRow key={device.id}>
                <TableCell>
                  {device.is_active ? (
                    <CircleCheck className="h-4 w-4 text-success" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  )}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium text-foreground">{device.name}</p>
                    <p className="text-xs text-muted-foreground">{device.location || "No location"}</p>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs">{device.ip_address}</TableCell>
                <TableCell className="text-xs">{device.vendor || "-"}</TableCell>
                <TableCell className="text-xs">{device.device_type || "network"}</TableCell>
                <TableCell className="text-xs font-mono">{formatDateTime(device.last_seen_at)}</TableCell>
              </TableRow>
            ))}
            {devices?.length === 0 && !isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  Belum ada device. Tambahkan device dari menu Devices.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

function PanelSkeleton({ rows }: { rows: number }) {
  return (
    <div className="space-y-2">
      {[...Array(rows)].map((_, index) => (
        <div key={index} className="h-11 rounded-md bg-muted animate-pulse" />
      ))}
    </div>
  );
}

function severityClass(severity: string) {
  if (severity === "critical" || severity === "error") return "status-offline";
  if (severity === "warning") return "border-warning/30 bg-warning/10 text-warning";
  return "border-primary/30 bg-primary/10 text-primary";
}

function targetStatusClass(status?: boolean | null) {
  if (status === true) return "status-online";
  if (status === false) return "status-offline";
  return "border-border text-muted-foreground";
}

function targetStatus(status?: boolean | null) {
  if (status === true) return "UP";
  if (status === false) return "DOWN";
  return "UNKNOWN";
}

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
