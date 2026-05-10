import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  LogIn,
  ClipboardList,
  ArrowRight,
  Activity,
  Database,
  Server,
  Cpu,
  Bell,
  Radio,
  ShieldCheck,
  LineChart,
  Network,
  Download,
  Info,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NetworkBackground } from "@/components/NetworkBackground";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const flowSteps = [
  {
    icon: ShieldCheck,
    title: "Login & Autentikasi",
    desc: "User login melalui halaman login. Backend memverifikasi kredensial ke MySQL lalu menerbitkan session/JWT token.",
    color: "text-primary",
  },
  {
    icon: Activity,
    title: "Dashboard Monitoring",
    desc: "Setelah autentikasi berhasil, user diarahkan ke dashboard yang menampilkan data monitoring jaringan secara real-time.",
    color: "text-accent",
  },
  {
    icon: Server,
    title: "Backend Golang",
    desc: "Backend (Gin + GORM) menjadi pusat pengolahan data dari berbagai sumber: Ping, TCP, Ruijie API, SNMP, dan Syslog.",
    color: "text-warning",
  },
  {
    icon: Database,
    title: "Penyimpanan Data",
    desc: "Metadata disimpan di MySQL, sedangkan data time-series monitoring diteruskan ke InfluxDB untuk analisis cepat.",
    color: "text-success",
  },
  {
    icon: Cpu,
    title: "Machine Learning Engine",
    desc: "Engine ML mengonsumsi data InfluxDB untuk Anomaly Detection, Prediction, dan Topology Intelligence.",
    color: "text-primary",
  },
  {
    icon: Bell,
    title: "Alert Engine",
    desc: "Hasil ML diteruskan ke Alert Engine yang menentukan kapan notifikasi harus dipicu.",
    color: "text-destructive",
  },
  {
    icon: Radio,
    title: "Realtime SSE / WebSocket",
    desc: "Alert dan update dikirim ke frontend secara real-time melalui SSE atau WebSocket.",
    color: "text-accent",
  },
  {
    icon: LineChart,
    title: "Frontend Dashboard",
    desc: "Dashboard menampilkan metrik, grafik, alert, dan prediksi untuk membantu pengambilan keputusan.",
    color: "text-success",
  },
];

const sources: { name: string; short: string; desc: string; details: string[] }[] = [
  {
    name: "Ping Monitoring",
    short: "ICMP echo untuk cek konektivitas dan latensi target.",
    desc: "Backend mengirim paket ICMP secara berkala ke setiap IP target untuk mengukur latensi (ms), packet loss (%), dan status reachable.",
    details: [
      "Mengirim ICMP echo request setiap interval",
      "Menghitung latency rata-rata, min, max",
      "Mendeteksi packet loss dan timeout",
      "Hasil disimpan ke InfluxDB untuk time-series analysis",
    ],
  },
  {
    name: "TCP Monitoring",
    short: "Cek port TCP layanan untuk memastikan service berjalan.",
    desc: "Melakukan TCP handshake ke port spesifik (80, 443, 22, dsb) untuk memastikan layanan aktif dan responsif.",
    details: [
      "Membuka koneksi TCP ke port target",
      "Mengukur waktu handshake (connect time)",
      "Mendeteksi service down meski host masih reachable",
      "Cocok untuk monitoring web server, database, SSH",
    ],
  },
  {
    name: "Ruijie API",
    short: "Integrasi API perangkat Ruijie untuk metrik level enterprise.",
    desc: "Mengambil data dari controller Ruijie via REST API: status AP, jumlah client, throughput, dan event jaringan.",
    details: [
      "Polling data dari Ruijie Cloud / Controller",
      "Statistik Access Point dan client wireless",
      "Event login/logout dan roaming client",
      "Throughput per SSID dan per device",
    ],
  },
  {
    name: "SNMP",
    short: "Simple Network Management Protocol untuk metrik perangkat.",
    desc: "Mengambil metrik dari router/switch/server menggunakan SNMP v2c/v3: CPU, memory, traffic interface, dan uptime.",
    details: [
      "Polling OID standard (ifInOctets, ifOutOctets, dsb)",
      "Mendukung SNMP v2c dan v3 (auth + encryption)",
      "Metrik CPU, RAM, disk, suhu perangkat",
      "Bandwidth per interface, error rate, discard",
    ],
  },
  {
    name: "Syslog",
    short: "Menerima log perangkat secara real-time via UDP/TCP 514.",
    desc: "Server Syslog menerima pesan log dari perangkat jaringan untuk audit, troubleshooting, dan deteksi anomali.",
    details: [
      "Listener UDP/TCP pada port 514",
      "Parsing severity level (emergency → debug)",
      "Korelasi event dengan ML Engine",
      "Disimpan untuk forensic & audit trail",
    ],
  },
  {
    name: "MySQL Metadata",
    short: "Database metadata untuk konfigurasi target dan user.",
    desc: "MySQL menyimpan metadata: daftar IP target, user admin, konfigurasi alert, dan threshold monitoring.",
    details: [
      "Tabel users, targets, alerts, thresholds",
      "Diakses backend Golang via GORM",
      "Sumber kebenaran untuk konfigurasi sistem",
      "Bukan untuk data time-series (itu di InfluxDB)",
    ],
  },
];

