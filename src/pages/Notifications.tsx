import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, Notification as NetNotification } from "@/lib/api";
import { Bell, CheckCircle2, Clock, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export default function Notifications() {
  const queryClient = useQueryClient();
  const { data: notifications, isLoading, error } = useQuery({
    queryKey: ["notifications"],
    queryFn: api.getNotifications,
    refetchInterval: 15000,
  });

  const unreadCount = notifications?.filter((item) => !item.is_read).length || 0;

  const markReadMutation = useMutation({
    mutationFn: api.markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Notification marked as read");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <p className="text-sm text-muted-foreground">Notifikasi dari `/api/notifications`; mark read memakai PATCH is_read.</p>
        </div>
        <div className="rounded-md border border-border bg-secondary/50 px-3 py-2 text-xs font-mono text-muted-foreground">
          {unreadCount} unread / {notifications?.length || 0} total
        </div>
      </div>

      {error && (
        <div className="card-glass rounded-lg p-6 text-sm text-destructive">
          <ShieldAlert className="mr-2 inline h-4 w-4" />
          {(error as Error).message}
        </div>
      )}

      {isLoading && (
        <div className="space-y-3">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="h-24 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      )}

      <div className="space-y-3">
        {notifications?.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onRead={() => markReadMutation.mutate(notification.id)}
            pending={markReadMutation.isPending}
          />
        ))}
      </div>

      {notifications?.length === 0 && !isLoading && (
        <div className="card-glass rounded-lg p-12 text-center">
          <Bell className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Belum ada notifikasi.</p>
        </div>
      )}
    </div>
  );
}

function NotificationItem({
  notification,
  onRead,
  pending,
}: {
  notification: NetNotification;
  onRead: () => void;
  pending: boolean;
}) {
  return (
    <article className="card-glass rounded-lg p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-2 py-0.5 text-[11px] font-mono ${notification.is_read ? "border-border text-muted-foreground" : "status-online"}`}>
              {notification.is_read ? "READ" : "UNREAD"}
            </span>
            <span className="rounded-full border border-border bg-secondary/70 px-2 py-0.5 text-[11px] font-mono text-muted-foreground">
              user #{notification.user_id}
            </span>
            <span className="rounded-full border border-border bg-secondary/70 px-2 py-0.5 text-[11px] font-mono text-muted-foreground">
              alert #{notification.alert_id}
            </span>
          </div>
          <h2 className="mt-3 text-base font-semibold text-foreground">{notification.title}</h2>
          <p className="text-sm text-muted-foreground">{notification.message}</p>
          <p className="mt-3 flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {formatDateTime(notification.created_at)}
          </p>
        </div>
        {!notification.is_read && (
          <button
            type="button"
            onClick={onRead}
            disabled={pending}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            <CheckCircle2 className="h-4 w-4" />
            Mark Read
          </button>
        )}
      </div>
    </article>
  );
}

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
