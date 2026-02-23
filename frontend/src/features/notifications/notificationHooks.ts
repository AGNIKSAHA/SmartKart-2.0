import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "./notificationAPI";

const notificationsKey = ["notifications"] as const;
const unreadKey = ["notifications", "unread-count"] as const;

export const useNotifications = (enabled = true) =>
  useQuery({
    queryKey: notificationsKey,
    queryFn: () => notificationsApi.list(),
    enabled
  });

export const useUnreadNotificationsCount = (enabled = true) =>
  useQuery({
    queryKey: unreadKey,
    queryFn: () => notificationsApi.unreadCount(),
    enabled,
    refetchInterval: 15000
  });

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKey });
      queryClient.invalidateQueries({ queryKey: unreadKey });
    }
  });
};