type SourceItem = (typeof sources)[number];

export default function LandingPage() {
  const [activeSource, setActiveSource] = useState<SourceItem | null>(null);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) {
      toast.info(
        "Buka menu browser → 'Install app' / 'Add to Home Screen' untuk menginstal. (iOS: Share → Add to Home Screen)"
      );
      return;
    }
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      toast.success("Aplikasi berhasil diinstal!");
      setIsInstalled(true);
    }
    setInstallPrompt(null);
  };

  return (
    <div className="min-h-screen bg-background relative">
      <NetworkBackground />

      <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-8 py-8 space-y-12">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logos.webp" alt="SCI Logo" className="h-10 w-10 animate-heartbeat" />
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground font-mono">SCI Monitoring Network</h1>
              <p className="text-xs md:text-sm text-muted-foreground">Sistem monitoring jaringan cerdas berbasis ML</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isInstalled && (
              <button
                onClick={handleInstall}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-3 py-2 rounded-md text-xs font-medium hover:opacity-90 transition-opacity"
              >
                <Download className="h-3.5 w-3.5" />
                Install App
              </button>
            )}
            <ThemeToggle />
          </div>
        </header>

        {/* Hero */}
        <section className="card-glass rounded-xl p-6 md:p-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-mono">
            <Network className="h-3 w-3" /> Arsitektur Sistem
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Monitoring Jaringan Real-time dengan Kecerdasan Buatan
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
            Halaman ini menjelaskan alur kerja sistem mulai dari autentikasi user, pengumpulan data dari berbagai
            sumber, pemrosesan oleh Machine Learning Engine, hingga visualisasi real-time di dashboard.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/survey"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <ClipboardList className="h-4 w-4" />
              Isi Survey Kepuasan
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-5 py-2.5 rounded-md text-sm font-medium hover:bg-secondary/80 transition-colors border border-border"
            >
              <LogIn className="h-4 w-4" />
              Login Admin
            </Link>
          </div>
        </section>

        {/* Flowchart */}
        <section className="space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-2xl font-bold text-foreground">Flowchart Alur Sistem</h3>
            <p className="text-sm text-muted-foreground">Tahap demi tahap data mengalir di dalam sistem</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {flowSteps.map((s, i) => (
              <div
                key={s.title}
                className="card-glass rounded-lg p-5 flex gap-4 hover:border-primary/40 transition-colors"
              >
                <div className="flex flex-col items-center">
                  <div className={`h-10 w-10 rounded-full bg-secondary flex items-center justify-center ${s.color}`}>
                    <s.icon className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground mt-1">STEP {i + 1}</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground text-sm mb-1">{s.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Data Sources */}
        <section className="card-glass rounded-xl p-6 md:p-8 space-y-4">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Sumber Data Monitoring</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Backend Golang mengumpulkan data dari berbagai sumber berikut sebelum diteruskan ke InfluxDB dan ML
            Engine.
          </p>
          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
            {sources.map((src) => (
              <button
                key={src.name}
                onClick={() => setActiveSource(src)}
                className="group text-left text-xs px-3 py-3 rounded-lg bg-secondary border border-border hover:border-primary/60 hover:bg-secondary/80 transition-colors flex items-start gap-2"
              >
                <Info className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                <div>
                  <p className="font-mono font-semibold text-foreground">{src.name}</p>
                  <p className="text-muted-foreground text-[11px] mt-0.5">{src.short}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="card-glass rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Bantu kami meningkatkan kualitas jaringan</h3>
            <p className="text-sm text-muted-foreground">
              Isi survey kepuasan agar data Anda dapat dianalisis bersama metrik monitoring real-time.
            </p>
          </div>
          <Link
            to="/survey"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            Mulai Survey <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        <footer className="text-center text-xs text-muted-foreground py-4">
          © {new Date().getFullYear()} SCI Monitoring Network
        </footer>
      </div>

      <Dialog open={!!activeSource} onOpenChange={(o) => !o && setActiveSource(null)}>
        <DialogContent className="max-w-md">
          {activeSource && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  {activeSource.name}
                </DialogTitle>
                <DialogDescription>{activeSource.desc}</DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Detail</p>
                <ul className="space-y-1.5">
                  {activeSource.details.map((d) => (
                    <li key={d} className="text-sm text-muted-foreground flex gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}