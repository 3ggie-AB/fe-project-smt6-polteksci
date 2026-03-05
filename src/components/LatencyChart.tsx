import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

export function LatencyChart() {
  const [selectedIp, setSelectedIp] = useState<string>("");
  const [hours, setHours] = useState(1);

  const { data: targets } = useQuery({
    queryKey: ["targets"],
    queryFn: api.getTargets,
  });

  const { data: history } = useQuery({
    queryKey: ["pingHistory", selectedIp, hours],
    queryFn: () => api.getPingHistory({ ip: selectedIp || undefined, hours }),
    refetchInterval: 15000,
  });

  const chartData = (history || []).map((p) => ({
    time: new Date(p.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    latency: p.latency_ms,
    packetLoss: p.packet_loss,
    ip: p.ip_address,
  }));

  return (
    <div className="card-glass rounded-lg p-4">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-sm font-semibold text-foreground">Ping History</h2>
        <div className="flex items-center gap-2">
          <select
            value={selectedIp}
            onChange={(e) => setSelectedIp(e.target.value)}
            className="bg-secondary text-secondary-foreground text-xs rounded-md px-2 py-1.5 border border-border"
          >
            <option value="">Semua IP</option>
            {targets?.map((t) => (
              <option key={t.id} value={t.ip_address}>
                {t.ip_address} - {t.label}
              </option>
            ))}
          </select>
          <select
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="bg-secondary text-secondary-foreground text-xs rounded-md px-2 py-1.5 border border-border"
          >
            <option value={1}>1 Jam</option>
            <option value={3}>3 Jam</option>
            <option value={6}>6 Jam</option>
            <option value={12}>12 Jam</option>
            <option value={24}>24 Jam</option>
          </select>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 14% 18%)" />
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(215 14% 50%)" }} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(215 14% 50%)" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(220 18% 12%)",
                border: "1px solid hsl(220 14% 18%)",
                borderRadius: "6px",
                fontSize: 12,
                color: "hsl(210 20% 92%)",
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="latency" stroke="hsl(160 84% 44%)" strokeWidth={2} dot={false} name="Latency (ms)" />
            <Line type="monotone" dataKey="packetLoss" stroke="hsl(0 72% 52%)" strokeWidth={2} dot={false} name="Packet Loss (%)" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
