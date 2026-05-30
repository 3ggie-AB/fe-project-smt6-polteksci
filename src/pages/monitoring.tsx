import { useState } from "react";
import { usePingCustom, useListOids, useSnmpDevice } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity, Terminal, Radio } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Monitoring() {
  const [ip, setIp] = useState("");
  const [count, setCount] = useState("4");
  const [pingResult, setPingResult] = useState<any>(null);
  
  const { toast } = useToast();
  const pingMutation = usePingCustom();

  const handlePing = () => {
    if (!ip) {
      toast({ variant: "destructive", title: "IP Address required" });
      return;
    }
    
    setPingResult(null);
    pingMutation.mutate({ data: { ip_address: ip, count: parseInt(count) || 4 } }, {
      onSuccess: (res) => {
        setPingResult(res.data);
      },
      onError: (err: any) => {
        toast({ variant: "destructive", title: "Ping failed", description: err.message });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5 text-primary" /> Custom Ping Tool
            </CardTitle>
            <CardDescription>Test connectivity to any IP or hostname instantly</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="space-y-2 flex-1">
                <Label>Target IP / Hostname</Label>
                <Input placeholder="8.8.8.8" value={ip} onChange={(e) => setIp(e.target.value)} />
              </div>
              <div className="space-y-2 w-24">
                <Label>Count</Label>
                <Input type="number" min="1" max="10" value={count} onChange={(e) => setCount(e.target.value)} />
              </div>
            </div>
            <Button className="w-full gap-2" onClick={handlePing} disabled={pingMutation.isPending}>
              <Activity className="h-4 w-4" /> {pingMutation.isPending ? "Executing Ping..." : "Execute Ping"}
            </Button>

            {pingResult && (
              <div className="mt-6 bg-zinc-950 text-zinc-50 p-4 rounded-md font-mono text-sm overflow-x-auto whitespace-pre-wrap">
                <div>PING {pingResult.ip_address}</div>
                <div>Packets: Sent = {pingResult.packets_sent}, Received = {pingResult.packets_received}, Lost = {pingResult.packet_loss}%</div>
                {pingResult.avg_rtt_ms !== undefined && (
                  <div>Round trip: Minimum = {pingResult.min_rtt_ms}ms, Maximum = {pingResult.max_rtt_ms}ms, Average = {pingResult.avg_rtt_ms}ms</div>
                )}
                <div className={`mt-2 ${pingResult.status === 'online' ? 'text-green-400' : 'text-red-400'}`}>
                  Status: {pingResult.status.toUpperCase()}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radio className="h-5 w-5 text-blue-500" /> OID Reference Browser
            </CardTitle>
            <CardDescription>Common SNMP Object Identifiers</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="border rounded-md overflow-hidden bg-muted/30">
               <div className="p-3 border-b bg-muted/50 font-medium text-sm flex gap-4">
                 <div className="w-1/3">Name</div>
                 <div className="w-2/3 font-mono">OID</div>
               </div>
               <div className="max-h-[300px] overflow-y-auto">
                 {/* Standard OIDs as placeholder since listOids might be empty initially */}
                 {[
                   { name: "System Description", oid: "1.3.6.1.2.1.1.1.0" },
                   { name: "System Uptime", oid: "1.3.6.1.2.1.1.3.0" },
                   { name: "System Name", oid: "1.3.6.1.2.1.1.5.0" },
                   { name: "CPU Load (Cisco)", oid: "1.3.6.1.4.1.9.9.109.1.1.1.1.3" },
                   { name: "Memory Usage", oid: "1.3.6.1.4.1.2021.4.6.0" },
                 ].map((oid, i) => (
                   <div key={i} className="p-3 border-b last:border-0 text-sm flex gap-4 hover:bg-muted/50">
                     <div className="w-1/3 text-muted-foreground">{oid.name}</div>
                     <div className="w-2/3 font-mono text-xs">{oid.oid}</div>
                   </div>
                 ))}
               </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}