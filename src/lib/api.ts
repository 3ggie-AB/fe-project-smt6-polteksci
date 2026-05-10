const configuredBaseUrl =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:8080";

export const API_BASE_URL = configuredBaseUrl.endsWith("/api")
  ? configuredBaseUrl
  : `${configuredBaseUrl}/api`;
export const API_ORIGIN = API_BASE_URL.replace(/\/api$/, "");

const TOKEN_KEY = "netmonitor_token";
const USER_KEY = "netmonitor_user";
const LEGACY_TOKEN_KEY = "scimonitor_token";

let authToken: string | null =
  sessionStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(LEGACY_TOKEN_KEY);

type RequestOptions = RequestInit & {
  noAuth?: boolean;
  root?: boolean;
};

export type RoleName = "SUPER_ADMIN" | "ADMIN" | "USER";
export type Severity = "critical" | "warning" | "info" | "error" | string;

export interface Workspace {
  id: number;
  name: string;
  slug: string;
  created_at?: string;
  updated_at?: string;
}

export interface Role {
  id: number;
  name: RoleName;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: number;
  workspace_id: number;
  workspace?: Workspace;
  role_id: number;
  role?: Role;
  email: string;
  name: string;
  avatar_url?: string;
  is_active: boolean;
  last_login_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface LoginRequest {
  email?: string;
  password: string;
}

export interface LoginResponse {
  message?: string;
  token: string;
  user: User;
}

export interface Identity {
  user_id: number;
  email: string;
  role: RoleName;
  workspace_id: number;
}

export interface HealthResponse {
  status: string;
  time: string;
  checks: {
    mysql?: {
      status: string;
      database?: string;
      error?: string;
    };
    influxdb?: {
      status: string;
      url?: string;
      bucket?: string;
      error?: string;
    };
    collectors?: {
      active?: string;
      ruijie?: string;
      syslog?: string;
      snmp?: string;
    };
  };
}

export interface ApiInfo {
  name: string;
  description: string;
  status: string;
  endpoints: Record<string, string>;
}

export interface Device {
  id: number;
  workspace_id: number;
  workspace?: Workspace;
  name: string;
  ip_address: string;
  mac_address?: string;
  vendor?: string;
  model?: string;
  location?: string;
  device_type?: string;
  snmp_version?: string;
  ruijie_external_id?: string;
  is_active: boolean;
  last_seen_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DevicePayload {
  name: string;
  ip_address: string;
  mac_address?: string;
  vendor?: string;
  model?: string;
  location?: string;
  device_type?: string;
  snmp_community?: string;
  snmp_version?: string;
  ruijie_external_id?: string;
  is_active?: boolean;
}

export type MonitoringCheckType = "ping" | "tcp" | "http" | "url" | "server" | string;

export interface MonitoringTarget {
  id: number;
  workspace_id: number;
  name: string;
  host: string;
  check_type: MonitoringCheckType;
  port: number;
  interval_sec: number;
  timeout_sec: number;
  description?: string;
  is_active: boolean;
  last_status?: boolean | null;
  created_at?: string;
  updated_at?: string;
}

export interface MonitoringTargetPayload {
  name: string;
  host: string;
  check_type: MonitoringCheckType;
  port?: number;
  interval_sec?: number;
  timeout_sec?: number;
  description?: string;
  is_active?: boolean;
}

export interface Notification {
  id: number;
  workspace_id: number;
  user_id: number | null;
  device_id: number | null;
  target_id?: number | null;
  type: string;
  severity: Severity;
  title: string;
  message: string;
  read_at: string | null;
  created_at: string;
}

export interface RealtimeEvent {
  type: string;
  severity: Severity;
  workspace: string;
  device_id?: number;
  target_id?: number;
  ip?: string;
  title: string;
  message: string;
  attributes?: Record<string, unknown>;
  occurred_at: string;
}

export interface FeatureVector {
  device_id?: number;
  target_id?: number;
  workspace: string;
  latency_rolling_avg_ms?: number;
  packet_loss_ratio?: number;
  ap_load_score?: number;
  roaming_frequency?: number;
  traffic_anomaly_score?: number;
  timestamp: string;
}

export interface FeatureResponse {
  features: FeatureVector;
  onnx_input: number[];
}

export function setAuthToken(token: string) {
  authToken = token;
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.removeItem(LEGACY_TOKEN_KEY);
}

export function setAuthSession(token: string, user?: User) {
  setAuthToken(token);
  if (user) {
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function getAuthToken() {
  return authToken;
}

export function getStoredUser(): User | null {
  const raw = sessionStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    sessionStorage.removeItem(USER_KEY);
    return null;
  }
}

export function isAuthenticated() {
  return !!getAuthToken();
}

export function clearAuthToken() {
  authToken = null;
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(LEGACY_TOKEN_KEY);
}

function endpoint(path: string, root?: boolean) {
  if (path.startsWith("http")) return path;
  const base = root ? API_ORIGIN : API_BASE_URL;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

async function request<T>(path: string, options?: RequestOptions): Promise<T> {
  const { noAuth, root, ...fetchOptions } = options || {};
  const headers: Record<string, string> = {
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (fetchOptions.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (!noAuth && authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const res = await fetch(endpoint(path, root), {
    ...fetchOptions,
    headers,
  });

  if (res.status === 401 && !noAuth) {
    clearAuthToken();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Sesi habis, silakan login kembali");
  }

  const text = await res.text();
  let data: unknown;
  try {
    data = text ? JSON.parse(text) : undefined;
  } catch {
    data = text ? { message: text } : undefined;
  }

  if (!res.ok) {
    const errorPayload = data as { error?: string; message?: string } | undefined;
    throw new Error(errorPayload?.error || errorPayload?.message || res.statusText);
  }

  return data as T;
}

export function createStreamUrl(token = authToken) {
  const url = new URL(`${API_BASE_URL}/stream`);
  if (token) {
    url.searchParams.set("access_token", token);
  }
  return url.toString();
}

export const api = {
  getInfo: () => request<ApiInfo>("/", { root: true, noAuth: true }),
  getHealth: () => request<HealthResponse>("/healthz", { root: true, noAuth: true }),

  login: (data: LoginRequest) =>
    request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
      noAuth: true,
    }),
  loginCompat: (data: LoginRequest) =>
    request<LoginResponse>("/login", {
      method: "POST",
      body: JSON.stringify(data),
      noAuth: true,
    }),
  me: () => request<Identity>("/me"),

  getDevices: () => request<Device[]>("/devices"),
  addDevice: (data: DevicePayload) =>
    request<Device>("/devices", { method: "POST", body: JSON.stringify(data) }),
  deleteDevice: (id: number) =>
    request<{ message: string }>(`/devices/${id}`, { method: "DELETE" }),

  getMonitoringTargets: () => request<MonitoringTarget[]>("/targets"),
  addMonitoringTarget: (data: MonitoringTargetPayload) =>
    request<MonitoringTarget>("/targets", { method: "POST", body: JSON.stringify(data) }),
  deleteMonitoringTarget: (id: number) =>
    request<{ message: string }>(`/targets/${id}`, { method: "DELETE" }),

  getNotifications: () => request<Notification[]>("/notifications"),
  markNotificationRead: (id: number) =>
    request<{ message: string }>(`/notifications/${id}/read`, { method: "POST" }),

  getDeviceFeatureVector: (deviceId: number) =>
    request<FeatureResponse>(`/ml/features/${deviceId}`),
  getTargetFeatureVector: (targetId: number) =>
    request<FeatureResponse>(`/ml/features/targets/${targetId}`),

  getFeatureVector: (deviceId: number) =>
    request<FeatureResponse>(`/ml/features/${deviceId}`),

  // Compatibility methods for the earlier SCI prototype pages.
  loginWithPasswordOnly: (password: string) =>
    request<LoginResponse>("/login", {
      method: "POST",
      body: JSON.stringify({ password }),
      noAuth: true,
    }),
  getTargets: () => request<MonitoringTarget[]>("/targets"),
  addTarget: (data: MonitoringTargetPayload) =>
    request<MonitoringTarget>("/targets", { method: "POST", body: JSON.stringify(data) }),
  deleteTarget: (id: number) =>
    request<{ message: string }>(`/targets/${id}`, { method: "DELETE" }),
  getLatestPings: () => request<PingResult[]>("/pings/latest"),
  getPingHistory: (params?: { ip?: string; hours?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.ip) searchParams.set("ip", params.ip);
    if (params?.hours) searchParams.set("hours", String(params.hours));
    const qs = searchParams.toString();
    return request<PingResult[]>(`/pings/history${qs ? `?${qs}` : ""}`);
  },
  getPingSummary: () => request<PingSummary[]>("/pings/summary"),
  submitSurvey: (data: SurveyPayload) =>
    request<{ message: string; avg_score: number; survey: Survey }>("/surveys", {
      method: "POST",
      body: JSON.stringify(data),
      noAuth: true,
    }),
  getSurveys: () => request<Survey[]>("/surveys"),
  getCorrelation: (days?: number) => {
    const qs = days ? `?days=${days}` : "";
    return request<CorrelationResponse>(`/correlation${qs}`);
  },
};

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

export interface SurveyPayload {
  respondent_name?: string;
  location?: string;
  q1_speed: number;
  q2_stability: number;
  q3_latency: number;
  q4_availability: number;
  q5_satisfaction: number;
  comment?: string;
}

export interface Survey extends SurveyPayload {
  id: number;
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
