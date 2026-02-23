import toast from "react-hot-toast";
import {
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotificationsCount,
} from "../features/notifications/notificationHooks";
import { Loader } from "../components/Loader";
import { Search, Filter } from "lucide-react";
import { Pagination } from "../components/Pagination";
import { useClientFilter } from "../hooks/useClientFilter";

export const NotificationsPage = () => {
  const notificationsQuery = useNotifications(true);
  const unreadQuery = useUnreadNotificationsCount(true);
  const markRead = useMarkNotificationRead();

  const notifications = notificationsQuery.data ?? [];
  const unreadCount = unreadQuery.data?.count ?? 0;

  const notifList = useClientFilter({
    data: notifications,
    searchFields: ["title", "message"],
    itemsPerPage: 5,
  });

  const filteredNotifs = notifList.filteredData.filter((n) => {
    if (!notifList.filter) return true;
    if (notifList.filter === "unread") return !n.isRead;
    if (notifList.filter === "read") return n.isRead;
    return true;
  });

  const pagedNotifs = notifList.paginate(filteredNotifs);

  if (notificationsQuery.isLoading || unreadQuery.isLoading) {
    return <Loader label="Loading notifications..." />;
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">
          Notifications{" "}
          <span className="text-brand-600 text-lg">({unreadCount} unread)</span>
        </h1>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-brand-600 focus:ring-1 focus:ring-brand-600 w-full sm:w-56"
              value={notifList.search}
              onChange={(e) => {
                notifList.setSearch(e.target.value);
                notifList.setPage(1);
              }}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <select
              className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-brand-600 bg-white w-full sm:w-36"
              value={notifList.filter}
              onChange={(e) => {
                notifList.setFilter(e.target.value);
                notifList.setPage(1);
              }}
            >
              <option value="">All</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        {pagedNotifs.map((item) => (
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
                disabled={markRead.isPending}
                onClick={async () => {
                  try {
                    await markRead.mutateAsync(item.id);
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
        {filteredNotifs.length === 0 && (
          <div className="py-8 text-center text-slate-500">
            <p>No notifications found.</p>
          </div>
        )}
      </div>
      <Pagination
        currentPage={notifList.page}
        totalItems={filteredNotifs.length}
        pageSize={notifList.itemsPerPage}
        onPageChange={notifList.setPage}
      />
    </section>
  );
};
