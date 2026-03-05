const BASE_URL = "http://localhost:8080/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

// Types
export interface Target {
  id: number;
  ip_address: string;
  label: string;
  is_active: boolean;
  created_at: string;
}

export interface PingResult {
  id: number;
  ip_address: string;
  label: string;
  is_reachable: boolean;
  latency_ms: number;
  packet_loss: number;
  created_at: string;
}

export interface PingSummary {
  ip_address: string;
  label: string;
  total_pings: number;
  reachable_pings: number;
  uptime_percent: number;
  avg_latency_ms: number;
  last_seen: string;
  last_status: boolean;
}

export interface Survey {
  id: number;
  respondent_name: string;
  location: string;
  q1_speed: number;
  q2_stability: number;
  q3_latency: number;
  q4_availability: number;
  q5_satisfaction: number;
  comment: string;
  avg_score?: number;
  created_at: string;
}

export interface CorrelationData {
  date: string;
  avg_latency: number;
  avg_packet_loss: number;
  uptime_percent: number;
  avg_satisfaction: number;
  survey_count: number;
}

export interface CorrelationResponse {
  period_days: number;
  data: CorrelationData[];
  correlations: {
    latency_vs_satisfaction: number;
    uptime_vs_satisfaction: number;
    packetloss_vs_satisfaction: number;
  };
  interpretation: {
    latency: string;
    uptime: string;
    packetloss: string;
  };
}

// API functions
export const api = {
  // Targets
  getTargets: () => request<Target[]>("/targets"),
  addTarget: (data: { ip_address: string; label?: string }) =>
    request<Target>("/targets", { method: "POST", body: JSON.stringify(data) }),
  deleteTarget: (id: number) =>
    request<{ message: string }>(`/targets/${id}`, { method: "DELETE" }),

  // Pings
  getLatestPings: () => request<PingResult[]>("/pings/latest"),
  getPingHistory: (params?: { ip?: string; hours?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.ip) searchParams.set("ip", params.ip);
    if (params?.hours) searchParams.set("hours", String(params.hours));
    const qs = searchParams.toString();
    return request<PingResult[]>(`/pings/history${qs ? `?${qs}` : ""}`);
  },
  getPingSummary: () => request<PingSummary[]>("/pings/summary"),

  // Surveys
  submitSurvey: (data: {
    respondent_name?: string;
    location?: string;
    q1_speed: number;
    q2_stability: number;
    q3_latency: number;
    q4_availability: number;
    q5_satisfaction: number;
    comment?: string;
  }) => request<{ message: string; avg_score: number; survey: Survey }>("/surveys", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  getSurveys: () => request<Survey[]>("/surveys"),

  // Correlation
  getCorrelation: (days?: number) => {
    const qs = days ? `?days=${days}` : "";
    return request<CorrelationResponse>(`/correlation${qs}`);
  },
};
