import { Link } from "react-router-dom";
import { MapPin, Navigation } from "lucide-react";

import { AddToCartButton } from "../AddToCartButton";
import { EmptyState } from "../EmptyState";

import type { Product, ProductListResult } from "../../types/api";

type Props = {
  products: Product[];
  pagination?: ProductListResult["pagination"] | undefined;
  setPage: (page: number) => void;
};

export const ProductList = ({ products, pagination, setPage }: Props) => {
  if (products.length === 0) {
    return (
      <div className="mt-6">
        <EmptyState
          title="No products found"
          description="Try different search or filters."
        />
      </div>
    );
  }

  return (
    <>
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
    </>
  );
};
