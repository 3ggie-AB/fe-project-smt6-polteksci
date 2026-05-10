import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { FormEvent, ReactNode } from "react";
import { useState } from "react";
import { CircleCheck, Plus, ServerCog, Trash2, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { api, MonitoringTarget, MonitoringTargetPayload } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type TargetForm = {
  name: string;
  host: string;
  check_type: "ping" | "tcp";
  port: string;
  interval_sec: string;
  timeout_sec: string;
  description: string;
  is_active: boolean;
};

const emptyForm: TargetForm = {
  name: "",
  host: "",
  check_type: "ping",
  port: "",
  interval_sec: "5",
  timeout_sec: "3",
  description: "",
  is_active: true,
};

export default function MonitoringTargets() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<TargetForm>(emptyForm);

  const { data: targets, isLoading } = useQuery({
    queryKey: ["monitoringTargets"],
    queryFn: api.getMonitoringTargets,
    refetchInterval: 10000,
  });

  const addMutation = useMutation({
    mutationFn: api.addMonitoringTarget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monitoringTargets"] });
      setForm(emptyForm);
      toast.success("Monitoring target berhasil dibuat");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteMonitoringTarget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monitoringTargets"] });
      toast.success("Monitoring target dihapus");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const update = (key: keyof TargetForm, value: string | boolean) => {
    setForm((current) => ({
      ...current,
      [key]: value,
      ...(key === "check_type"
        ? {
            interval_sec: value === "ping" ? "5" : "30",
            port: value === "ping" ? "" : current.port,
          }
        : {}),
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.host.trim()) {
      toast.error("Nama target dan host wajib diisi");
      return;
    }
    addMutation.mutate(toPayload(form));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Monitoring Targets</h1>
        <p className="text-sm text-muted-foreground">
          Active monitoring untuk ping, TCP health check, dan URL/server check.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card-glass rounded-lg p-4 space-y-4">
        <div className="flex w-full rounded-md border border-border bg-secondary/60 p-1 sm:w-fit">
          {(["ping", "tcp"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => update("check_type", type)}
              className={`flex-1 rounded-sm px-4 py-2 text-sm font-medium transition-colors sm:flex-none ${
                form.check_type === type
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {type.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Field label="Nama Target *">
            <input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder={form.check_type === "ping" ? "Gateway Ping" : "API Production HTTPS"}
              className="field-input"
              required
            />
          </Field>
          <Field label="Host / URL *">
            <input
              value={form.host}
              onChange={(e) => update("host", e.target.value)}
              placeholder={form.check_type === "ping" ? "192.168.1.1" : "https://api.example.com"}
              className="field-input font-mono"
              required
            />
          </Field>
          {form.check_type === "tcp" && (
            <Field label="Port">
              <input
                type="number"
                min="1"
                max="65535"
                value={form.port}
                onChange={(e) => update("port", e.target.value)}
                placeholder="443"
                className="field-input font-mono"
              />
            </Field>
          )}
          <Field label="Interval (sec)">
            <input
              type="number"
              min="1"
              value={form.interval_sec}
              onChange={(e) => update("interval_sec", e.target.value)}
              className="field-input font-mono"
            />
          </Field>
          <Field label="Timeout (sec)">
            <input
              type="number"
              min="1"
              value={form.timeout_sec}
              onChange={(e) => update("timeout_sec", e.target.value)}
              className="field-input font-mono"
            />
          </Field>
          <label className="flex items-center gap-2 rounded-md border border-border bg-secondary/50 px-3 py-2.5 text-sm text-foreground">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => update("is_active", e.target.checked)}
              className="h-4 w-4 accent-primary"
            />
            Active monitoring
          </label>
          <div className="md:col-span-2">
            <Field label="Description">
              <input
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Ping gateway utama"
                className="field-input"
              />
            </Field>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Device inventory tetap di menu Devices. Semua konfigurasi ping/TCP aktif dibuat dari halaman ini.
          </p>
          <button
            type="submit"
            disabled={addMutation.isPending}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Create Target
          </button>
        </div>
      </form>

      <div className="card-glass rounded-lg overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <ServerCog className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Active Checks</h2>
          </div>
          <span className="text-xs text-muted-foreground font-mono">{targets?.length || 0} target</span>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Host</TableHead>
                <TableHead>Check</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Last</TableHead>
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
              {targets?.map((target) => (
                <TargetRow
                  key={target.id}
                  target={target}
                  onDelete={() => {
                    if (window.confirm(`Hapus ${target.name}?`)) {
                      deleteMutation.mutate(target.id);
                    }
                  }}
                />
              ))}
              {targets?.length === 0 && !isLoading && (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    Belum ada monitoring target.
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

function TargetRow({ target, onDelete }: { target: MonitoringTarget; onDelete: () => void }) {
  return (
    <TableRow>
      <TableCell>
        {target.is_active ? (
          <CircleCheck className="h-4 w-4 text-success" />
        ) : (
          <WifiOff className="h-4 w-4 text-destructive" />
        )}
      </TableCell>
      <TableCell>
        <div>
          <p className="font-medium text-foreground">{target.name}</p>
          <p className="max-w-52 truncate text-xs text-muted-foreground">{target.description || "No description"}</p>
        </div>
      </TableCell>
      <TableCell className="font-mono text-xs">{target.host}</TableCell>
      <TableCell className="text-xs">
        <p className="font-mono">{target.check_type}</p>
        <p className="text-muted-foreground">{target.port ? `port ${target.port}` : "no port"}</p>
      </TableCell>
      <TableCell className="text-xs">
        <p>{target.interval_sec}s interval</p>
        <p className="text-muted-foreground">{target.timeout_sec}s timeout</p>
      </TableCell>
      <TableCell>
        <span className={`rounded-full border px-2 py-0.5 text-[11px] font-mono ${lastStatusClass(target.last_status)}`}>
          {formatLastStatus(target.last_status)}
        </span>
      </TableCell>
      <TableCell className="text-right">
        <button
          onClick={onDelete}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          aria-label={`Hapus ${target.name}`}
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

function toPayload(form: TargetForm): MonitoringTargetPayload {
  const numberValue = (value: string) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
  };
  const clean = (value: string) => value.trim() || undefined;

  return {
    name: form.name.trim(),
    host: form.host.trim(),
    check_type: form.check_type,
    port: form.check_type === "tcp" ? numberValue(form.port) : undefined,
    interval_sec: numberValue(form.interval_sec),
    timeout_sec: numberValue(form.timeout_sec),
    description: clean(form.description),
    is_active: form.is_active,
  };
}

function lastStatusClass(status?: boolean | null) {
  if (status === true) return "status-online";
  if (status === false) return "status-offline";
  return "border-border text-muted-foreground";
}

function formatLastStatus(status?: boolean | null) {
  if (status === true) return "UP";
  if (status === false) return "DOWN";
  return "UNKNOWN";
}
