import { useEffect, useState } from "react";
import { createStreamUrl, getAuthToken, RealtimeEvent } from "@/lib/api";

const STREAM_EVENT_TYPES = [
  "ap.down",
  "latency.high",
  "packet_loss.high",
  "tcp.service_down",
  "anomaly.detected",
  "syslog.alert",
];

export type StreamStatus = "connecting" | "open" | "error" | "closed";

export function useRealtimeEvents(maxEvents = 50) {
  const [events, setEvents] = useState<RealtimeEvent[]>([]);
  const [status, setStatus] = useState<StreamStatus>("connecting");
  const [error, setError] = useState<string | null>(null);
  const [lastHeartbeat, setLastHeartbeat] = useState<string | null>(null);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setStatus("closed");
      setError("Token tidak tersedia");
      return undefined;
    }

    const stream = new EventSource(createStreamUrl(token));
    const handleEvent = (message: MessageEvent) => {
      try {
        const payload = JSON.parse(message.data) as RealtimeEvent;
        setEvents((current) => [payload, ...current].slice(0, maxEvents));
      } catch {
        setError("Event realtime tidak bisa diparse");
      }
    };
    const handleHeartbeat = (message: MessageEvent) => {
      try {
        const payload = JSON.parse(message.data) as { ts?: string };
        setLastHeartbeat(payload.ts || new Date().toISOString());
      } catch {
        setLastHeartbeat(new Date().toISOString());
      }
    };

    stream.onopen = () => {
      setStatus("open");
      setError(null);
    };
    stream.onerror = () => {
      setStatus("error");
      setError("Koneksi realtime terputus, browser akan mencoba reconnect");
    };
    stream.onmessage = handleEvent;
    stream.addEventListener("heartbeat", handleHeartbeat);
    STREAM_EVENT_TYPES.forEach((type) => stream.addEventListener(type, handleEvent));

    return () => {
      stream.removeEventListener("heartbeat", handleHeartbeat);
      STREAM_EVENT_TYPES.forEach((type) => stream.removeEventListener(type, handleEvent));
      stream.close();
      setStatus("closed");
    };
  }, [maxEvents]);

  return {
    events,
    status,
    error,
    lastHeartbeat,
    clearEvents: () => setEvents([]),
  };
}
