import { useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  api,
  Device,
  MLAnomaly,
  MLAnomalyPayload,
  MLPrediction,
  MLPredictionPayload,
} from "@/lib/api";
import { AlertTriangle, BrainCircuit, Cpu, Plus, Server, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type PredictionForm = {
  device_id: string;
  prediction_type: string;
  prediction_value: string;
  confidence_score: string;
};

type AnomalyForm = {
  device_id: string;
  anomaly_score: string;
  prediction: string;
  severity: "WARNING" | "CRITICAL";
};

const emptyPrediction: PredictionForm = {
  device_id: "",
  prediction_type: "latency_next_5m",
  prediction_value: "",
  confidence_score: "0.9",
};

const emptyAnomaly: AnomalyForm = {
  device_id: "",
  anomaly_score: "0.8",
  prediction: "",
  severity: "WARNING",
};

export default function CorrelationPage() {
  const queryClient = useQueryClient();
  const [predictionForm, setPredictionForm] = useState<PredictionForm>(emptyPrediction);
  const [anomalyForm, setAnomalyForm] = useState<AnomalyForm>(emptyAnomaly);

  const { data: devices, isLoading: devicesLoading } = useQuery({
    queryKey: ["devices"],
    queryFn: api.getDevices,
  });

  const { data: predictions, isLoading: predictionsLoading, error: predictionsError } = useQuery({
    queryKey: ["mlPredictions"],
    queryFn: api.getMLPredictions,
    refetchInterval: 15000,
  });

  const { data: anomalies, isLoading: anomaliesLoading, error: anomaliesError } = useQuery({
    queryKey: ["mlAnomalies"],
    queryFn: api.getMLAnomalies,
    refetchInterval: 15000,
  });

  const deviceById = useMemo(
    () => new Map((devices || []).map((device) => [device.id, device])),
    [devices],
  );

  const addPredictionMutation = useMutation({
    mutationFn: api.addMLPrediction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mlPredictions"] });
      setPredictionForm((current) => ({ ...emptyPrediction, device_id: current.device_id }));
      toast.success("ML prediction berhasil dibuat");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const addAnomalyMutation = useMutation({
    mutationFn: api.addMLAnomaly,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mlAnomalies"] });
      setAnomalyForm((current) => ({ ...emptyAnomaly, device_id: current.device_id }));
      toast.success("ML anomaly berhasil dibuat");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deletePredictionMutation = useMutation({
    mutationFn: api.deleteMLPrediction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mlPredictions"] });
      toast.success("ML prediction dihapus");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteAnomalyMutation = useMutation({
    mutationFn: api.deleteMLAnomaly,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mlAnomalies"] });
      toast.success("ML anomaly dihapus");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const submitPrediction = (e: FormEvent) => {
    e.preventDefault();
    if (!predictionForm.device_id || !predictionForm.prediction_type.trim()) {
      toast.error("Device dan prediction type wajib diisi");
      return;
    }
    addPredictionMutation.mutate(toPredictionPayload(predictionForm));
  };

  const submitAnomaly = (e: FormEvent) => {
    e.preventDefault();
    if (!anomalyForm.device_id || !anomalyForm.prediction.trim()) {
      toast.error("Device dan prediction wajib diisi");
      return;
    }
    addAnomalyMutation.mutate(toAnomalyPayload(anomalyForm));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">ML Observability</h1>
          <p className="text-sm text-muted-foreground">
            CRUD untuk `/api/ml-predictions` dan `/api/ml-anomalies` sesuai kontrak API v4.
          </p>
        </div>
        <div className="rounded-md border border-border bg-secondary/50 px-3 py-2 text-xs font-mono text-muted-foreground">
          {devicesLoading ? "loading devices" : `${devices?.length || 0} device`}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <form onSubmit={submitPrediction} className="card-glass rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Create Prediction</h2>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <DeviceSelect
              devices={devices}
              value={predictionForm.device_id}
              onChange={(value) => setPredictionForm((current) => ({ ...current, device_id: value }))}
            />
            <Field label="Prediction Type">
              <input
                value={predictionForm.prediction_type}
                onChange={(e) => setPredictionForm((current) => ({ ...current, prediction_type: e.target.value }))}
                placeholder="latency_next_5m"
                className="field-input font-mono"
              />
            </Field>
            <Field label="Prediction Value">
              <input
                type="number"
                step="0.01"
                value={predictionForm.prediction_value}
                onChange={(e) => setPredictionForm((current) => ({ ...current, prediction_value: e.target.value }))}
                placeholder="32.7"
                className="field-input font-mono"
              />
            </Field>
            <Field label="Confidence Score">
              <input
                type="number"
                min="0"
                max="1"
                step="0.01"
                value={predictionForm.confidence_score}
                onChange={(e) => setPredictionForm((current) => ({ ...current, confidence_score: e.target.value }))}
                className="field-input font-mono"
              />
            </Field>
          </div>
          <button
            type="submit"
            disabled={addPredictionMutation.isPending}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Create Prediction
          </button>
        </form>

        <form onSubmit={submitAnomaly} className="card-glass rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <h2 className="text-lg font-semibold text-foreground">Create Anomaly</h2>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <DeviceSelect
              devices={devices}
              value={anomalyForm.device_id}
              onChange={(value) => setAnomalyForm((current) => ({ ...current, device_id: value }))}
            />
            <Field label="Anomaly Score">
              <input
                type="number"
                min="0"
                max="1"
                step="0.01"
                value={anomalyForm.anomaly_score}
                onChange={(e) => setAnomalyForm((current) => ({ ...current, anomaly_score: e.target.value }))}
                className="field-input font-mono"
              />
            </Field>
            <Field label="Prediction">
              <input
                value={anomalyForm.prediction}
                onChange={(e) => setAnomalyForm((current) => ({ ...current, prediction: e.target.value }))}
                placeholder="traffic spike detected"
                className="field-input"
              />
            </Field>
            <Field label="Severity">
              <select
                value={anomalyForm.severity}
                onChange={(e) => setAnomalyForm((current) => ({ ...current, severity: e.target.value as AnomalyForm["severity"] }))}
                className="field-input"
              >
                <option value="WARNING">WARNING</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </Field>
          </div>
          <button
            type="submit"
            disabled={addAnomalyMutation.isPending}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Create Anomaly
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <PredictionsTable
          predictions={predictions}
          deviceById={deviceById}
          isLoading={predictionsLoading}
          error={predictionsError as Error | null}
          onDelete={(id) => deletePredictionMutation.mutate(id)}
        />
        <AnomaliesTable
          anomalies={anomalies}
          deviceById={deviceById}
          isLoading={anomaliesLoading}
          error={anomaliesError as Error | null}
          onDelete={(id) => deleteAnomalyMutation.mutate(id)}
        />
      </div>
    </div>
  );
}

function DeviceSelect({
  devices,
  value,
  onChange,
}: {
  devices?: Device[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Field label="Device">
      <select value={value} onChange={(e) => onChange(e.target.value)} className="field-input" required>
        <option value="">Pilih device</option>
        {devices?.map((device) => (
          <option key={device.id} value={device.id}>
            {device.name} - {device.ip}
          </option>
        ))}
      </select>
    </Field>
  );
}

function PredictionsTable({
  predictions,
  deviceById,
  isLoading,
  error,
  onDelete,
}: {
  predictions?: MLPrediction[];
  deviceById: Map<number, Device>;
  isLoading: boolean;
  error?: Error | null;
  onDelete: (id: number) => void;
}) {
  return (
    <section className="card-glass rounded-lg overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Cpu className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">ML Predictions</h2>
        </div>
        <span className="text-xs font-mono text-muted-foreground">{predictions?.length || 0} row</span>
      </div>
      {error && <p className="px-4 py-3 text-sm text-destructive">{error.message}</p>}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Device</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Confidence</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
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
            {predictions?.map((prediction) => {
              const device = deviceById.get(prediction.device_id) || prediction.device;
              return (
                <TableRow key={prediction.id}>
                  <TableCell>
                    <p className="font-medium text-foreground">{device?.name || `Device #${prediction.device_id}`}</p>
                    <p className="font-mono text-xs text-muted-foreground">{device?.ip || `id:${prediction.device_id}`}</p>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{prediction.prediction_type}</TableCell>
                  <TableCell className="font-mono text-xs">{formatNumber(prediction.prediction_value)}</TableCell>
                  <TableCell className="font-mono text-xs">{formatPercent(prediction.confidence_score)}</TableCell>
                  <TableCell className="text-right">
                    <DeleteButton label={`Hapus prediction ${prediction.id}`} onClick={() => onDelete(prediction.id)} />
                  </TableCell>
                </TableRow>
              );
            })}
            {predictions?.length === 0 && !isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  Belum ada ML prediction.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

function AnomaliesTable({
  anomalies,
  deviceById,
  isLoading,
  error,
  onDelete,
}: {
  anomalies?: MLAnomaly[];
  deviceById: Map<number, Device>;
  isLoading: boolean;
  error?: Error | null;
  onDelete: (id: number) => void;
}) {
  return (
    <section className="card-glass rounded-lg overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          <h2 className="text-lg font-semibold text-foreground">ML Anomalies</h2>
        </div>
        <span className="text-xs font-mono text-muted-foreground">{anomalies?.length || 0} row</span>
      </div>
      {error && <p className="px-4 py-3 text-sm text-destructive">{error.message}</p>}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Device</TableHead>
              <TableHead>Prediction</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
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
            {anomalies?.map((anomaly) => {
              const device = deviceById.get(anomaly.device_id) || anomaly.device;
              return (
                <TableRow key={anomaly.id}>
                  <TableCell>
                    <p className="font-medium text-foreground">{device?.name || `Device #${anomaly.device_id}`}</p>
                    <p className="font-mono text-xs text-muted-foreground">{device?.ip || `id:${anomaly.device_id}`}</p>
                  </TableCell>
                  <TableCell className="text-xs">{anomaly.prediction}</TableCell>
                  <TableCell className="font-mono text-xs">{formatPercent(anomaly.anomaly_score)}</TableCell>
                  <TableCell>
                    <span className={`rounded-full border px-2 py-0.5 text-[11px] font-mono ${severityClass(anomaly.severity)}`}>
                      {anomaly.severity}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DeleteButton label={`Hapus anomaly ${anomaly.id}`} onClick={() => onDelete(anomaly.id)} />
                  </TableCell>
                </TableRow>
              );
            })}
            {anomalies?.length === 0 && !isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  Belum ada ML anomaly.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

function DeleteButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={() => {
        if (window.confirm(label)) onClick();
      }}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
      aria-label={label}
    >
      <Trash2 className="h-4 w-4" />
    </button>
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

function toPredictionPayload(form: PredictionForm): MLPredictionPayload {
  return {
    device_id: Number(form.device_id),
    prediction_type: form.prediction_type.trim(),
    prediction_value: Number(form.prediction_value) || 0,
    confidence_score: Number(form.confidence_score) || 0,
  };
}

function toAnomalyPayload(form: AnomalyForm): MLAnomalyPayload {
  return {
    device_id: Number(form.device_id),
    anomaly_score: Number(form.anomaly_score) || 0,
    prediction: form.prediction.trim(),
    severity: form.severity,
  };
}

function severityClass(severity: string) {
  return severity === "CRITICAL" ? "status-offline" : "border-warning/30 bg-warning/10 text-warning";
}

function formatNumber(value?: number | null) {
  return Number(value || 0).toLocaleString("id-ID", {
    maximumFractionDigits: 3,
  });
}

function formatPercent(value?: number | null) {
  return `${formatNumber((value || 0) * 100)}%`;
}
