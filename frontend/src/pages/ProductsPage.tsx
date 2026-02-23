import { type FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useProducts } from "../features/products/productHooks";
import { Loader } from "../components/Loader";
import { LocationSelector } from "../components/LocationSelector";
import { Navigation } from "lucide-react";
import { ProductFilters } from "../components/Products/ProductFilters";
import { ProductList } from "../components/Products/ProductList";

const parseNumber = (value: string | null): number | undefined => {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

export const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navbarSearch = searchParams.get("search");

  const queryCategory = searchParams.get("category") ?? "";
  const queryMinPrice = parseNumber(searchParams.get("minPrice"));
  const queryMaxPrice = parseNumber(searchParams.get("maxPrice"));
  const page = parseNumber(searchParams.get("page")) ?? 1;

  const [category, setCategory] = useState(queryCategory);
  const [minPrice, setMinPrice] = useState(
    queryMinPrice !== undefined ? String(queryMinPrice) : "",
  );
  const [maxPrice, setMaxPrice] = useState(
    queryMaxPrice !== undefined ? String(queryMaxPrice) : "",
  );

  const [consumerLocation, setConsumerLocation] = useState<{
    lng: number;
    lat: number;
  } | null>(null);

  useEffect(() => {
    setCategory(queryCategory);
    setMinPrice(queryMinPrice !== undefined ? String(queryMinPrice) : "");
    setMaxPrice(queryMaxPrice !== undefined ? String(queryMaxPrice) : "");
  }, [queryCategory, queryMinPrice, queryMaxPrice]);

  const query = {
    page,
    limit: 9,
    ...(navbarSearch ? { search: navbarSearch } : {}),
    ...(queryCategory ? { category: queryCategory } : {}),
    ...(queryMinPrice !== undefined ? { minPrice: queryMinPrice } : {}),
    ...(queryMaxPrice !== undefined ? { maxPrice: queryMaxPrice } : {}),
    ...(consumerLocation
      ? { lng: consumerLocation.lng, lat: consumerLocation.lat }
      : {}),
  };

  const productsQuery = useProducts(query);

  if (productsQuery.isLoading) {
    return <Loader label="Loading products..." />;
  }

  const data = productsQuery.data;
  const products = data?.items ?? [];
  const pagination = data?.pagination;

  const applyFilters = (e: FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);

    if (category.trim().length === 0) next.delete("category");
    else next.set("category", category.trim());

    if (minPrice.trim().length === 0) next.delete("minPrice");
    else next.set("minPrice", minPrice.trim());

    if (maxPrice.trim().length === 0) next.delete("maxPrice");
    else next.set("maxPrice", maxPrice.trim());

    next.set("page", "1");
    setSearchParams(next);
  };

  const setPage = (page: number): void => {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(page));
    setSearchParams(next);
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Search Products</h1>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4 text-slate-800">
          <Navigation className="h-5 w-5 text-brand-600" />
          <h2 className="font-semibold text-lg">Your Current Location</h2>
        </div>
        <p className="text-sm text-slate-500 mb-4">
          Enable location to see products near you and calculate delivery
          distances.
        </p>
        <LocationSelector
          initialLocation={consumerLocation || undefined}
          onLocationSelect={setConsumerLocation}
        />
      </div>

      <ProductFilters
        category={category}
        setCategory={setCategory}
        minPrice={minPrice}
        setMinPrice={setMinPrice}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
        applyFilters={applyFilters}
      />

      <ProductList
        products={products}
        pagination={pagination}
        setPage={setPage}
      />
    </section>
  );
};
