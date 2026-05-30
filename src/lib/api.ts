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

type DataEnvelope<T> = {
  data: T;
};

export type RoleName = "SUPER_ADMIN" | "ADMIN" | "USER";
export type DeviceType = "AP" | "SERVICE";
export type DeviceStatusValue = "ONLINE" | "OFFLINE" | "WARNING";
export type AlertSeverity = "INFO" | "WARNING" | "CRITICAL";
export type AlertStatus = "ACTIVE" | "RESOLVED";
export type AnomalySeverity = "WARNING" | "CRITICAL";

export interface Session {
  id: number;
  user_id: number;
  expired_at: string;
  created_at?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: RoleName;
  created_at?: string;
  updated_at?: string;
}

export interface UserPayload {
  name: string;
  email: string;
  password?: string;
  role: RoleName;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message?: string;
  token: string;
  session?: Session;
  user: User;
}

export interface HealthResponse {
  status: string;
  stack: string;
  mysql: {
    host: string;
    port: string;
    database: string;
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
  name: string;
  ip: string;
  type: DeviceType | string;
  vendor?: string;
  location?: string;
  status: DeviceStatusValue | string;
  created_at?: string;
  updated_at?: string;
}

export interface DevicePayload {
  name: string;
  ip: string;
  type: DeviceType | string;
  vendor?: string;
  location?: string;
  status?: DeviceStatusValue | string;
}

export interface MonitoringConfig {
  id: number;
  device_id: number;
  device?: Device;
  ping_enabled: boolean;
  tcp_enabled: boolean;
  ping_interval: number;
  tcp_interval: number;
  monitored_port: number;
  created_at?: string;
  updated_at?: string;
}

export interface MonitoringConfigPayload {
  device_id: number;
  ping_enabled: boolean;
  tcp_enabled: boolean;
  ping_interval: number;
  tcp_interval: number;
  monitored_port: number;
}

export interface DeviceStatus {
  id: number;
  device_id: number;
  device?: Device;
  latency: number;
  packet_loss: number;
  cpu_usage?: number | null;
  memory_usage?: number | null;
  last_seen: string;
  created_at?: string;
  updated_at?: string;
}

export interface DeviceStatusPayload {
  device_id: number;
  latency: number;
  packet_loss: number;
  cpu_usage?: number | null;
  memory_usage?: number | null;
  last_seen: string;
}

export interface Alert {
  id: number;
  device_id: number;
  device?: Device;
  severity: AlertSeverity | string;
  message: string;
  status: AlertStatus | string;
  created_at?: string;
  updated_at?: string;
}

export interface AlertPayload {
  device_id: number;
  severity: AlertSeverity | string;
  message: string;
  status: AlertStatus | string;
}

export interface Notification {
  id: number;
  user_id: number;
  alert_id: number;
  alert?: Alert;
  title: string;
  message: string;
  is_read: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface NotificationPayload {
  user_id: number;
  alert_id: number;
  title: string;
  message: string;
  is_read?: boolean;
}

export interface ActivityLog {
  id: number;
  user_id: number;
  user?: User;
  action: string;
  description: string;
  created_at?: string;
  updated_at?: string;
}

export interface ActivityLogPayload {
  user_id: number;
  action: string;
  description: string;
}

export interface NetworkTopology {
  id: number;
  source_device_id: number;
  target_device_id: number;
  source_device?: Device;
  target_device?: Device;
  relation_type: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface NetworkTopologyPayload {
  source_device_id: number;
  target_device_id: number;
  relation_type: string;
  status: string;
}

export interface MLPrediction {
  id: number;
  device_id: number;
  device?: Device;
  prediction_type: string;
  prediction_value: number;
  confidence_score: number;
  created_at?: string;
  updated_at?: string;
}

export interface MLPredictionPayload {
  device_id: number;
  prediction_type: string;
  prediction_value: number;
  confidence_score: number;
}

export interface MLAnomaly {
  id: number;
  device_id: number;
  device?: Device;
  anomaly_score: number;
  prediction: string;
  severity: AnomalySeverity | string;
  created_at?: string;
  updated_at?: string;
}

export interface MLAnomalyPayload {
  device_id: number;
  anomaly_score: number;
  prediction: string;
  severity: AnomalySeverity | string;
}

export interface RealtimeEvent {
  type: string;
  severity: string;
  workspace?: string;
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
  const headers = new Headers(fetchOptions.headers);

