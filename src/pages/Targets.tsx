import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, Target } from "@/lib/api";
import { useState } from "react";
import { Plus, Trash2, Wifi, WifiOff } from "lucide-react";
import { toast } from "sonner";

export default function Targets() {
  const queryClient = useQueryClient();
  const { data: targets, isLoading } = useQuery({
    queryKey: ["targets"],
    queryFn: api.getTargets,
  });

  const [ip, setIp] = useState("");
  const [label, setLabel] = useState("");

  const addMutation = useMutation({
    mutationFn: api.addTarget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["targets"] });
      setIp("");
      setLabel("");
      toast.success("Target berhasil ditambahkan");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteTarget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["targets"] });
      toast.success("Target dihapus");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ip.trim()) return;
    addMutation.mutate({ ip_address: ip.trim(), label: label.trim() || undefined });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Target Management</h1>
        <p className="text-sm text-muted-foreground">Kelola daftar IP/hostname yang dipantau</p>
      </div>

      <form onSubmit={handleSubmit} className="card-glass rounded-lg p-4 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs text-muted-foreground mb-1 block">IP Address / Hostname *</label>
          <input
            type="text"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            placeholder="8.8.8.8"
            className="w-full bg-secondary text-foreground font-mono text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-primary"
            required
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs text-muted-foreground mb-1 block">Label</label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Google DNS"
            className="w-full bg-secondary text-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <button
          type="submit"
          disabled={addMutation.isPending}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Tambah
        </button>
      </form>

      <div className="card-glass rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-3 text-xs text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 text-xs text-muted-foreground uppercase tracking-wider">IP Address</th>
              <th className="text-left px-4 py-3 text-xs text-muted-foreground uppercase tracking-wider">Label</th>
              <th className="text-left px-4 py-3 text-xs text-muted-foreground uppercase tracking-wider">Dibuat</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              [...Array(3)].map((_, i) => (
                <tr key={i} className="border-b border-border">
                  <td colSpan={5} className="px-4 py-3"><div className="h-4 bg-muted rounded animate-pulse" /></td>
                </tr>
              ))}
            {targets?.map((t) => (
              <TargetRow key={t.id} target={t} onDelete={() => deleteMutation.mutate(t.id)} />
            ))}
            {targets?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Belum ada target.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TargetRow({ target, onDelete }: { target: Target; onDelete: () => void }) {
  return (
    <tr className="border-b border-border hover:bg-secondary/50 transition-colors">
      <td className="px-4 py-3">
        {target.is_active ? (
          <Wifi className="h-4 w-4 text-success" />
        ) : (
          <WifiOff className="h-4 w-4 text-destructive" />
        )}
      </td>
      <td className="px-4 py-3 font-mono text-foreground">{target.ip_address}</td>
      <td className="px-4 py-3 text-muted-foreground">{target.label || "—"}</td>
      <td className="px-4 py-3 text-muted-foreground text-xs font-mono">
        {new Date(target.created_at).toLocaleDateString("id-ID")}
      </td>
      <td className="px-4 py-3 text-right">
        <button onClick={onDelete} className="text-muted-foreground hover:text-destructive transition-colors p-1">
          <Trash2 className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}
