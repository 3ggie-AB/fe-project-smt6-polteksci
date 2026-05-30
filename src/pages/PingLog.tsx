import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { FormEvent, ReactNode } from "react";
import { useMemo, useState } from "react";
import { Activity, Clock, Plus, Radio, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api, Device, DeviceStatus, DeviceStatusPayload } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type StatusForm = {
  device_id: string;
  latency: string;
  packet_loss: string;
  cpu_usage: string;
  memory_usage: string;
  last_seen: string;
};

const emptyForm: StatusForm = {
  device_id: "",
  latency: "0",
  packet_loss: "0",
  cpu_usage: "",
  memory_usage: "",
  last_seen: toLocalInputValue(new Date()),
};

export default function PingLog() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<StatusForm>(emptyForm);

  const { data: statuses, isLoading, error } = useQuery({
    queryKey: ["deviceStatuses"],
    queryFn: api.getDeviceStatuses,
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

  const latestStatuses = useMemo(
    () =>
      [...(statuses || [])].sort(
        (a, b) => new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime(),
      ),
    [statuses],
  );

  const addMutation = useMutation({
    mutationFn: api.addDeviceStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deviceStatuses"] });
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      setForm((current) => ({ ...emptyForm, device_id: current.device_id, last_seen: toLocalInputValue(new Date()) }));
      toast.success("Device status berhasil dibuat");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteDeviceStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deviceStatuses"] });
      toast.success("Device status dihapus");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const update = (key: keyof StatusForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
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
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Device Status</h1>
          <p className="text-sm text-muted-foreground">
            Hasil probe ping/SNMP yang ditulis worker ke `/api/device-status`.
          </p>
        </div>
        <div className="rounded-md border border-border bg-secondary/50 px-3 py-2 text-xs font-mono text-muted-foreground">
          {statuses?.length || 0} sample
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard label="Samples" value={statuses?.length ?? (isLoading ? "..." : 0)} icon={Activity} accent="text-accent" />
        <MetricCard label="Reachable" value={statuses?.filter((item) => item.packet_loss < 100).length || 0} icon={Radio} accent="text-success" />
        <MetricCard label="Last Seen" value={formatDateTime(latestStatuses[0]?.last_seen)} icon={Clock} accent="text-warning" />
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
          <Field label="Latency (ms)">
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.latency}
              onChange={(e) => update("latency", e.target.value)}
              className="field-input font-mono"
            />
          </Field>
          <Field label="Packet Loss (%)">
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={form.packet_loss}
              onChange={(e) => update("packet_loss", e.target.value)}
              className="field-input font-mono"
            />
          </Field>
          <Field label="CPU (%)">
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.cpu_usage}
              onChange={(e) => update("cpu_usage", e.target.value)}
              placeholder="optional"
              className="field-input font-mono"
            />
          </Field>
          <Field label="Memory (%)">
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.memory_usage}
              onChange={(e) => update("memory_usage", e.target.value)}
              placeholder="optional"
              className="field-input font-mono"
            />
          </Field>
          <Field label="Last Seen">
            <input
              type="datetime-local"
              value={form.last_seen}
              onChange={(e) => update("last_seen", e.target.value)}
              className="field-input font-mono"
            />
          </Field>
        </div>

        <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Form manual disediakan karena endpoint CRUD status tetap tersedia untuk admin.
          </p>
          <button
            type="submit"
            disabled={addMutation.isPending}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Create Status
          </button>
        </div>
      </form>

      {error && <p className="card-glass rounded-lg p-4 text-sm text-destructive">{(error as Error).message}</p>}

      <div className="card-glass rounded-lg overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Latest Probe Samples</h2>
          </div>
          <span className="text-xs text-muted-foreground font-mono">{latestStatuses.length} row</span>
        </div>
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
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading &&
                [...Array(5)].map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={7}>
                      <div className="h-4 bg-muted rounded animate-pulse" />
                    </TableCell>
                  </TableRow>
                ))}
              {latestStatuses.map((status) => (
                <StatusRow
                  key={status.id}
                  status={status}
                  device={deviceById.get(status.device_id)}
                  onDelete={() => {
                    if (window.confirm(`Hapus status sample #${status.id}?`)) {
                      deleteMutation.mutate(status.id);
                    }
                  }}
                />
              ))}
              {latestStatuses.length === 0 && !isLoading && (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    Belum ada device status.
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

function MetricCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number | string;
  icon: typeof Activity;
  accent: string;
}) {
  return (
    <div className="card-glass rounded-lg p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
        <Icon className={`h-4 w-4 ${accent}`} />
      </div>
      <p className="stat-value mt-2 text-foreground">{value}</p>
    </div>
  );
}

function StatusRow({
  status,
  device,
  onDelete,
}: {
  status: DeviceStatus;
  device?: Device;
  onDelete: () => void;
}) {
  return (
    <TableRow>
      <TableCell>
        <p className="font-medium text-foreground">{device?.name || status.device?.name || `Device #${status.device_id}`}</p>
        <p className="text-xs font-mono text-muted-foreground">{device?.ip || status.device?.ip || `id:${status.device_id}`}</p>
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
      <TableCell className="text-right">
        <button
          onClick={onDelete}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          aria-label={`Hapus status sample ${status.id}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </TableCell>
    </TableRow>
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

function toPayload(form: StatusForm): DeviceStatusPayload {
  const optionalNumber = (value: string) => {
    if (!value.trim()) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  return {
    device_id: Number(form.device_id),
    latency: Number(form.latency) || 0,
    packet_loss: Number(form.packet_loss) || 0,
    cpu_usage: optionalNumber(form.cpu_usage),
    memory_usage: optionalNumber(form.memory_usage),
    last_seen: new Date(form.last_seen).toISOString(),
  };
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
    second: "2-digit",
  });
}

function toLocalInputValue(date: Date) {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}
