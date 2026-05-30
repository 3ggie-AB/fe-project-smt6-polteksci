import type { ElementType } from "react";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  api,
  Device,
  DeviceStatus,
  HealthResponse,
  MonitoringConfig,
  Notification as NetNotification,
} from "@/lib/api";
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

  const { data: configs, isLoading: configsLoading, error: configsError } = useQuery({
    queryKey: ["monitoringConfigs"],
    queryFn: api.getMonitoringConfigs,
    refetchInterval: 10000,
  });

  const { data: statuses, isLoading: statusesLoading, error: statusesError } = useQuery({
    queryKey: ["deviceStatuses"],
    queryFn: api.getDeviceStatuses,
    refetchInterval: 10000,
  });

  const { data: alerts } = useQuery({
    queryKey: ["alerts"],
    queryFn: api.getAlerts,
    refetchInterval: 15000,
  });

  const { data: notifications, isLoading: notificationsLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: api.getNotifications,
    refetchInterval: 15000,
  });

  const latestStatuses = useMemo(
    () =>
      [...(statuses || [])].sort(
        (a, b) => new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime(),
      ),
    [statuses],
  );
  const deviceById = useMemo(
    () => new Map((devices || []).map((device) => [device.id, device])),
    [devices],
  );

  const onlineDevices = devices?.filter((device) => device.status === "ONLINE").length || 0;
  const warningDevices = devices?.filter((device) => device.status === "WARNING").length || 0;
  const offlineDevices = devices?.filter((device) => device.status === "OFFLINE").length || 0;
  const activeAlerts = alerts?.filter((alert) => alert.status === "ACTIVE").length || 0;
  const unreadNotifications = notifications?.filter((item) => !item.is_read).length || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Overview NetMonitor API v4: health check, device status, monitoring config, alert, dan notifikasi.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-border bg-secondary/50 px-3 py-2">
          <span className={`pulse-dot ${health?.status === "ok" ? "pulse-dot-online" : "pulse-dot-offline"}`} />
          <span className="text-xs font-mono text-muted-foreground">{health?.status || "checking"}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-6">
        <MetricCard
          label="Devices"
          value={devices?.length ?? (devicesLoading ? "..." : 0)}
          icon={Server}
          accent="text-primary"
        />
        <MetricCard label="Online" value={onlineDevices} icon={Wifi} accent="text-success" />
        <MetricCard label="Warning" value={warningDevices} icon={AlertTriangle} accent="text-warning" />
        <MetricCard label="Offline" value={offlineDevices} icon={WifiOff} accent="text-destructive" />
        <MetricCard
          label="Configs"
          value={configs?.length ?? (configsLoading ? "..." : 0)}
          icon={ServerCog}
          accent="text-accent"
        />
        <MetricCard
          label="Active Alerts"
          value={activeAlerts}
          icon={Bell}
          accent={activeAlerts > 0 ? "text-destructive" : "text-warning"}
        />
      </div>

      {healthError && (
        <div className="card-glass rounded-lg p-6 text-center">
          <WifiOff className="mx-auto mb-3 h-10 w-10 text-destructive" />
          <p className="text-sm text-muted-foreground">Gagal membaca health check backend.</p>
          <p className="mt-1 font-mono text-xs text-muted-foreground">{(healthError as Error).message}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <HealthPanel health={health} isLoading={healthLoading} />
        <AlertPanel alerts={alerts} />
        <UnreadNotifications notifications={notifications} isLoading={notificationsLoading} unreadCount={unreadNotifications} />
      </div>

      <DeviceOverview devices={devices} isLoading={devicesLoading} error={devicesError as Error | null} />
      <StatusOverview
        statuses={latestStatuses}
        deviceById={deviceById}
        isLoading={statusesLoading}
        error={statusesError as Error | null}
      />
      <ConfigOverview configs={configs} deviceById={deviceById} isLoading={configsLoading} error={configsError as Error | null} />
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
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
        <Icon className={`h-4 w-4 ${accent}`} />
      </div>
      <p className="stat-value text-foreground">{value}</p>
    </div>
  );
}

