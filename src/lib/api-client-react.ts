import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
  type UseQueryOptions,
} from "@tanstack/react-query";

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
};

type ListResponse<T> = {
  success: boolean;
  data: T[];
  total: number;
};

type QueryConfig<T> = {
  query?: Omit<Partial<UseQueryOptions<T, Error, T, QueryKey>>, "queryFn">;
};

export type UserProfile = {
  id: number;
  name: string;
  email: string;
  role_id?: number;
  is_active?: boolean;
  phone?: string | null;
  department?: string | null;
};

type StoredUser = UserProfile & {
  password?: string;
};

export type Device = {
  id: number;
  name: string;
  ip_address: string;
  type: string;
  location?: string | null;
  status?: "online" | "offline" | "unknown";
  is_active?: boolean;
  snmp_community?: string | null;
};

type Feedback = {
  id: number;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  created_at?: string;
};

type Permission = {
  id: number;
  name: string;
  description?: string;
};

type Role = {
  id: number;
  name: string;
  description?: string;
  permissions: Permission[];
};

type PingResult = {
  ip_address: string;
  packets_sent: number;
  packets_received: number;
  packet_loss: number;
  min_rtt_ms?: number;
  max_rtt_ms?: number;
  avg_rtt_ms?: number;
  status: "online" | "offline";
};

type PingRecord = PingResult & {
  id: number;
};

type SnmpRecord = {
  oid: string;
  value: string;
  created_at?: string;
};

type MockState = {
  users: StoredUser[];
  devices: Device[];
  feedback: Feedback[];
  permissions: Permission[];
  roles: Role[];
  pingHistory: Record<number, PingRecord[]>;
  snmpHistory: Record<number, SnmpRecord[]>;
};

type ListDevicesParams = {
  search?: string;
  type?: string;
  limit?: number;
};

type ListUsersParams = {
  search?: string;
  limit?: number;
};

type ListFeedbackParams = {
  status?: string;
  limit?: number;
};

const STORAGE_KEY = "netmonitor_mock_state";

const defaultPermissions: Permission[] = [
  { id: 1, name: "devices:read", description: "View monitored devices" },
  { id: 2, name: "devices:write", description: "Create and remove devices" },
  { id: 3, name: "monitoring:run", description: "Run ping and SNMP checks" },
  { id: 4, name: "users:manage", description: "Manage application users" },
  { id: 5, name: "feedback:manage", description: "Manage feedback tickets" },
];

