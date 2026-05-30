import { useState } from "react";
import { useListDevices, useGetFeedbackStats, useGetMe, useHealthCheck, getHealthCheckQueryKey, getListDevicesQueryKey, getGetFeedbackStatsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Monitor, MessageSquare, Activity, ShieldCheck, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: me } = useGetMe();
  const { data: health, isLoading: isHealthLoading } = useHealthCheck();
  const { data: devicesData, isLoading: isDevicesLoading } = useListDevices({ limit: 5 });
  const { data: feedbackStatsData, isLoading: isFeedbackLoading } = useGetFeedbackStats();

  const devices = devicesData?.data || [];
  const feedbackStats = feedbackStatsData?.data;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            {isHealthLoading ? (
              <Skeleton className="h-4 w-4 rounded-full" />
            ) : health?.status === "ok" ? (
              <ShieldCheck className="h-4 w-4 text-green-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-destructive" />
            )}
          </CardHeader>
          <CardContent>
            {isHealthLoading ? (
              <Skeleton className="h-8 w-16 mb-1" />
            ) : (
              <div className="text-2xl font-bold uppercase">{health?.status || "Unknown"}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">API Backend</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isDevicesLoading ? (
              <Skeleton className="h-8 w-16 mb-1" />
            ) : (
              <div className="text-2xl font-bold">{devicesData?.total || 0}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Monitored assets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Feedback</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isFeedbackLoading ? (
              <Skeleton className="h-8 w-16 mb-1" />
            ) : (
              <div className="text-2xl font-bold">{feedbackStats?.open || 0}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Awaiting response</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
            <Activity className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            {isFeedbackLoading ? (
              <Skeleton className="h-8 w-16 mb-1" />
            ) : (
              <div className="text-2xl font-bold">{feedbackStats?.by_priority?.critical || 0}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Requires immediate attention</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Devices</CardTitle>
            <CardDescription>Latest assets added to monitoring</CardDescription>
          </CardHeader>
          <CardContent>
            {isDevicesLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : devices.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No devices found</p>
            ) : (
              <div className="space-y-4">
                {devices.map((device) => (
                  <div key={device.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                    <div>
                      <div className="font-medium">{device.name}</div>
                      <div className="text-xs text-muted-foreground">{device.ip_address}</div>
                    </div>
                    <div className="text-sm capitalize px-2 py-1 rounded bg-secondary">{device.type}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Feedback Overview</CardTitle>
            <CardDescription>Distribution by category</CardDescription>
          </CardHeader>
          <CardContent>
            {isFeedbackLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <div className="space-y-4">
                {Object.entries(feedbackStats?.by_category || {}).map(([category, count]) => (
                  <div key={category} className="flex items-center">
                    <div className="w-24 text-sm capitalize">{category}</div>
                    <div className="flex-1 ml-4">
                      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary" 
                          style={{ width: `${feedbackStats?.total ? (Number(count) / feedbackStats.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-8 text-right text-sm ml-4">{Number(count)}</div>
                  </div>
                ))}
                {!feedbackStats?.total && (
                  <p className="text-sm text-muted-foreground text-center py-4">No feedback data</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
