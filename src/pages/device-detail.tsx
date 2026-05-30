import { useRoute } from "wouter";
import { useGetDevice, usePingDevice, useGetPingHistory, useGetSnmpHistory, getGetDeviceQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Activity, Radio, AlertTriangle, MonitorPlay, Server, Clock } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function DeviceDetail() {
  const [, params] = useRoute("/devices/:id");
  const routeParams = params as { id?: string } | null;
  const deviceId = Number.parseInt(routeParams?.id ?? "0", 10);
  const { toast } = useToast();

  const { data: deviceData, isLoading: isDeviceLoading } = useGetDevice(deviceId, {
    query: { enabled: !!deviceId, queryKey: getGetDeviceQueryKey(deviceId) }
  });

  const { data: pingHistory, isLoading: isHistoryLoading } = useGetPingHistory(deviceId);
  const { data: snmpHistory } = useGetSnmpHistory(deviceId);
  const pingMutation = usePingDevice();

  const device = deviceData?.data;

  const handleLivePing = () => {
    pingMutation.mutate({ id: deviceId, data: { count: 4 } }, {
      onSuccess: (res) => {
        toast({
          title: "Ping completed",
          description: `Average RTT: ${res.data?.avg_rtt_ms}ms, Packet Loss: ${res.data?.packet_loss}%`,
        });
      },
      onError: (err: any) => {
        toast({ variant: "destructive", title: "Ping failed", description: err.message });
      }
    });
  };

  const chartData = pingHistory?.data?.map(p => ({
    time: p.status, // placeholder, usually has timestamp but we use what we have or generate sequential
    rtt: p.avg_rtt_ms || 0,
    loss: p.packet_loss || 0
  })) || [];

  if (isDeviceLoading) {
    return <div className="space-y-6"><Skeleton className="h-32 w-full" /><Skeleton className="h-64 w-full" /></div>;
  }

  if (!device) {
    return <div>Device not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Server className="h-6 w-6 text-primary" />
            {device.name}
            <Badge variant={device.status === 'online' ? 'default' : 'destructive'} className="ml-2">
              {device.status || 'unknown'}
            </Badge>
          </h2>
          <div className="text-muted-foreground mt-1 flex items-center gap-4">
            <span className="font-mono">{device.ip_address}</span>
            <span>•</span>
            <span className="capitalize">{device.type}</span>
            {device.location && (
              <>
                <span>•</span>
                <span>{device.location}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleLivePing} disabled={pingMutation.isPending} className="gap-2">
            <Activity className="h-4 w-4" />
            {pingMutation.isPending ? "Pinging..." : "Live Ping"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MonitorPlay className="h-5 w-5" /> Latency History
            </CardTitle>
            <CardDescription>Average round-trip time (ms) over recent pings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {isHistoryLoading ? (
                <Skeleton className="h-full w-full" />
              ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="time" hide />
                    <YAxis />
                    <RechartsTooltip />
                    <Line type="monotone" dataKey="rtt" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No ping history available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radio className="h-5 w-5" /> SNMP Data
            </CardTitle>
            <CardDescription>Latest polled values</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!device.snmp_community ? (
                <div className="flex flex-col items-center justify-center text-center p-4 text-muted-foreground space-y-2 bg-muted/50 rounded-lg border border-dashed">
                  <AlertTriangle className="h-8 w-8 text-yellow-500/50" />
                  <p className="text-sm">SNMP is not configured for this device.</p>
                </div>
              ) : snmpHistory?.data && snmpHistory.data.length > 0 ? (
                <div className="space-y-3">
                  {snmpHistory.data.map((item, i) => (
                    <div key={i} className="flex flex-col gap-1 border-b pb-2 last:border-0 last:pb-0">
                      <span className="text-xs text-muted-foreground font-mono truncate" title={item.oid}>{item.oid}</span>
                      <span className="text-sm font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-sm text-muted-foreground py-8">
                  No SNMP data recorded
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