const defaultState: MockState = {
  users: [
    {
      id: 1,
      name: "Admin User",
      email: "admin@example.com",
      password: "password",
      role_id: 1,
      is_active: true,
      phone: "+62 812 0000 0001",
      department: "IT Operations",
    },
    {
      id: 2,
      name: "Network Technician",
      email: "tech@example.com",
      password: "password",
      role_id: 2,
      is_active: true,
      phone: "+62 812 0000 0002",
      department: "Infrastructure",
    },
  ],
  devices: [
    {
      id: 1,
      name: "core-router-01",
      ip_address: "192.168.1.1",
      type: "router",
      location: "Main Distribution Frame",
      status: "online",
      is_active: true,
      snmp_community: "public",
    },
    {
      id: 2,
      name: "app-server-01",
      ip_address: "192.168.1.20",
      type: "server",
      location: "Rack A4",
      status: "online",
      is_active: true,
      snmp_community: "public",
    },
    {
      id: 3,
      name: "access-switch-02",
      ip_address: "192.168.1.12",
      type: "switch",
      location: "Floor 2",
      status: "offline",
      is_active: true,
      snmp_community: null,
    },
  ],
  feedback: [
    {
      id: 1,
      title: "Intermittent Wi-Fi in lab",
      description: "Several users reported unstable connectivity during peak hours.",
      category: "keluhan",
      priority: "high",
      status: "open",
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 2,
      title: "Add monitoring for backup NAS",
      description: "Please add the new NAS appliance to the monitoring dashboard.",
      category: "saran",
      priority: "medium",
      status: "in_progress",
      created_at: new Date(Date.now() - 172800000).toISOString(),
    },
  ],
  permissions: defaultPermissions,
  roles: [
    {
      id: 1,
      name: "administrator",
      description: "Full operational access",
      permissions: defaultPermissions,
    },
    {
      id: 2,
      name: "operator",
      description: "Can monitor devices and handle tickets",
      permissions: defaultPermissions.filter((permission) => permission.name !== "users:manage"),
    },
  ],
  pingHistory: {
    1: [
      {
        id: 1,
        ip_address: "192.168.1.1",
        packets_sent: 4,
        packets_received: 4,
        packet_loss: 0,
        min_rtt_ms: 3,
        max_rtt_ms: 8,
        avg_rtt_ms: 5,
        status: "online",
      },
      {
        id: 2,
        ip_address: "192.168.1.1",
        packets_sent: 4,
        packets_received: 4,
        packet_loss: 0,
        min_rtt_ms: 4,
        max_rtt_ms: 9,
        avg_rtt_ms: 6,
        status: "online",
      },
    ],
    2: [
      {
        id: 3,
        ip_address: "192.168.1.20",
        packets_sent: 4,
        packets_received: 4,
        packet_loss: 0,
        min_rtt_ms: 7,
        max_rtt_ms: 18,
        avg_rtt_ms: 12,
        status: "online",
      },
    ],
  },
  snmpHistory: {
    1: [
      { oid: "1.3.6.1.2.1.1.1.0", value: "RouterOS core gateway", created_at: new Date().toISOString() },
      { oid: "1.3.6.1.2.1.1.3.0", value: "19 days, 04:12:31", created_at: new Date().toISOString() },
    ],
    2: [
      { oid: "1.3.6.1.2.1.1.1.0", value: "Ubuntu application server", created_at: new Date().toISOString() },
    ],
  },
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function writeState(state: MockState) {
  if (isBrowser()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}

function readState(): MockState {
  const fallback = clone(defaultState);

  if (!isBrowser()) {
    return fallback;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    writeState(fallback);
    return fallback;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<MockState>;
    return { ...fallback, ...parsed };
  } catch {
    writeState(fallback);
    return fallback;
  }
}

function updateState(updater: (state: MockState) => MockState) {
  const nextState = updater(readState());
  writeState(nextState);
  return nextState;
}

function wait<T>(value: T) {
  return new Promise<T>((resolve) => {
    window.setTimeout(() => resolve(value), 150);
  });
}

function publicUser(user: StoredUser): UserProfile {
  const { password: _password, ...profile } = user;
  return profile;
}

function nextId(items: Array<{ id: number }>) {
  return items.reduce((max, item) => Math.max(max, item.id), 0) + 1;
}

function applyLimit<T>(items: T[], limit?: number) {
  return typeof limit === "number" ? items.slice(0, limit) : items;
}

function simulatePing(ipAddress: string, count = 4): PingResult {
  const isOffline =
    ipAddress.trim() === "" ||
    ipAddress === "0.0.0.0" ||
    ipAddress.toLowerCase().includes("offline");

  if (isOffline) {
    return {
      ip_address: ipAddress,
      packets_sent: count,
      packets_received: 0,
      packet_loss: 100,
      status: "offline",
    };
  }

  const min = 3 + Math.floor(Math.random() * 8);
  const max = min + 8 + Math.floor(Math.random() * 20);
  const avg = Math.round((min + max) / 2);
  const packetLoss = Math.random() > 0.92 ? 25 : 0;

  return {
    ip_address: ipAddress,
    packets_sent: count,
    packets_received: Math.max(0, count - Math.round((count * packetLoss) / 100)),
    packet_loss: packetLoss,
    min_rtt_ms: min,
    max_rtt_ms: max,
    avg_rtt_ms: avg,
    status: packetLoss >= 100 ? "offline" : "online",
  };
}

function useApiQuery<T>(queryKey: QueryKey, queryFn: () => Promise<T>, options?: QueryConfig<T>) {
  return useQuery<T, Error, T, QueryKey>({
    queryKey,
    queryFn,
    ...options?.query,
  });
}

export const getHealthCheckQueryKey = () => ["health"] as const;
export const getListDevicesQueryKey = (params?: ListDevicesParams) =>
  params ? (["devices", params] as const) : (["devices"] as const);
export const getGetDeviceQueryKey = (id?: number) => ["devices", id] as const;
export const getListUsersQueryKey = (params?: ListUsersParams) =>
  params ? (["users", params] as const) : (["users"] as const);
export const getListFeedbackQueryKey = (params?: ListFeedbackParams) =>
  params ? (["feedback", params] as const) : (["feedback"] as const);
export const getGetFeedbackStatsQueryKey = () => ["feedback", "stats"] as const;

export function useHealthCheck(options?: QueryConfig<{ status: "ok"; timestamp: string }>) {
  return useApiQuery(
    getHealthCheckQueryKey(),
    () => wait({ status: "ok", timestamp: new Date().toISOString() }),
    options,
  );
}

export function useGetMe(options?: QueryConfig<ApiResponse<UserProfile>>) {
  return useApiQuery<ApiResponse<UserProfile>>(
    ["me"],
    () => {
      const state = readState();
      const storedUser = isBrowser() ? window.localStorage.getItem("auth_user") : null;
      const user = storedUser ? (JSON.parse(storedUser) as UserProfile) : publicUser(state.users[0]);
      return wait({ success: true, data: user });
    },
    options,
  );
}

export function useLogin() {
  return useMutation({
    mutationFn: ({ data }: { data: Partial<{ email: string; password: string }> }) => {
      const state = readState();
      const email = data.email ?? "";
      const user = state.users.find(
        (item) => item.email.toLowerCase() === email.toLowerCase() && item.is_active !== false,
      );

      if (!user || !data.password) {
        return wait<ApiResponse<{ token: string; user: UserProfile; permissions: string[] }>>({
          success: false,
          message: "Invalid credentials",
        });
      }

      const role = state.roles.find((item) => item.id === user.role_id);
      return wait<ApiResponse<{ token: string; user: UserProfile; permissions: string[] }>>({
        success: true,
        data: {
          token: `mock-token-${Date.now()}`,
          user: publicUser(user),
          permissions: (role?.permissions ?? state.permissions).map((permission) => permission.name),
        },
      });
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: ({ data }: { data: Partial<Omit<StoredUser, "id" | "role_id" | "is_active">> }) => {
      const state = readState();
      const email = data.email ?? `user-${Date.now()}@example.com`;
      const emailExists = state.users.some(
        (item) => item.email.toLowerCase() === email.toLowerCase(),
      );

      if (emailExists) {
        return wait<ApiResponse<UserProfile>>({
          success: false,
          message: "Email is already registered",
        });
      }

      const nextUser: StoredUser = {
        ...data,
        name: data.name ?? "New User",
        email,
        password: data.password ?? "password",
        id: nextId(state.users),
        role_id: 2,
        is_active: true,
      };

      updateState((current) => ({
        ...current,
        users: [...current.users, nextUser],
      }));

      return wait<ApiResponse<UserProfile>>({ success: true, data: publicUser(nextUser) });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ data }: { data: { old_password: string; new_password: string } }) =>
      wait<ApiResponse<null>>({
        success: !!data.old_password && !!data.new_password,
        data: null,
        message: "Password updated",
      }),
  });
}

export function useListDevices(params: ListDevicesParams = {}, options?: QueryConfig<ListResponse<Device>>) {
  return useApiQuery(
    getListDevicesQueryKey(params),
    () => {
      const search = params.search?.toLowerCase();
      let devices = readState().devices;

      if (search) {
        devices = devices.filter(
          (device) =>
            device.name.toLowerCase().includes(search) ||
            device.ip_address.toLowerCase().includes(search),
        );
      }

      if (params.type) {
        devices = devices.filter((device) => device.type === params.type);
      }

      return wait({ success: true, data: applyLimit(devices, params.limit), total: devices.length });
    },
    options,
  );
}

export function useGetDevice(id: number, options?: QueryConfig<ApiResponse<Device>>) {
  return useApiQuery<ApiResponse<Device>>(
    getGetDeviceQueryKey(id),
    () => wait({ success: true, data: readState().devices.find((device) => device.id === id) }),
    options,
  );
}

export function useCreateDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data }: { data: Partial<Omit<Device, "id" | "status">> }) => {
      const state = updateState((current) => {
        const device: Device = {
          ...data,
          name: data.name ?? "Untitled device",
          ip_address: data.ip_address ?? "0.0.0.0",
          type: data.type ?? "other",
          id: nextId(current.devices),
          status: "unknown",
        };

        return {
          ...current,
          devices: [device, ...current.devices],
        };
      });

      return wait<ApiResponse<Device>>({ success: true, data: state.devices[0] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListDevicesQueryKey() });
    },
  });
}

