import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, Device, DevicePayload } from "@/lib/api";
import type { FormEvent, ReactNode } from "react";
import { useState } from "react";
import { CircleCheck, Plus, Router, Trash2, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type DeviceForm = {
  name: string;
  ip_address: string;
  mac_address: string;
  vendor: string;
  model: string;
  location: string;
  device_type: string;
  snmp_community: string;
  snmp_version: string;
  ruijie_external_id: string;
  is_active: boolean;
};

const emptyForm: DeviceForm = {
  name: "",
  ip_address: "",
  mac_address: "",
  vendor: "",
  model: "",
  location: "",
  device_type: "access_point",
  snmp_community: "",
  snmp_version: "v2c",
  ruijie_external_id: "",
  is_active: true,
};

export default function Targets() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<DeviceForm>(emptyForm);

  const { data: devices, isLoading } = useQuery({
    queryKey: ["devices"],
    queryFn: api.getDevices,
    refetchInterval: 10000,
  });

  const addMutation = useMutation({
    mutationFn: api.addDevice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      setForm(emptyForm);
      toast.success("Device berhasil diregistrasi");
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
    if (!form.name.trim() || !form.ip_address.trim()) {
      toast.error("Nama device dan IP address wajib diisi");
      return;
    }
    addMutation.mutate(toPayload(form));
  };

  const update = (key: keyof DeviceForm, value: string | boolean) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Device Registry</h1>
        <p className="text-sm text-muted-foreground">
          Inventory perangkat jaringan fisik/logis: router, switch, dan access point.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card-glass rounded-lg p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          <Field label="Nama Device *">
            <input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="AP Lobby"
              className="field-input"
              required
            />
          </Field>
          <Field label="IP Address *">
            <input
              value={form.ip_address}
              onChange={(e) => update("ip_address", e.target.value)}
              placeholder="192.168.10.20"
              className="field-input font-mono"
              required
            />
          </Field>
          <Field label="MAC Address">
            <input
              value={form.mac_address}
              onChange={(e) => update("mac_address", e.target.value)}
              placeholder="AA:BB:CC:DD:EE:FF"
              className="field-input font-mono"
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
          <Field label="Vendor">
            <input
              value={form.vendor}
              onChange={(e) => update("vendor", e.target.value)}
              placeholder="ruijie / mikrotik / cisco"
              className="field-input"
            />
          </Field>
          <Field label="Model">
            <input
              value={form.model}
              onChange={(e) => update("model", e.target.value)}
              placeholder="RG-AP820"
              className="field-input"
            />
          </Field>
          <Field label="Device Type">
            <select value={form.device_type} onChange={(e) => update("device_type", e.target.value)} className="field-input">
              <option value="router">router</option>
              <option value="switch">switch</option>
              <option value="access_point">access_point</option>
            </select>
          </Field>
          <Field label="SNMP Version">
            <select value={form.snmp_version} onChange={(e) => update("snmp_version", e.target.value)} className="field-input">
              <option value="v2c">v2c</option>
              <option value="v3">v3</option>
              <option value="">disabled</option>
            </select>
          </Field>
          <Field label="SNMP Community">
            <input
              type="password"
              value={form.snmp_community}
              onChange={(e) => update("snmp_community", e.target.value)}
              placeholder="public"
              className="field-input"
            />
          </Field>
          <Field label="Ruijie External ID">
            <input
              value={form.ruijie_external_id}
              onChange={(e) => update("ruijie_external_id", e.target.value)}
              placeholder="ap-lobby-01"
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
        </div>

        <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            SNMP community dikirim ke backend sebagai secret. Ping/TCP check dikelola dari menu Monitoring Targets.
          </p>
          <button
            type="submit"
            disabled={addMutation.isPending}
            className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Register Device
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
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>SNMP</TableHead>
                <TableHead>Ruijie</TableHead>
                <TableHead>Last Seen</TableHead>
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
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
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
  return (
    <TableRow>
      <TableCell>
        {device.is_active ? (
          <CircleCheck className="h-4 w-4 text-success" />
        ) : (
          <WifiOff className="h-4 w-4 text-destructive" />
        )}
      </TableCell>
      <TableCell>
        <div>
          <p className="font-medium text-foreground">{device.name}</p>
          <p className="text-xs text-muted-foreground">
            {[device.vendor, device.model, device.location].filter(Boolean).join(" / ") || "metadata kosong"}
          </p>
        </div>
      </TableCell>
      <TableCell className="font-mono text-xs">{device.ip_address}</TableCell>
      <TableCell className="text-xs">{device.device_type || "-"}</TableCell>
      <TableCell className="text-xs">{device.snmp_version || "-"}</TableCell>
      <TableCell className="text-xs font-mono text-muted-foreground">{device.ruijie_external_id || "-"}</TableCell>
      <TableCell className="text-xs font-mono text-muted-foreground">{formatDateTime(device.last_seen_at)}</TableCell>
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
    ip_address: form.ip_address.trim(),
    mac_address: clean(form.mac_address),
    vendor: clean(form.vendor),
    model: clean(form.model),
    location: clean(form.location),
    device_type: clean(form.device_type),
    snmp_community: clean(form.snmp_community),
    snmp_version: clean(form.snmp_version),
    ruijie_external_id: clean(form.ruijie_external_id),
    is_active: form.is_active,
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
