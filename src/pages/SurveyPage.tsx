import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState } from "react";
import { toast } from "sonner";
import { Star, Send, Activity } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function SurveyPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    respondent_name: "",
    location: "",
    q1_speed: 0,
    q2_stability: 0,
    q3_latency: 0,
    q4_availability: 0,
    q5_satisfaction: 0,
    comment: "",
  });

  const { data: surveys } = useQuery({
    queryKey: ["surveys"],
    queryFn: api.getSurveys,
  });

  const mutation = useMutation({
    mutationFn: api.submitSurvey,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["surveys"] });
      toast.success(`${data.message} (Rata-rata: ${data.avg_score})`);
      setForm({ respondent_name: "", location: "", q1_speed: 0, q2_stability: 0, q3_latency: 0, q4_availability: 0, q5_satisfaction: 0, comment: "" });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { q1_speed, q2_stability, q3_latency, q4_availability, q5_satisfaction } = form;
    if ([q1_speed, q2_stability, q3_latency, q4_availability, q5_satisfaction].some((q) => q < 1 || q > 5)) {
      toast.error("Semua pertanyaan harus diisi (skor 1-5)");
      return;
    }
    mutation.mutate(form);
  };

  const questions = [
    { key: "q1_speed" as const, label: "Kecepatan internet memadai?" },
    { key: "q2_stability" as const, label: "Koneksi stabil?" },
    { key: "q3_latency" as const, label: "Latensi terasa rendah?" },
    { key: "q4_availability" as const, label: "Internet selalu tersedia?" },
    { key: "q5_satisfaction" as const, label: "Kepuasan keseluruhan?" },
  ];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground font-mono">Survey Kepuasan Jaringan</h1>
              <p className="text-sm text-muted-foreground">SCI Monitoring Network</p>
            </div>
          </div>
          <ThemeToggle />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <form onSubmit={handleSubmit} className="card-glass rounded-lg p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Nama Responden</label>
                <input
                  type="text"
                  value={form.respondent_name}
                  onChange={(e) => setForm((f) => ({ ...f, respondent_name: e.target.value }))}
                  placeholder="Nama Anda"
                  className="w-full bg-secondary text-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Lokasi</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  placeholder="Lab Jaringan Lt. 2"
                  className="w-full bg-secondary text-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {questions.map((q) => (
              <div key={q.key}>
                <label className="text-sm text-foreground mb-2 block font-medium">{q.label}</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, [q.key]: score }))}
                      className="p-1 transition-colors"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          score <= form[q.key] ? "text-warning fill-warning" : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs text-muted-foreground ml-2 self-center font-mono">
                    {form[q.key] > 0 ? form[q.key] : "—"}
                  </span>
                </div>
              </div>
            ))}

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Komentar</label>
              <textarea
                value={form.comment}
                onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
                rows={3}
                placeholder="Saran atau masukan..."
                className="w-full bg-secondary text-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 w-full justify-center"
            >
              <Send className="h-4 w-4" />
              Kirim Survey
            </button>
          </form>

          <div className="card-glass rounded-lg p-6">
            <h2 className="text-sm font-semibold text-foreground mb-4">Riwayat Survey ({surveys?.length || 0})</h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {surveys?.map((s) => (
                <div key={s.id} className="bg-secondary/50 rounded-md p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{s.respondent_name || "Anonim"}</span>
                    <span className="font-mono text-xs text-primary font-semibold">{s.avg_score?.toFixed(1)} ★</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{s.location || "—"}</p>
                  {s.comment && <p className="text-xs text-muted-foreground mt-1 italic">"{s.comment}"</p>}
                  <p className="text-xs text-muted-foreground mt-1 font-mono">
                    {new Date(s.created_at).toLocaleString("id-ID")}
                  </p>
                </div>
              ))}
              {(!surveys || surveys.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">Belum ada survey.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
