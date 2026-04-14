const BASE_URL = "http://localhost:8080/api";

// Token management — token is the single source of truth
let authToken: string | null = sessionStorage.getItem("scimonitor_token");

export function setAuthToken(token: string) {
  authToken = token;
  sessionStorage.setItem("scimonitor_token", token);
}

export function getAuthToken() {
  return authToken;
}

export function isAuthenticated() {
  return !!getAuthToken();
}

export function clearAuthToken() {
  authToken = null;
  sessionStorage.removeItem("scimonitor_token");
}

async function request<T>(path: string, options?: RequestInit & { noAuth?: boolean }): Promise<T> {
  const { noAuth, ...fetchOptions } = options || {};
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (!noAuth && authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...fetchOptions,
    headers,
  });

  if (res.status === 401) {
    clearAuthToken();
    window.location.href = "/login";
    throw new Error("Sesi habis, silakan login kembali");
  }

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

export interface LoginResponse {
  token: string;
}

// API functions
export const api = {
  // Auth (no token needed)
  login: (password: string) =>
    request<LoginResponse>("/login", {
      method: "POST",
      body: JSON.stringify({ password }),
      noAuth: true,
    }),

  // Targets (protected)
  getTargets: () => request<Target[]>("/targets"),
  addTarget: (data: { ip_address: string; label?: string }) =>
    request<Target>("/targets", { method: "POST", body: JSON.stringify(data) }),
  deleteTarget: (id: number) =>
    request<{ message: string }>(`/targets/${id}`, { method: "DELETE" }),

  // Pings (protected)
  getLatestPings: () => request<PingResult[]>("/pings/latest"),
  getPingHistory: (params?: { ip?: string; hours?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.ip) searchParams.set("ip", params.ip);
    if (params?.hours) searchParams.set("hours", String(params.hours));
    const qs = searchParams.toString();
    return request<PingResult[]>(`/pings/history${qs ? `?${qs}` : ""}`);
  },
  getPingSummary: () => request<PingSummary[]>("/pings/summary"),

  // Surveys - submit is public (no auth)
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
    noAuth: true,
  }),
  // Surveys list (protected)
  getSurveys: () => request<Survey[]>("/surveys"),

  // Correlation (protected)
  getCorrelation: (days?: number) => {
    const qs = days ? `?days=${days}` : "";
    return request<CorrelationResponse>(`/correlation${qs}`);
  },
};
