import toast from "react-hot-toast";
import type { NotificationItem as Notification } from "../../types/api";

type Props = {
  notifications: Notification[];
  onMarkRead: (id: string) => Promise<void>;
  isMarkingRead: boolean;
};

export const NotificationList = ({
  notifications,
  onMarkRead,
  isMarkingRead,
}: Props) => {
  if (notifications.length === 0) {
    return (
      <div className="py-8 text-center text-slate-500">
        <p>No notifications found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((item) => (
        <div
          key={item.id}
          className={`rounded-lg border p-4 transition-colors ${item.isRead ? "border-slate-200 bg-white" : "border-brand-200 bg-brand-50"}`}
        >
          <p className="font-semibold">{item.title}</p>
          <p className="text-sm text-slate-600">{item.message}</p>
          <p className="text-xs text-slate-500">
            {new Date(item.createdAt).toLocaleString()}
          </p>
          {!item.isRead && (
            <button
              type="button"
              className="mt-3 rounded-lg border border-brand-300 bg-white px-3 py-1.5 text-sm font-medium text-brand-700 hover:bg-brand-50 transition"
              disabled={isMarkingRead}
              onClick={async () => {
                try {
                  await onMarkRead(item.id);
                } catch {
                  toast.error("Could not mark as read");
                }
              }}
            >
              Mark as Read
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