export function useDeleteDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: number }) => {
      updateState((current) => ({
        ...current,
        devices: current.devices.filter((device) => device.id !== id),
      }));

      return wait<ApiResponse<null>>({ success: true, data: null });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListDevicesQueryKey() });
    },
  });
}

export function usePingDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id?: number; data?: { count?: number } }) => {
      const state = readState();
      const device = state.devices.find((item) => item.id === id) ?? state.devices[0];
      const result = simulatePing(device?.ip_address ?? "0.0.0.0", data?.count ?? 4);

      if (device) {
        updateState((current) => ({
          ...current,
          devices: current.devices.map((item) =>
            item.id === device.id ? { ...item, status: result.status } : item,
          ),
          pingHistory: {
            ...current.pingHistory,
            [device.id]: [
              {
                ...result,
                id: nextId(current.pingHistory[device.id] ?? []),
              },
              ...(current.pingHistory[device.id] ?? []),
            ].slice(0, 20),
          },
        }));
      }

      return wait<ApiResponse<PingResult>>({ success: true, data: result });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListDevicesQueryKey() });
    },
  });
}

export function usePingCustom() {
  return useMutation({
    mutationFn: ({ data }: { data: Partial<{ ip_address: string; count: number }> }) =>
      wait<ApiResponse<PingResult>>({
        success: true,
        data: simulatePing(data.ip_address ?? "0.0.0.0", data.count ?? 4),
      }),
  });
}