function HealthPanel({ health, isLoading }: { health?: HealthResponse; isLoading: boolean }) {
  return (
    <section className="card-glass rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Health Check</h2>
        </div>
        <StatusPill status={health?.status || (isLoading ? "loading" : "unknown")} />
      </div>

      {isLoading && <PanelSkeleton rows={3} />}
      {!isLoading && health && (
        <div className="space-y-3">
          <HealthRow icon={Database} label="MySQL" value={`${health.mysql.host}:${health.mysql.port}`} status={health.status} />
          <HealthRow icon={Database} label="Database" value={health.mysql.database} status={health.status} />
          <HealthRow icon={ServerCog} label="Stack" value={health.stack} status={health.status} />
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
          <p className="truncate font-mono text-xs text-muted-foreground">{value}</p>
        </div>
      </div>
      <StatusPill status={status || "unknown"} />
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const ok = ["ok", "enabled", "running", "online", "active"].includes(normalized);
  const warning = ["warning", "loading"].includes(normalized);
  return (
    <span
      className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-mono ${
        ok ? "status-online" : warning ? "border-warning/30 bg-warning/10 text-warning" : "status-offline"
      }`}
    >
      {status}
    </span>
  );
}

function AlertPanel({ alerts }: { alerts?: Alert[] }) {
  const latest = [...(alerts || [])]
    .sort((a, b) => new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime())
    .slice(0, 5);

  return (
    <section className="card-glass rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-2">
        <ShieldAlert className="h-5 w-5 text-warning" />
        <h2 className="text-lg font-semibold text-foreground">Alerts</h2>
      </div>
      {latest.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">Belum ada alert.</p>}
      <div className="space-y-2">
        {latest.map((alert) => (
          <div key={alert.id} className="rounded-md border border-border bg-secondary/40 px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <span className={`rounded-full border px-2 py-0.5 text-[11px] font-mono ${severityClass(alert.severity)}`}>
                {alert.severity}
              </span>
              <StatusPill status={alert.status} />
            </div>
            <p className="mt-2 text-sm font-medium text-foreground">{alert.message}</p>
            <p className="text-xs font-mono text-muted-foreground">device #{alert.device_id}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function UnreadNotifications({
  notifications,
  isLoading,
  unreadCount,
}: {
  notifications?: NetNotification[];
  isLoading: boolean;
  unreadCount: number;
}) {
  const latestUnread = (notifications || []).filter((item) => !item.is_read).slice(0, 6);

  return (
    <section className="card-glass rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-warning" />
          <h2 className="text-lg font-semibold text-foreground">Unread Notifications</h2>
        </div>
        <span className="text-xs font-mono text-muted-foreground">{unreadCount} unread</span>
      </div>
      {isLoading && <PanelSkeleton rows={3} />}
      {latestUnread.length === 0 && !isLoading && (
        <p className="py-6 text-center text-sm text-muted-foreground">Tidak ada notifikasi unread.</p>
      )}
      <div className="space-y-2">
        {latestUnread.map((item) => (
          <div key={item.id} className="rounded-md border border-border bg-secondary/40 px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <span className="rounded-full border border-border bg-background/60 px-2 py-0.5 text-[11px] font-mono text-muted-foreground">
                alert #{item.alert_id}
              </span>
              <span className="font-mono text-[11px] text-muted-foreground">{formatDateTime(item.created_at)}</span>
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
          <h2 className="text-lg font-semibold text-foreground">Device Inventory</h2>
        </div>
        <span className="text-xs font-mono text-muted-foreground">{devices?.length || 0} device</span>
      </div>
      {error && (
        <div className="px-4 py-6 text-sm text-destructive">
          <ShieldAlert className="mr-2 inline h-4 w-4" />
          {error.message}
        </div>
      )}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Device</TableHead>
              <TableHead>IP/Host</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Location</TableHead>
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
                  <StatusPill status={device.status} />
                </TableCell>
                <TableCell>
                  <p className="font-medium text-foreground">{device.name}</p>
                  <p className="text-xs text-muted-foreground">device #{device.id}</p>
                </TableCell>
                <TableCell className="font-mono text-xs">{device.ip}</TableCell>
                <TableCell className="text-xs">{device.vendor || "-"}</TableCell>
                <TableCell className="text-xs">{device.type || "-"}</TableCell>
                <TableCell className="text-xs">{device.location || "-"}</TableCell>
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

function StatusOverview({
  statuses,
  deviceById,
  isLoading,
  error,
}: {
  statuses: DeviceStatus[];
  deviceById: Map<number, Device>;
  isLoading: boolean;
  error?: Error | null;
}) {
  return (
    <section className="card-glass rounded-lg overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Radio className="h-5 w-5 text-accent" />
          <h2 className="text-lg font-semibold text-foreground">Latest Device Status</h2>
        </div>
        <span className="text-xs font-mono text-muted-foreground">{statuses.length} sample</span>
      </div>
      {error && <div className="px-4 py-6 text-sm text-destructive">{error.message}</div>}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Device</TableHead>
              <TableHead>Latency</TableHead>
              <TableHead>Packet Loss</TableHead>
              <TableHead>CPU</TableHead>
              <TableHead>Memory</TableHead>
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
            {statuses.slice(0, 8).map((status) => {
              const device = deviceById.get(status.device_id) || status.device;
              return (
                <TableRow key={status.id}>
                  <TableCell>
                    <p className="font-medium text-foreground">{device?.name || `Device #${status.device_id}`}</p>
                    <p className="font-mono text-xs text-muted-foreground">{device?.ip || `id:${status.device_id}`}</p>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{formatNumber(status.latency)} ms</TableCell>
                  <TableCell>
                    <span className={`rounded-full border px-2 py-0.5 text-[11px] font-mono ${packetLossClass(status.packet_loss)}`}>
                      {formatNumber(status.packet_loss)}%
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{formatOptionalNumber(status.cpu_usage)}</TableCell>
                  <TableCell className="font-mono text-xs">{formatOptionalNumber(status.memory_usage)}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{formatDateTime(status.last_seen)}</TableCell>
                </TableRow>
              );
            })}
            {statuses.length === 0 && !isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  Belum ada device status.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

function ConfigOverview({
  configs,
  deviceById,
  isLoading,
  error,
}: {
  configs?: MonitoringConfig[];
  deviceById: Map<number, Device>;
  isLoading: boolean;
  error?: Error | null;
}) {
  return (
    <section className="card-glass rounded-lg overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <ServerCog className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Monitoring Configs</h2>
        </div>
        <span className="text-xs font-mono text-muted-foreground">{configs?.length || 0} config</span>
      </div>
      {error && <div className="px-4 py-6 text-sm text-destructive">{error.message}</div>}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Device</TableHead>
              <TableHead>Ping</TableHead>
              <TableHead>TCP</TableHead>
              <TableHead>Interval</TableHead>
              <TableHead>Port</TableHead>
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
            {configs?.map((config) => {
              const device = deviceById.get(config.device_id) || config.device;
              return (
                <TableRow key={config.id}>
                  <TableCell>
                    <p className="font-medium text-foreground">{device?.name || `Device #${config.device_id}`}</p>
                    <p className="font-mono text-xs text-muted-foreground">{device?.ip || `id:${config.device_id}`}</p>
                  </TableCell>
                  <TableCell>
                    <StatusPill status={config.ping_enabled ? "enabled" : "disabled"} />
                  </TableCell>
                  <TableCell>
                    <StatusPill status={config.tcp_enabled ? "stored" : "disabled"} />
                  </TableCell>
                  <TableCell className="text-xs">
                    <p>{config.ping_interval}s ping</p>
                    <p className="text-muted-foreground">{config.tcp_interval}s tcp</p>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{config.monitored_port || "-"}</TableCell>
                </TableRow>
              );
            })}
            {configs?.length === 0 && !isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  Belum ada monitoring config.
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
  const normalized = severity.toUpperCase();
  if (normalized === "CRITICAL") return "status-offline";
  if (normalized === "WARNING") return "border-warning/30 bg-warning/10 text-warning";
  return "border-primary/30 bg-primary/10 text-primary";
}

function packetLossClass(value: number) {
  if (value >= 100) return "status-offline";
  if (value > 0) return "border-warning/30 bg-warning/10 text-warning";
  return "status-online";
}

function formatNumber(value?: number | null) {
  return Number(value || 0).toLocaleString("id-ID", {
    maximumFractionDigits: 2,
  });
}

function formatOptionalNumber(value?: number | null) {
  return value === null || value === undefined ? "-" : `${formatNumber(value)}%`;
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
