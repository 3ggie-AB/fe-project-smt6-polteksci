import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Activity, Monitor, Users, MessageSquare, Shield, ArrowRight, Server, Zap } from "lucide-react";

export default function Landing() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-black text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-background/20 pointer-events-none" />
          <div className="container px-4 md:px-6 relative z-10 mx-auto">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Command Center for IT Operations
                  </h1>
                  <p className="max-w-[600px] text-zinc-400 md:text-xl">
                    Precise, informative, and trustworthy. Monitor devices, manage users, track feedback, and view network health in real-time.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/login">
                    <Button size="lg" className="gap-2">
                      Enter Dashboard <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="lg" variant="outline" className="text-black bg-white hover:bg-zinc-200">
                      Request Access
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="mx-auto flex w-full items-center justify-center lg:justify-end">
                <div className="relative w-full max-w-[500px] aspect-video rounded-xl border border-white/10 bg-black/50 shadow-2xl overflow-hidden backdrop-blur">
                  <div className="absolute top-0 left-0 w-full h-8 bg-zinc-900 border-b border-white/10 flex items-center px-4 gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="p-6 pt-12 flex flex-col gap-4">
                    <div className="flex gap-4">
                      <div className="h-24 w-1/3 bg-primary/20 rounded border border-primary/30 flex items-center justify-center">
                        <Activity className="h-8 w-8 text-primary" />
                      </div>
                      <div className="h-24 w-1/3 bg-zinc-800/50 rounded border border-white/5 flex items-center justify-center">
                        <Server className="h-8 w-8 text-zinc-400" />
                      </div>
                      <div className="h-24 w-1/3 bg-zinc-800/50 rounded border border-white/5 flex items-center justify-center">
                        <Zap className="h-8 w-8 text-yellow-500/50" />
                      </div>
                    </div>
                    <div className="h-32 w-full bg-zinc-800/30 rounded border border-white/5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-zinc-50 dark:bg-zinc-950">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-zinc-200 dark:bg-zinc-800 px-3 py-1 text-sm">
                  Core Capabilities
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Everything you expect in a cockpit.</h2>
                <p className="max-w-[900px] text-zinc-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  NetMonitor is built for density and speed. Zero ambiguity.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <ul className="grid gap-6">
                  <li>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        <Monitor className="h-5 w-5 text-primary" /> Device Monitoring
                      </h3>
                      <p className="text-zinc-500 dark:text-zinc-400">
                        Track servers, switches, and routers. Live ping, SNMP data, and history charts.
                      </p>
                    </div>
                  </li>
                  <li>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" /> User Management
                      </h3>
                      <p className="text-zinc-500 dark:text-zinc-400">
                        Control access with fine-grained roles and permissions across departments.
                      </p>
                    </div>
                  </li>
                  <li>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-primary" /> Feedback Tracking
                      </h3>
                      <p className="text-zinc-500 dark:text-zinc-400">
                        Handle IT tickets, incidents, and suggestions natively within the dashboard.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="flex items-center justify-center">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-4">
                    <div className="h-32 w-full rounded-xl bg-zinc-200 dark:bg-zinc-800 p-4 border flex flex-col justify-between">
                      <Monitor className="h-6 w-6 text-zinc-500" />
                      <div className="text-2xl font-bold">1,248</div>
                      <div className="text-xs text-zinc-500">Active Devices</div>
                    </div>
                    <div className="h-40 w-full rounded-xl bg-primary/10 p-4 border border-primary/20 flex flex-col justify-between">
                      <Activity className="h-6 w-6 text-primary" />
                      <div className="text-2xl font-bold text-primary">99.9%</div>
                      <div className="text-xs text-primary/80">Network Uptime</div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4 mt-8">
                    <div className="h-40 w-full rounded-xl bg-zinc-200 dark:bg-zinc-800 p-4 border flex flex-col justify-between">
                      <Shield className="h-6 w-6 text-zinc-500" />
                      <div className="text-2xl font-bold">24</div>
                      <div className="text-xs text-zinc-500">Security Policies</div>
                    </div>
                    <div className="h-32 w-full rounded-xl bg-zinc-200 dark:bg-zinc-800 p-4 border flex flex-col justify-between">
                      <Users className="h-6 w-6 text-zinc-500" />
                      <div className="text-2xl font-bold">86</div>
                      <div className="text-xs text-zinc-500">Active Users</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">© 2024 NetMonitor IT Systems. All rights reserved.</p>
      </footer>
    </div>
  );
}
