import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, Device, DevicePayload, DeviceStatusValue, DeviceType } from "@/lib/api";
import type { FormEvent, ReactNode } from "react";
import { useState } from "react";
import { AlertTriangle, CircleCheck, Plus, Router, Trash2, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type DeviceForm = {
  name: string;
  ip: string;
  type: DeviceType;
  vendor: string;
  location: string;
  status: DeviceStatusValue;
};

const emptyForm: DeviceForm = {
  name: "",
  ip: "",
  type: "AP",
  vendor: "",
  location: "",
  status: "OFFLINE",
};

export default function Targets() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<DeviceForm>(emptyForm);

  const { data: devices, isLoading, error } = useQuery({
    queryKey: ["devices"],
    queryFn: api.getDevices,
    refetchInterval: 10000,
  });

  const addMutation = useMutation({
    mutationFn: api.addDevice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      setForm(emptyForm);
      toast.success("Device berhasil dibuat");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteDevice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      toast.success("Device dihapus");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.ip.trim()) {
      toast.error("Nama device dan IP/host wajib diisi");
      return;
    }
    addMutation.mutate(toPayload(form));
  };

  const update = (key: keyof DeviceForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Device Registry</h1>
        <p className="text-sm text-muted-foreground">
          Inventory perangkat dan service yang akan dipantau worker ping/SNMP backend.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card-glass rounded-lg p-4 space-y-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
          <Field label="Nama Device *">
            <input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="AP Lobby"
              className="field-input"
              required
            />
          </Field>
          <Field label="IP / Host *">
            <input
              value={form.ip}
              onChange={(e) => update("ip", e.target.value)}
              placeholder="192.168.10.20"
              className="field-input font-mono"
              required
            />
          </Field>
          <Field label="Type">
            <select value={form.type} onChange={(e) => update("type", e.target.value)} className="field-input">
              <option value="AP">AP</option>
              <option value="SERVICE">SERVICE</option>
            </select>
          </Field>
          <Field label="Vendor">
            <input
              value={form.vendor}
              onChange={(e) => update("vendor", e.target.value)}
              placeholder="Ruijie"
              className="field-input"
            />
          </Field>
          <Field label="Location">
            <input
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
              placeholder="Lobby"
              className="field-input"
            />
          </Field>
          <Field label="Initial Status">
            <select value={form.status} onChange={(e) => update("status", e.target.value)} className="field-input">
              <option value="OFFLINE">OFFLINE</option>
              <option value="ONLINE">ONLINE</option>
              <option value="WARNING">WARNING</option>
            </select>
          </Field>
        </div>

        <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Status akan diperbarui otomatis oleh worker berdasarkan hasil ping dan SNMP.
          </p>
          <button
            type="submit"
            disabled={addMutation.isPending}
            className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Create Device
          </button>
        </div>
      </form>

      <div className="card-glass rounded-lg overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <Router className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Registered Devices</h2>
          </div>
          <span className="text-xs text-muted-foreground font-mono">{devices?.length || 0} total</span>
        </div>
        {error && <p className="px-4 py-3 text-sm text-destructive">{(error as Error).message}</p>}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>IP/Host</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading &&
                [...Array(4)].map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={8}>
                      <div className="h-4 bg-muted rounded animate-pulse" />
                    </TableCell>
                  </TableRow>
                ))}
              {devices?.map((device) => (
                <DeviceRow
                  key={device.id}
                  device={device}
                  onDelete={() => {
                    if (window.confirm(`Hapus ${device.name}?`)) {
                      deleteMutation.mutate(device.id);
                    }
                  }}
                />
              ))}
              {devices?.length === 0 && !isLoading && (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                    Belum ada device.
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

function DeviceRow({ device, onDelete }: { device: Device; onDelete: () => void }) {
  const Icon = device.status === "ONLINE" ? CircleCheck : device.status === "WARNING" ? AlertTriangle : WifiOff;
  return (
    <TableRow>
      <TableCell>
        <span className={`inline-flex items-center gap-2 rounded-full border px-2 py-0.5 text-[11px] font-mono ${statusClass(device.status)}`}>
          <Icon className="h-3.5 w-3.5" />
          {device.status}
        </span>
      </TableCell>
      <TableCell>
        <p className="font-medium text-foreground">{device.name}</p>
        <p className="text-xs text-muted-foreground">device #{device.id}</p>
      </TableCell>
      <TableCell className="font-mono text-xs">{device.ip}</TableCell>
      <TableCell className="text-xs">{device.type}</TableCell>
      <TableCell className="text-xs">{device.vendor || "-"}</TableCell>
      <TableCell className="text-xs">{device.location || "-"}</TableCell>
      <TableCell className="text-xs font-mono text-muted-foreground">{formatDateTime(device.created_at)}</TableCell>
      <TableCell className="text-right">
        <button
          onClick={onDelete}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          aria-label={`Hapus ${device.name}`}
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

function toPayload(form: DeviceForm): DevicePayload {
  const clean = (value: string) => value.trim() || undefined;

  return {
    name: form.name.trim(),
    ip: form.ip.trim(),
    type: form.type,
    vendor: clean(form.vendor),
    location: clean(form.location),
    status: form.status,
  };
}

function statusClass(status: string) {
  if (status === "ONLINE") return "status-online";
  if (status === "WARNING") return "border-warning/30 bg-warning/10 text-warning";
  return "status-offline";
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
