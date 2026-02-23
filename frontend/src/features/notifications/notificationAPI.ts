import { http } from "../../utils/http";
import { unwrap } from "../../utils/request";
import type { NotificationItem } from "../../types/api";

export const notificationsApi = {
  list(): Promise<NotificationItem[]> {
    return unwrap(http.get("/notifications"));
  },
  unreadCount(): Promise<{ count: number }> {
    return unwrap(http.get("/notifications/unread-count"));
  },
  markRead(id: string): Promise<NotificationItem> {
    return unwrap(http.patch(`/notifications/${id}/read`));
  }
};