  if (fetchOptions.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (!noAuth && authToken) {
    headers.set("Authorization", `Bearer ${authToken}`);
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
    const errorPayload = data as { error?: string; message?: string; detail?: string } | undefined;
    const message = errorPayload?.error || errorPayload?.message || res.statusText;
    throw new Error(errorPayload?.detail ? `${message}: ${errorPayload.detail}` : message);
  }

  return data as T;
}

function dataRequest<T>(path: string, options?: RequestOptions) {
  return request<DataEnvelope<T>>(path, options).then((response) => response.data);
}

function listRequest<T>(path: string, options?: RequestOptions) {
  return dataRequest<T[]>(path, options);
}

function createCrud<T, TPayload>(resource: string) {
  return {
    list: () => listRequest<T>(resource),
    get: (id: number) => dataRequest<T>(`${resource}/${id}`),
    create: (data: TPayload) =>
      dataRequest<T>(resource, { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Partial<TPayload>) =>
      dataRequest<T>(`${resource}/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    patch: (id: number, data: Partial<TPayload>) =>
      dataRequest<T>(`${resource}/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id: number) => request<{ message: string }>(`${resource}/${id}`, { method: "DELETE" }),
  };
}

function statusToFeature(status?: DeviceStatus): FeatureResponse {
  const latency = status?.latency ?? 0;
  const packetLossRatio = (status?.packet_loss ?? 0) / 100;
  const cpu = status?.cpu_usage ?? 0;
  const memory = status?.memory_usage ?? 0;
  const anomaly = Math.max(packetLossRatio, latency > 0 ? Math.min(latency / 1000, 1) : 0);

  return {
    features: {
      device_id: status?.device_id,
      latency_rolling_avg_ms: latency,
      packet_loss_ratio: packetLossRatio,
      ap_load_score: cpu,
      roaming_frequency: memory,
      traffic_anomaly_score: anomaly,
      timestamp: status?.last_seen || new Date().toISOString(),
    },
    onnx_input: [latency, packetLossRatio, cpu, memory, anomaly],
  };
}

const users = createCrud<User, UserPayload>("/users");
const devices = createCrud<Device, DevicePayload>("/devices");
const monitoringConfigs = createCrud<MonitoringConfig, MonitoringConfigPayload>("/monitoring-configs");
const deviceStatuses = createCrud<DeviceStatus, DeviceStatusPayload>("/device-status");
const alerts = createCrud<Alert, AlertPayload>("/alerts");
const notifications = createCrud<Notification, NotificationPayload>("/notifications");
const activityLogs = createCrud<ActivityLog, ActivityLogPayload>("/activity-logs");
const networkTopology = createCrud<NetworkTopology, NetworkTopologyPayload>("/network-topology");
const mlPredictions = createCrud<MLPrediction, MLPredictionPayload>("/ml-predictions");
const mlAnomalies = createCrud<MLAnomaly, MLAnomalyPayload>("/ml-anomalies");

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
  me: () => dataRequest<User>("/auth/me"),
  logout: () => request<{ message: string }>("/auth/logout", { method: "POST" }),

  getUsers: users.list,
  getUser: users.get,
  addUser: users.create,
  updateUser: users.update,
  patchUser: users.patch,
  deleteUser: users.delete,

  getDevices: devices.list,
  getDevice: devices.get,
  addDevice: devices.create,
  updateDevice: devices.update,
  patchDevice: devices.patch,
  deleteDevice: devices.delete,

  getMonitoringConfigs: monitoringConfigs.list,
  getMonitoringConfig: monitoringConfigs.get,
  addMonitoringConfig: monitoringConfigs.create,
  updateMonitoringConfig: monitoringConfigs.update,
  patchMonitoringConfig: monitoringConfigs.patch,
  deleteMonitoringConfig: monitoringConfigs.delete,

  getDeviceStatuses: deviceStatuses.list,
  getDeviceStatus: deviceStatuses.get,
  addDeviceStatus: deviceStatuses.create,
  updateDeviceStatus: deviceStatuses.update,
  patchDeviceStatus: deviceStatuses.patch,
  deleteDeviceStatus: deviceStatuses.delete,

  getAlerts: alerts.list,
  getAlert: alerts.get,
  addAlert: alerts.create,
  updateAlert: alerts.update,
  patchAlert: alerts.patch,
  deleteAlert: alerts.delete,

  getNotifications: notifications.list,
  getNotification: notifications.get,
  addNotification: notifications.create,
  updateNotification: notifications.update,
  patchNotification: notifications.patch,
  deleteNotification: notifications.delete,
  markNotificationRead: (id: number) => notifications.patch(id, { is_read: true }),

  getActivityLogs: activityLogs.list,
  getActivityLog: activityLogs.get,
  addActivityLog: activityLogs.create,
  updateActivityLog: activityLogs.update,
  patchActivityLog: activityLogs.patch,
  deleteActivityLog: activityLogs.delete,

  getNetworkTopology: networkTopology.list,
  getNetworkTopologyItem: networkTopology.get,
  addNetworkTopology: networkTopology.create,
  updateNetworkTopology: networkTopology.update,
  patchNetworkTopology: networkTopology.patch,
  deleteNetworkTopology: networkTopology.delete,

  getMLPredictions: mlPredictions.list,
  getMLPrediction: mlPredictions.get,
  addMLPrediction: mlPredictions.create,
  updateMLPrediction: mlPredictions.update,
  patchMLPrediction: mlPredictions.patch,
  deleteMLPrediction: mlPredictions.delete,

  getMLAnomalies: mlAnomalies.list,
  getMLAnomaly: mlAnomalies.get,
  addMLAnomaly: mlAnomalies.create,
  updateMLAnomaly: mlAnomalies.update,
  patchMLAnomaly: mlAnomalies.patch,
  deleteMLAnomaly: mlAnomalies.delete,

  // Compatibility shims for older pages/components kept in the project.
  getMonitoringTargets: monitoringConfigs.list,
  addMonitoringTarget: monitoringConfigs.create,
  deleteMonitoringTarget: monitoringConfigs.delete,
  getTargets: async () => {
    const list = await devices.list();
    return list.map((device) => ({
      id: device.id,
      ip_address: device.ip,
      label: device.name,
      is_active: device.status !== "OFFLINE",
      created_at: device.created_at || "",
    }));
  },
  getPingHistory: async (params?: { ip?: string; hours?: number }) => {
    const [statuses, deviceList] = await Promise.all([deviceStatuses.list(), devices.list()]);
    const deviceById = new Map(deviceList.map((device) => [device.id, device]));
    const since = params?.hours ? Date.now() - params.hours * 60 * 60 * 1000 : 0;
    return statuses
      .filter((status) => {
        const device = deviceById.get(status.device_id);
        const time = status.last_seen ? new Date(status.last_seen).getTime() : 0;
        return (!params?.ip || device?.ip === params.ip) && (!since || time >= since);
      })
      .map((status) => {
        const device = deviceById.get(status.device_id);
        return {
          id: status.id,
          ip_address: device?.ip || String(status.device_id),
          label: device?.name || `Device #${status.device_id}`,
          is_reachable: status.packet_loss < 100,
          latency_ms: status.latency,
          packet_loss: status.packet_loss,
          created_at: status.last_seen,
        };
      });
  },
  getDeviceFeatureVector: async (deviceId: number) => {
    const statuses = await deviceStatuses.list();
    const latest = statuses
      .filter((status) => status.device_id === deviceId)
      .sort((a, b) => new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime())[0];
    return statusToFeature(latest);
  },
  getTargetFeatureVector: async (configId: number) => {
    const config = await monitoringConfigs.get(configId);
    const statuses = await deviceStatuses.list();
    const latest = statuses
      .filter((status) => status.device_id === config.device_id)
      .sort((a, b) => new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime())[0];
    return statusToFeature(latest);
  },
  getFeatureVector: (deviceId: number) => api.getDeviceFeatureVector(deviceId),
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

export type MonitoringTarget = MonitoringConfig;
export type MonitoringTargetPayload = MonitoringConfigPayload;

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
