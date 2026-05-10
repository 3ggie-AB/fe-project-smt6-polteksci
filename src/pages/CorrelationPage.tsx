import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, FeatureResponse } from "@/lib/api";
import { Activity, BrainCircuit, Cpu, Server, Signal, Waves } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const onnxLabels = [
  "latency_rolling_avg_ms",
  "packet_loss_ratio",
  "ap_load_score",
  "roaming_frequency",
  "traffic_anomaly_score",
];

export default function CorrelationPage() {
  const [selectedDeviceId, setSelectedDeviceId] = useState<number | "">("");

  const { data: devices, isLoading: devicesLoading } = useQuery({
    queryKey: ["devices"],
    queryFn: api.getDevices,
  });

  useEffect(() => {
    if (!selectedDeviceId && devices?.length) {
      setSelectedDeviceId(devices[0].id);
    }
  }, [devices, selectedDeviceId]);

  const featureQuery = useQuery({
    queryKey: ["features", selectedDeviceId],
    queryFn: () => api.getFeatureVector(Number(selectedDeviceId)),
    enabled: !!selectedDeviceId,
    refetchInterval: 15000,
    retry: false,
  });

  const selectedDevice = devices?.find((device) => device.id === Number(selectedDeviceId));
  const chartData = useMemo(() => toChartData(featureQuery.data), [featureQuery.data]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">ML Feature Vector</h1>
          <p className="text-sm text-muted-foreground">
            Feature vector terbaru dari in-memory feature engineering layer untuk input ONNX.
          </p>
        </div>
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
      </div>

      {selectedDevice && (
        <div className="card-glass rounded-lg p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Server className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{selectedDevice.name}</p>
                <p className="text-xs font-mono text-muted-foreground">
                  {selectedDevice.ip_address} / {selectedDevice.device_type || "network"} / {selectedDevice.vendor || "unknown"}
                </p>
              </div>
            </div>
            <span className="rounded-full border border-border bg-secondary px-2 py-1 text-xs font-mono text-muted-foreground">
              workspace {selectedDevice.workspace?.slug || selectedDevice.workspace_id}
            </span>
          </div>
        </div>
      )}

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
              <div className="mb-4 flex items-center gap-2">
                <Signal className="h-5 w-5 text-accent" />
                <h2 className="text-lg font-semibold text-foreground">Feature Scale</h2>
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
                {featureQuery.data.onnx_input.map((value, index) => (
                  <div key={onnxLabels[index]} className="rounded-md border border-border bg-secondary/50 px-3 py-2">
                    <p className="text-[11px] text-muted-foreground">{index}. {onnxLabels[index]}</p>
                    <p className="font-mono text-sm font-semibold text-foreground">{formatNumber(value)}</p>
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

function FeatureCards({ data }: { data: FeatureResponse }) {
  const features = data.features;
  const cards = [
    { label: "Latency Avg", value: `${formatNumber(features.latency_rolling_avg_ms)} ms`, icon: Signal, accent: "text-warning" },
    { label: "Packet Loss", value: formatRatio(features.packet_loss_ratio), icon: Waves, accent: "text-destructive" },
    { label: "AP Load", value: formatNumber(features.ap_load_score), icon: Cpu, accent: "text-primary" },
    { label: "Roaming", value: formatNumber(features.roaming_frequency), icon: Activity, accent: "text-accent" },
    { label: "Anomaly", value: formatNumber(features.traffic_anomaly_score), icon: BrainCircuit, accent: "text-success" },
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
    value: data.onnx_input[index],
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
