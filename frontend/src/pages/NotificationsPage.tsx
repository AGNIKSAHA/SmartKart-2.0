import { useAuthState } from "../features/auth/authHooks";
import {
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotificationsCount,
} from "../features/notifications/notificationHooks";
import { Loader } from "../components/Loader";
import { Pagination } from "../components/Pagination";
import { useClientFilter } from "../hooks/useClientFilter";
import { NotificationFilters } from "../components/Notifications/NotificationFilters";
import { NotificationList } from "../components/Notifications/NotificationList";

export const NotificationsPage = () => {
  const { user } = useAuthState();
  const notificationsQuery = useNotifications(!!user);
  const unreadQuery = useUnreadNotificationsCount(!!user);
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

  const handleMarkRead = async (id: string) => {
    await markRead.mutateAsync(id);
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">
          Notifications{" "}
          <span className="text-brand-600 text-lg">({unreadCount} unread)</span>
        </h1>
        <NotificationFilters
          search={notifList.search}
          setSearch={notifList.setSearch}
          filter={notifList.filter}
          setFilter={notifList.setFilter}
          onFilterChange={() => notifList.setPage(1)}
        />
      </div>

      <NotificationList
        notifications={pagedNotifs}
        onMarkRead={handleMarkRead}
        isMarkingRead={markRead.isPending}
      />

      <div className="mt-6">
        <Pagination
          currentPage={notifList.page}
          totalItems={filteredNotifs.length}
          pageSize={notifList.itemsPerPage}
          onPageChange={notifList.setPage}
        />
      </div>
    </section>
  );
};
