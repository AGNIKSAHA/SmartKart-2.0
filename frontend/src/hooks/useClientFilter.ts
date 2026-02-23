import { useState, useMemo } from "react";

export interface FilterOptions<T> {
  data: T[] | undefined;
  searchFields: (keyof T | ((item: T) => string))[];
  itemsPerPage?: number;
  initialSort?: (a: T, b: T) => number;
}

export function useClientFilter<T>({
  data,
  searchFields,
  itemsPerPage = 5,
  initialSort,
}: FilterOptions<T>) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("");
  const [page, setPage] = useState(1);

  const filteredData = useMemo(() => {
    if (!data) return [];
    let result = [...data];

    // Basic string match filtering
    if (search.trim()) {
      const lowerSearch = search.toLowerCase();
      result = result.filter((item) => {
        return searchFields.some((field) => {
          const val = typeof field === "function" ? field(item) : item[field];
          return String(val).toLowerCase().includes(lowerSearch);
        });
      });
    }

    // Custom secondary filter (will be implemented per use-case)
    return initialSort ? result.sort(initialSort) : result;
  }, [data, search, searchFields, initialSort]);

  // Expose an extra pass for the caller to do specific category/status filtering
  // before pagination
  const paginate = (items: T[]) => {
    const startIndex = (page - 1) * itemsPerPage;
    return items.slice(startIndex, startIndex + itemsPerPage);
  };

  return {
    search,
    setSearch,
    filter,
    setFilter,
    page,
    setPage,
    filteredData,
    paginate,
    itemsPerPage,
  };
}
