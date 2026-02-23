import { type FormEvent, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useProducts } from "../features/products/productHooks";
import { EmptyState } from "../components/EmptyState";
import { Loader } from "../components/Loader";
import { AddToCartButton } from "../components/AddToCartButton";
import { PRODUCT_CATEGORIES } from "../types/api";
import { LocationSelector } from "../components/LocationSelector";
import { Navigation, MapPin } from "lucide-react";

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

      <form
        onSubmit={applyFilters}
        className="mt-4 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-4 items-end"
      >
        <div>
          <label
            htmlFor="category"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Category
          </label>
          <select
            id="category"
            name="category"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:ring-brand-700 focus:outline-none focus:border-brand-700 capitalize bg-white"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {PRODUCT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="min-price"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Min Price
          </label>
          <input
            id="min-price"
            name="minPrice"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-1 focus:ring-brand-700 focus:outline-none focus:border-brand-700"
            type="number"
            min={0}
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="0"
          />
        </div>
        <div>
          <label
            htmlFor="max-price"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Max Price
          </label>
          <input
            id="max-price"
            name="maxPrice"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-1 focus:ring-brand-700 focus:outline-none focus:border-brand-700"
            type="number"
            min={0}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="999"
          />
        </div>
        <div>
          <button
            type="submit"
            className="w-full rounded-lg bg-brand-700 font-medium px-4 py-2 text-white hover:bg-brand-800 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </form>

      {products.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No products found"
            description="Try different search or filters."
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <article
              key={product.id}
              className="relative rounded-2xl border border-slate-200 bg-white p-4"
            >
              {product.stock === 0 && (
                <span className="absolute right-3 top-3 z-10 rounded-full bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow">
                  Out of Stock
                </span>
              )}
              <img
                src={product.imageUrl}
                alt={product.title}
                className={`h-48 w-full rounded-xl object-cover ${product.stock === 0 ? "opacity-50 grayscale" : ""}`}
              />
              <h3 className="mt-4 text-lg font-semibold line-clamp-1">
                {product.title}
              </h3>
              <p className="mt-1 text-sm text-slate-600 line-clamp-2">
                {product.description}
              </p>
              <div className="mt-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                {product.storeName}
              </div>
              {product.distanceKm !== undefined && (
                <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full w-fit">
                  <MapPin className="h-3 w-3" />
                  {product.distanceKm.toFixed(1)} km away
                </div>
              )}
              <div className="mt-3 flex items-center justify-between">
                <p className="text-lg font-bold text-brand-700">
                  ${product.price}
                </p>
                <p
                  className={`text-sm font-medium ${
                    product.stock === 0
                      ? "text-red-600"
                      : product.stock <= 5
                        ? "text-amber-600"
                        : "text-green-600"
                  }`}
                >
                  {product.stock === 0
                    ? "Out of stock"
                    : product.stock <= 5
                      ? `Only ${product.stock} left`
                      : `${product.stock} in stock`}
                </p>
              </div>
              <div className="mt-4 flex gap-2">
                <AddToCartButton
                  productId={product.id}
                  stock={product.stock}
                  className="rounded-lg bg-brand-700 px-3 py-2 text-sm text-white"
                />
                <Link
                  to={`/products/${product.id}`}
                  className="flex items-center justify-center rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50 transition-colors"
                >
                  View
                </Link>
                {product.location?.coordinates && (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${product.location.coordinates[1]},${product.location.coordinates[0]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-brand-100 bg-brand-50 px-3 py-2 text-sm font-bold text-brand-500 hover:bg-brand-100 transition-colors"
                  >
                    <Navigation className="h-4 w-4" />
                    Directions
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {pagination && (
        <div className="mt-6 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">
            Page {pagination.page} of {pagination.totalPages} (
            {pagination.total} products)
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
              disabled={pagination.page <= 1}
              onClick={() => setPage(pagination.page - 1)}
            >
              Previous
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPage(pagination.page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
