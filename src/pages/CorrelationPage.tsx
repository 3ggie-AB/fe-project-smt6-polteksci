import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, Device, FeatureResponse, MonitoringTarget } from "@/lib/api";
import { Activity, BrainCircuit, Cpu, Server, ServerCog, Signal, Waves } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type FeatureScope = "device" | "target";

const onnxLabels = [
  "latency_rolling_avg_ms",
  "packet_loss_ratio",
  "ap_load_score",
  "roaming_frequency",
  "traffic_anomaly_score",
];

export default function CorrelationPage() {
  const [scope, setScope] = useState<FeatureScope>("device");
  const [selectedDeviceId, setSelectedDeviceId] = useState<number | "">("");
  const [selectedTargetId, setSelectedTargetId] = useState<number | "">("");

  const { data: devices, isLoading: devicesLoading } = useQuery({
    queryKey: ["devices"],
    queryFn: api.getDevices,
  });

  const { data: targets, isLoading: targetsLoading } = useQuery({
    queryKey: ["monitoringTargets"],
    queryFn: api.getMonitoringTargets,
  });

  useEffect(() => {
    if (!selectedDeviceId && devices?.length) {
      setSelectedDeviceId(devices[0].id);
    }
  }, [devices, selectedDeviceId]);

  useEffect(() => {
    if (!selectedTargetId && targets?.length) {
      setSelectedTargetId(targets[0].id);
    }
  }, [targets, selectedTargetId]);

  const selectedId = scope === "device" ? selectedDeviceId : selectedTargetId;
  const featureQuery = useQuery({
    queryKey: ["features", scope, selectedId],
    queryFn: () =>
      scope === "device"
        ? api.getDeviceFeatureVector(Number(selectedDeviceId))
        : api.getTargetFeatureVector(Number(selectedTargetId)),
    enabled: !!selectedId,
    refetchInterval: 15000,
    retry: false,
  });

  const selectedDevice = devices?.find((device) => device.id === Number(selectedDeviceId));
  const selectedTarget = targets?.find((target) => target.id === Number(selectedTargetId));
  const chartData = useMemo(() => toChartData(featureQuery.data), [featureQuery.data]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">ML Feature Vector</h1>
          <p className="text-sm text-muted-foreground">
            Feature vector terbaru untuk device inventory atau monitoring target.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="flex rounded-md border border-border bg-secondary/60 p-1">
            {(["device", "target"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setScope(item)}
                className={`rounded-sm px-4 py-2 text-sm font-medium transition-colors ${
                  scope === item
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item === "device" ? "Device" : "Target"}
              </button>
            ))}
          </div>
          {scope === "device" ? (
            <select
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value ? Number(e.target.value) : "")}
              className="rounded-md border border-border bg-secondary px-3 py-2 text-sm text-secondary-foreground"
            >
              <option value="">{devicesLoading ? "Memuat device..." : "Pilih device"}</option>
              {devices?.map((device) => (
                <option key={device.id} value={device.id}>
                  {device.name} - {device.ip_address}
                </option>
              ))}
            </select>
          ) : (
            <select
              value={selectedTargetId}
              onChange={(e) => setSelectedTargetId(e.target.value ? Number(e.target.value) : "")}
              className="rounded-md border border-border bg-secondary px-3 py-2 text-sm text-secondary-foreground"
            >
              <option value="">{targetsLoading ? "Memuat target..." : "Pilih target"}</option>
              {targets?.map((target) => (
                <option key={target.id} value={target.id}>
                  {target.name} - {target.host}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {scope === "device" && selectedDevice && <DeviceFeatureHeader device={selectedDevice} />}
      {scope === "target" && selectedTarget && <TargetFeatureHeader target={selectedTarget} />}

      {featureQuery.isLoading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="h-24 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      )}

      {featureQuery.error && (
        <div className="card-glass rounded-lg p-8 text-center">
          <BrainCircuit className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{(featureQuery.error as Error).message}</p>
        </div>
      )}

      {featureQuery.data && (
        <>
          <FeatureCards data={featureQuery.data} />

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <section className="card-glass rounded-lg p-4 xl:col-span-2">
              <div className="mb-4 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Signal className="h-5 w-5 text-accent" />
                  <h2 className="text-lg font-semibold text-foreground">Feature Scale</h2>
                </div>
                <span className="font-mono text-xs text-muted-foreground">
                  {formatDateTime(featureQuery.data.features.timestamp)}
                </span>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px",
                        fontSize: 12,
                        color: "hsl(var(--foreground))",
                      }}
                    />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="card-glass rounded-lg p-4">
              <div className="mb-4 flex items-center gap-2">
                <Cpu className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">ONNX Input</h2>
              </div>
              <div className="space-y-3">
                {onnxLabels.map((label, index) => (
                  <div key={label} className="rounded-md border border-border bg-secondary/50 px-3 py-2">
                    <p className="text-[11px] text-muted-foreground">
                      {index}. {label}
                    </p>
                    <p className="font-mono text-sm font-semibold text-foreground">
                      {formatNumber(featureQuery.data.onnx_input[index] ?? 0)}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}

function DeviceFeatureHeader({ device }: { device: Device }) {
  return (
    <div className="card-glass rounded-lg p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Server className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-foreground">{device.name}</p>
            <p className="text-xs font-mono text-muted-foreground">
              {device.ip_address} / {device.device_type || "device"} / {device.vendor || "unknown"}
            </p>
          </div>
        </div>
        <span className="rounded-full border border-border bg-secondary px-2 py-1 text-xs font-mono text-muted-foreground">
          device #{device.id}
        </span>
      </div>
    </div>
  );
}

function TargetFeatureHeader({ target }: { target: MonitoringTarget }) {
  return (
    <div className="card-glass rounded-lg p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent/10 text-accent">
            <ServerCog className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-foreground">{target.name}</p>
            <p className="text-xs font-mono text-muted-foreground">
              {target.host} / {target.check_type} / {target.port ? `port ${target.port}` : "no port"}
            </p>
          </div>
        </div>
        <span className="rounded-full border border-border bg-secondary px-2 py-1 text-xs font-mono text-muted-foreground">
          target #{target.id}
        </span>
      </div>
    </div>
  );
}

function FeatureCards({ data }: { data: FeatureResponse }) {
  const features = data.features;
  const cards = [
    { label: "Latency Avg", value: `${formatNumber(features.latency_rolling_avg_ms ?? 0)} ms`, icon: Signal, accent: "text-warning" },
    { label: "Packet Loss", value: formatRatio(features.packet_loss_ratio ?? 0), icon: Waves, accent: "text-destructive" },
    { label: "AP Load", value: formatNumber(features.ap_load_score ?? 0), icon: Cpu, accent: "text-primary" },
    { label: "Roaming", value: formatNumber(features.roaming_frequency ?? 0), icon: Activity, accent: "text-accent" },
    { label: "Anomaly", value: formatNumber(features.traffic_anomaly_score ?? 0), icon: BrainCircuit, accent: "text-success" },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => (
        <div key={card.label} className="card-glass rounded-lg p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">{card.label}</span>
            <card.icon className={`h-4 w-4 ${card.accent}`} />
          </div>
          <p className="stat-value text-foreground">{card.value}</p>
        </div>
      ))}
    </div>
  );
}

function toChartData(data?: FeatureResponse) {
  if (!data) return [];
  return onnxLabels.map((label, index) => ({
    label: label.replace(/_/g, " ").replace(" ratio", ""),
    value: data.onnx_input[index] ?? 0,
  }));
}

function formatNumber(value: number) {
  return Number(value || 0).toLocaleString("id-ID", {
    maximumFractionDigits: 3,
  });
}

function formatRatio(value: number) {
  return `${formatNumber(value * 100)}%`;
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
