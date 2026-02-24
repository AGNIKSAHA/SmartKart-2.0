import { Search, Filter } from "lucide-react";

type Props = {
  search: string;
  setSearch: (val: string) => void;
  filter: string;
  setFilter: (val: string) => void;
  onFilterChange: () => void;
};

export const NotificationFilters = ({
  search,
  setSearch,
  filter,
  setFilter,
  onFilterChange,
}: Props) => {
  return (
    <div className="flex gap-2">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
        <input
          id="notif-search"
          name="notifSearch"
          type="text"
          placeholder="Search notifications..."
          className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-brand-600 focus:ring-1 focus:ring-brand-600 w-full sm:w-56"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            onFilterChange();
          }}
        />
      </div>
      <div className="relative">
        <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
        <select
          id="notif-status"
          name="notifStatus"
          className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-brand-600 bg-white w-full sm:w-36"
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            onFilterChange();
          }}
        >
          <option value="">All</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
        </select>
      </div>
    </div>
  );
};