export function useGetPingHistory(id: number, options?: QueryConfig<ApiResponse<PingRecord[]>>) {
  return useApiQuery<ApiResponse<PingRecord[]>>(
    ["devices", id, "ping-history"],
    () => wait({ success: true, data: readState().pingHistory[id] ?? [] }),
    options,
  );
}

export function useGetSnmpHistory(id: number, options?: QueryConfig<ApiResponse<SnmpRecord[]>>) {
  return useApiQuery<ApiResponse<SnmpRecord[]>>(
    ["devices", id, "snmp-history"],
    () => wait({ success: true, data: readState().snmpHistory[id] ?? [] }),
    options,
  );
}

export function useListOids(options?: QueryConfig<ApiResponse<SnmpRecord[]>>) {
  return useApiQuery<ApiResponse<SnmpRecord[]>>(
    ["oids"],
    () =>
      wait({
        success: true,
        data: [
          { oid: "1.3.6.1.2.1.1.1.0", value: "System Description" },
          { oid: "1.3.6.1.2.1.1.3.0", value: "System Uptime" },
          { oid: "1.3.6.1.2.1.1.5.0", value: "System Name" },
        ],
      }),
    options,
  );
}

export function useSnmpDevice() {
  return useMutation({
    mutationFn: ({ data }: { data: { oid: string; ip_address?: string } }) =>
      wait<ApiResponse<SnmpRecord>>({
        success: true,
        data: {
          oid: data.oid,
          value: `Mock SNMP value from ${data.ip_address ?? "device"}`,
          created_at: new Date().toISOString(),
        },
      }),
  });
}

