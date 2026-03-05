import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  ScatterChart, Scatter, ZAxis,
} from "recharts";

export default function CorrelationPage() {
  const [days, setDays] = useState(7);
  const { data, isLoading, error } = useQuery({
    queryKey: ["correlation", days],
    queryFn: () => api.getCorrelation(days),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analisis Korelasi</h1>
          <p className="text-sm text-muted-foreground">Korelasi kualitas jaringan vs kepuasan pengguna</p>
        </div>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="bg-secondary text-secondary-foreground text-sm rounded-md px-3 py-2 border border-border"
        >
          <option value={7}>7 Hari</option>
          <option value={14}>14 Hari</option>
          <option value={30}>30 Hari</option>
        </select>
      </div>

      {isLoading && <div className="card-glass rounded-lg p-12 text-center text-muted-foreground">Memuat data...</div>}
      {error && <div className="card-glass rounded-lg p-6 text-center text-destructive text-sm">{(error as Error).message}</div>}

      {data && (
        <>
          {/* Correlation coefficients */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CorrelationCard
              label="Latensi vs Kepuasan"
              value={data.correlations.latency_vs_satisfaction}
              interpretation={data.interpretation.latency}
            />
            <CorrelationCard
              label="Uptime vs Kepuasan"
              value={data.correlations.uptime_vs_satisfaction}
              interpretation={data.interpretation.uptime}
            />
            <CorrelationCard
              label="Packet Loss vs Kepuasan"
              value={data.correlations.packetloss_vs_satisfaction}
              interpretation={data.interpretation.packetloss}
            />
          </div>

          {/* Daily chart */}
          <div className="card-glass rounded-lg p-4">
            <h2 className="text-sm font-semibold text-foreground mb-4">Data Harian</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 14% 18%)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(215 14% 50%)" }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "hsl(215 14% 50%)" }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: "hsl(215 14% 50%)" }} domain={[0, 5]} />
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
                  <Bar yAxisId="left" dataKey="avg_latency" fill="hsl(185 72% 48%)" name="Latency (ms)" radius={[2, 2, 0, 0]} />
                  <Bar yAxisId="right" dataKey="avg_satisfaction" fill="hsl(160 84% 44%)" name="Kepuasan (1-5)" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Scatter plot */}
          <div className="card-glass rounded-lg p-4">
            <h2 className="text-sm font-semibold text-foreground mb-4">Scatter: Latency vs Kepuasan</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 14% 18%)" />
                  <XAxis type="number" dataKey="avg_latency" name="Latency (ms)" tick={{ fontSize: 10, fill: "hsl(215 14% 50%)" }} />
                  <YAxis type="number" dataKey="avg_satisfaction" name="Kepuasan" domain={[0, 5]} tick={{ fontSize: 10, fill: "hsl(215 14% 50%)" }} />
                  <ZAxis type="number" dataKey="survey_count" range={[50, 400]} name="Jumlah Survey" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(220 18% 12%)",
                      border: "1px solid hsl(220 14% 18%)",
                      borderRadius: "6px",
                      fontSize: 12,
                      color: "hsl(210 20% 92%)",
                    }}
                  />
                  <Scatter data={data.data} fill="hsl(160 84% 44%)" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function CorrelationCard({ label, value, interpretation }: { label: string; value: number; interpretation: string }) {
  const absVal = Math.abs(value);
  const color = absVal >= 0.7 ? "text-primary" : absVal >= 0.4 ? "text-warning" : "text-muted-foreground";

  return (
    <div className="card-glass rounded-lg p-4">
      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{label}</p>
      <p className={`stat-value ${color}`}>{value.toFixed(3)}</p>
      <p className="text-xs text-muted-foreground mt-2">{interpretation}</p>
    </div>
  );
}
