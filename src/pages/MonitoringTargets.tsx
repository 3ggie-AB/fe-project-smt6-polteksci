import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { FormEvent, ReactNode } from "react";
import { useMemo, useState } from "react";
import { Plus, ServerCog, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api, Device, MonitoringConfig, MonitoringConfigPayload } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type ConfigForm = {
  device_id: string;
  ping_enabled: boolean;
  tcp_enabled: boolean;
  ping_interval: string;
  tcp_interval: string;
  monitored_port: string;
};

const emptyForm: ConfigForm = {
  device_id: "",
  ping_enabled: true,
  tcp_enabled: false,
  ping_interval: "5",
  tcp_interval: "30",
  monitored_port: "0",
};

export default function MonitoringTargets() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<ConfigForm>(emptyForm);

  const { data: configs, isLoading, error } = useQuery({
    queryKey: ["monitoringConfigs"],
    queryFn: api.getMonitoringConfigs,
    refetchInterval: 10000,
  });

  const { data: devices } = useQuery({
    queryKey: ["devices"],
    queryFn: api.getDevices,
  });

  const deviceById = useMemo(
    () => new Map((devices || []).map((device) => [device.id, device])),
    [devices],
  );

  const addMutation = useMutation({
    mutationFn: api.addMonitoringConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monitoringConfigs"] });
      setForm(emptyForm);
      toast.success("Monitoring config berhasil dibuat");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteMonitoringConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monitoringConfigs"] });
      toast.success("Monitoring config dihapus");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const update = (key: keyof ConfigForm, value: string | boolean) => {
    setForm((current) => ({
      ...current,
      [key]: value,
      ...(key === "tcp_enabled" && value === false ? { monitored_port: "0" } : {}),
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.device_id) {
      toast.error("Device wajib dipilih");
      return;
    }
    addMutation.mutate(toPayload(form));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Monitoring Configs</h1>
        <p className="text-sm text-muted-foreground">
          Konfigurasi probe per device. Worker v4 memakai ping_enabled, sementara field TCP sudah tersimpan untuk kesiapan berikutnya.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card-glass rounded-lg p-4 space-y-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
          <Field label="Device *">
            <select
              value={form.device_id}
              onChange={(e) => update("device_id", e.target.value)}
              className="field-input"
              required
            >
              <option value="">Pilih device</option>
              {devices?.map((device) => (
                <option key={device.id} value={device.id}>
                  {device.name} - {device.ip}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Ping Interval (s)">
            <input
              type="number"
              min="1"
              value={form.ping_interval}
              onChange={(e) => update("ping_interval", e.target.value)}
              className="field-input font-mono"
            />
          </Field>
          <Field label="TCP Interval (s)">
            <input
              type="number"
              min="1"
              value={form.tcp_interval}
              onChange={(e) => update("tcp_interval", e.target.value)}
              className="field-input font-mono"
            />
          </Field>
          <Field label="Monitored Port">
            <input
              type="number"
              min="0"
              max="65535"
              value={form.monitored_port}
              onChange={(e) => update("monitored_port", e.target.value)}
              disabled={!form.tcp_enabled}
              className="field-input font-mono disabled:opacity-50"
            />
          </Field>
          <label className="flex items-center gap-2 rounded-md border border-border bg-secondary/50 px-3 py-2.5 text-sm text-foreground">
            <input
              type="checkbox"
              checked={form.ping_enabled}
              onChange={(e) => update("ping_enabled", e.target.checked)}
              className="h-4 w-4 accent-primary"
            />
            Ping enabled
          </label>
          <label className="flex items-center gap-2 rounded-md border border-border bg-secondary/50 px-3 py-2.5 text-sm text-foreground">
            <input
              type="checkbox"
              checked={form.tcp_enabled}
              onChange={(e) => update("tcp_enabled", e.target.checked)}
              className="h-4 w-4 accent-primary"
            />
            TCP stored
          </label>
        </div>

        <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Jika device belum punya config, backend memakai default ping enabled.
          </p>
          <button
            type="submit"
            disabled={addMutation.isPending}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Create Config
          </button>
        </div>
      </form>

      <div className="card-glass rounded-lg overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <ServerCog className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Configured Devices</h2>
          </div>
          <span className="text-xs text-muted-foreground font-mono">{configs?.length || 0} config</span>
        </div>
        {error && <p className="px-4 py-3 text-sm text-destructive">{(error as Error).message}</p>}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device</TableHead>
                <TableHead>Ping</TableHead>
                <TableHead>TCP</TableHead>
                <TableHead>Intervals</TableHead>
                <TableHead>Port</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading &&
                [...Array(4)].map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={7}>
                      <div className="h-4 bg-muted rounded animate-pulse" />
                    </TableCell>
                  </TableRow>
                ))}
              {configs?.map((config) => (
                <ConfigRow
                  key={config.id}
                  config={config}
                  device={deviceById.get(config.device_id)}
                  onDelete={() => {
                    const deviceName = deviceById.get(config.device_id)?.name || `config #${config.id}`;
                    if (window.confirm(`Hapus monitoring config ${deviceName}?`)) {
                      deleteMutation.mutate(config.id);
                    }
                  }}
                />
              ))}
              {configs?.length === 0 && !isLoading && (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    Belum ada monitoring config.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

function ConfigRow({
  config,
  device,
  onDelete,
}: {
  config: MonitoringConfig;
  device?: Device;
  onDelete: () => void;
}) {
  return (
    <TableRow>
      <TableCell>
        <p className="font-medium text-foreground">{device?.name || config.device?.name || `Device #${config.device_id}`}</p>
        <p className="text-xs font-mono text-muted-foreground">{device?.ip || config.device?.ip || `id:${config.device_id}`}</p>
      </TableCell>
      <TableCell>
        <StatusPill enabled={config.ping_enabled} label={config.ping_enabled ? "enabled" : "disabled"} />
      </TableCell>
      <TableCell>
        <StatusPill enabled={config.tcp_enabled} label={config.tcp_enabled ? "stored" : "disabled"} />
      </TableCell>
      <TableCell className="text-xs">
        <p>{config.ping_interval}s ping</p>
        <p className="text-muted-foreground">{config.tcp_interval}s tcp</p>
      </TableCell>
      <TableCell className="font-mono text-xs">{config.monitored_port || "-"}</TableCell>
      <TableCell className="font-mono text-xs text-muted-foreground">{formatDateTime(config.created_at)}</TableCell>
      <TableCell className="text-right">
        <button
          onClick={onDelete}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          aria-label={`Hapus monitoring config ${config.id}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </TableCell>
    </TableRow>
  );
}

function StatusPill({ enabled, label }: { enabled: boolean; label: string }) {
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[11px] font-mono ${enabled ? "status-online" : "border-border text-muted-foreground"}`}>
      {label}
    </span>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="space-y-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function toPayload(form: ConfigForm): MonitoringConfigPayload {
  const numberValue = (value: string, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
  };

  return {
    device_id: Number(form.device_id),
    ping_enabled: form.ping_enabled,
    tcp_enabled: form.tcp_enabled,
    ping_interval: numberValue(form.ping_interval, 5),
    tcp_interval: numberValue(form.tcp_interval, 30),
    monitored_port: form.tcp_enabled ? numberValue(form.monitored_port, 0) : 0,
  };
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