export function useListUsers(params: ListUsersParams = {}, options?: QueryConfig<ListResponse<UserProfile>>) {
  return useApiQuery(
    getListUsersQueryKey(params),
    () => {
      const search = params.search?.toLowerCase();
      let users = readState().users.map(publicUser);

      if (search) {
        users = users.filter(
          (user) =>
            user.name.toLowerCase().includes(search) ||
            user.email.toLowerCase().includes(search) ||
            user.department?.toLowerCase().includes(search),
        );
      }

      return wait({ success: true, data: applyLimit(users, params.limit), total: users.length });
    },
    options,
  );
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data }: { data: Partial<Omit<StoredUser, "id" | "role_id">> }) => {
      const state = updateState((current) => {
        const user: StoredUser = {
          ...data,
          name: data.name ?? "New User",
          email: data.email ?? `user-${Date.now()}@example.com`,
          password: data.password ?? "password",
          id: nextId(current.users),
          role_id: 2,
        };

        return {
          ...current,
          users: [user, ...current.users],
        };
      });

      return wait<ApiResponse<UserProfile>>({ success: true, data: publicUser(state.users[0]) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: number }) => {
      updateState((current) => ({
        ...current,
        users: current.users.filter((user) => user.id !== id),
      }));

      return wait<ApiResponse<null>>({ success: true, data: null });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
    },
  });
}

export function useListFeedback(
  params: ListFeedbackParams = {},
  options?: QueryConfig<ListResponse<Feedback>>,
) {
  return useApiQuery(
    getListFeedbackQueryKey(params),
    () => {
      let feedback = readState().feedback;

      if (params.status) {
        feedback = feedback.filter((item) => item.status === params.status);
      }

      return wait({
        success: true,
        data: applyLimit(feedback, params.limit),
        total: feedback.length,
      });
    },
    options,
  );
}

export function useCreateFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data }: { data: Partial<Omit<Feedback, "id" | "status" | "created_at">> }) => {
      const state = updateState((current) => {
        const item: Feedback = {
          ...data,
          title: data.title ?? "Untitled ticket",
          description: data.description ?? "",
          category: data.category ?? "pertanyaan",
          priority: data.priority ?? "low",
          id: nextId(current.feedback),
          status: "open",
          created_at: new Date().toISOString(),
        };

        return {
          ...current,
          feedback: [item, ...current.feedback],
        };
      });

      return wait<ApiResponse<Feedback>>({ success: true, data: state.feedback[0] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListFeedbackQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetFeedbackStatsQueryKey() });
    },
  });
}

export function useGetFeedbackStats(options?: QueryConfig<ApiResponse<{
  total: number;
  open: number;
  by_priority: Record<string, number>;
  by_category: Record<string, number>;
}>>) {
  return useApiQuery<ApiResponse<{
    total: number;
    open: number;
    by_priority: Record<string, number>;
    by_category: Record<string, number>;
  }>>(
    getGetFeedbackStatsQueryKey(),
    () => {
      const feedback = readState().feedback;
      const stats = feedback.reduce(
        (acc, item) => {
          acc.by_priority[item.priority] = (acc.by_priority[item.priority] ?? 0) + 1;
          acc.by_category[item.category] = (acc.by_category[item.category] ?? 0) + 1;

          if (item.status === "open") {
            acc.open += 1;
          }

          return acc;
        },
        {
          total: feedback.length,
          open: 0,
          by_priority: {} as Record<string, number>,
          by_category: {} as Record<string, number>,
        },
      );

      return wait({ success: true, data: stats });
    },
    options,
  );
}

export function useListRoles(options?: QueryConfig<ListResponse<Role>>) {
  return useApiQuery(
    ["roles"],
    () => {
      const roles = readState().roles;
      return wait({ success: true, data: roles, total: roles.length });
    },
    options,
  );
}

export function useListPermissions(options?: QueryConfig<ListResponse<Permission>>) {
  return useApiQuery(
    ["permissions"],
    () => {
      const permissions = readState().permissions;
      return wait({ success: true, data: permissions, total: permissions.length });
    },
    options,
  );
}
