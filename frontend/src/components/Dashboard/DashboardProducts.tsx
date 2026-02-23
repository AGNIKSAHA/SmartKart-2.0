import { useState } from "react";
import { Search, Filter, ArrowUpDown } from "lucide-react";
import toast from "react-hot-toast";

import { PRODUCT_CATEGORIES, type ProductCategory } from "../../types/api";
import {
  useDeleteProduct,
  useMyProducts,
  useUpdateProduct,
} from "../../features/products/productHooks";
import { useClientFilter } from "../../hooks/useClientFilter";
import { Pagination } from "../Pagination";
import { ConfirmModal } from "../ConfirmModal";
import { LocationSelector } from "../LocationSelector";

export const DashboardProducts = () => {
  const productsQuery = useMyProducts(true);
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editStoreName, setEditStoreName] = useState("");
  const [editCategory, setEditCategory] = useState<ProductCategory>(
    PRODUCT_CATEGORIES[0],
  );
  const [editLocation, setEditLocation] = useState<{
    lng: number;
    lat: number;
  } | null>(null);
  const [stockSort, setStockSort] = useState<"none" | "asc" | "desc">("none");

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const productList = useClientFilter({
    data: productsQuery.data,
    searchFields: ["title", "description"],
  });

  const filteredProducts = productList.filteredData
    .filter((p) => !productList.filter || p.category === productList.filter)
    .sort((a, b) => {
      if (stockSort === "asc") return a.stock - b.stock;
      if (stockSort === "desc") return b.stock - a.stock;
      return 0; // Default creation order is handled backend-side via _id parsing
    });
  const pagedProducts = productList.paginate(filteredProducts);

  const startEdit = (product: {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    price: number;
    stock: number;
    category: string;
    storeName: string;
    location?: { type: "Point"; coordinates: [number, number] };
  }): void => {
    setEditingProductId(product.id);
    setEditTitle(product.title);
    setEditDescription(product.description);
    setEditImageUrl(product.imageUrl);
    setEditPrice(String(product.price));
    setEditStock(String(product.stock));
    setEditStoreName(product.storeName);
    setEditCategory(product.category as ProductCategory);
    if (product.location) {
      setEditLocation({
        lng: product.location.coordinates[0],
        lat: product.location.coordinates[1],
      });
    } else {
      setEditLocation(null);
    }
  };

  const saveEdit = async (id: string): Promise<void> => {
    try {
      await updateProduct.mutateAsync({
        id,
        payload: {
          title: editTitle,
          description: editDescription,
          imageUrl: editImageUrl,
          price: Number(editPrice),
          stock: Number(editStock),
          storeName: editStoreName,
          category: editCategory,
          location: editLocation || undefined,
        },
      });
      setEditingProductId(null);
    } catch {
      toast.error("Product update failed");
    }
  };

  if (productsQuery.isLoading) {
    return (
      <div className="py-8 text-center text-slate-500">Loading products...</div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <h2 className="text-xl font-semibold">Manage Products</h2>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search products..."
              className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-brand-600 focus:ring-1 focus:ring-brand-600 w-full sm:w-48"
              value={productList.search}
              onChange={(e) => {
                productList.setSearch(e.target.value);
                productList.setPage(1);
              }}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <select
              className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-brand-600 bg-white w-full sm:w-40 capitalize"
              value={productList.filter}
              onChange={(e) => {
                productList.setFilter(e.target.value);
                productList.setPage(1);
              }}
            >
              <option value="">All Categories</option>
              {PRODUCT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="relative">
            <ArrowUpDown className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <select
              className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-brand-600 bg-white w-full sm:w-40"
              value={stockSort}
              onChange={(e) => {
                setStockSort(e.target.value as "none" | "asc" | "desc");
                productList.setPage(1);
              }}
            >
              <option value="none">Sort by Stock</option>
              <option value="asc">Stock: Low to High</option>
              <option value="desc">Stock: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {pagedProducts.map((product) => (
          <div
            key={product.id}
            className="rounded-lg border border-slate-200 p-4"
          >
            {editingProductId === product.id ? (
              <div className="space-y-3">
                <input
                  className="w-full rounded border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  value={editTitle}
                  placeholder="Product Title"
                  onChange={(e) => setEditTitle(e.target.value)}
                />
                <textarea
                  className="w-full rounded border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  rows={3}
                  placeholder="Description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
                <input
                  className="w-full rounded border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  value={editImageUrl}
                  placeholder="Image URL"
                  onChange={(e) => setEditImageUrl(e.target.value)}
                />
                <input
                  className="w-full rounded border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  value={editStoreName}
                  placeholder="Store Name"
                  onChange={(e) => setEditStoreName(e.target.value)}
                />
                <div className="grid gap-3 sm:grid-cols-3">
                  <input
                    className="rounded border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    type="number"
                    min={1}
                    placeholder="Price"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                  />
                  <input
                    className="rounded border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    type="number"
                    min={0}
                    placeholder="Stock"
                    value={editStock}
                    onChange={(e) => setEditStock(e.target.value)}
                  />
                  <select
                    className="rounded border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 capitalize bg-white"
                    value={editCategory}
                    onChange={(e) =>
                      setEditCategory(e.target.value as ProductCategory)
                    }
                  >
                    {PRODUCT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Product Location
                  </label>
                  <LocationSelector
                    initialLocation={editLocation || undefined}
                    onLocationSelect={setEditLocation}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="rounded-lg bg-brand-700 px-4 py-2 text-white font-medium hover:bg-brand-800 transition-colors"
                    onClick={() => void saveEdit(product.id)}
                    disabled={updateProduct.isPending}
                  >
                    {updateProduct.isPending ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-slate-300 px-4 py-2 hover:bg-slate-50 transition-colors"
                    onClick={() => setEditingProductId(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="h-24 w-24 shrink-0 rounded-lg bg-slate-100 overflow-hidden border border-slate-200">
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-full object-cover"
                    onError={(e) =>
                      (e.currentTarget.src =
                        "https://placehold.co/400x400/f8fafc/94a3b8?text=No+Image")
                    }
                  />
                </div>
                <div className="flex-grow flex flex-col justify-between">
                  <div>
                    <p className="font-semibold text-lg line-clamp-1">
                      {product.title}
                    </p>
                    <p className="text-sm text-slate-500 line-clamp-2 mt-1">
                      {product.description}
                    </p>
                    <p className="text-sm font-medium text-brand-600 mt-1">
                      {product.storeName}
                    </p>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium">
                    <span className="text-brand-700">
                      ${product.price.toFixed(2)}
                    </span>
                    <span
                      className={
                        product.stock > 0 ? "text-slate-600" : "text-red-500"
                      }
                    >
                      Stock: {product.stock}
                    </span>
                    <span className="text-slate-600 px-2 py-0.5 bg-slate-100 rounded text-xs">
                      {product.category}
                    </span>
                  </div>
                </div>

                <div className="mt-2 sm:mt-0 flex flex-row sm:flex-col gap-2 shrink-0">
                  <button
                    type="button"
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-50 transition-colors"
                    onClick={() => startEdit(product)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="flex-1 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                    onClick={() => setDeleteTarget(product.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {filteredProducts.length === 0 && (
          <div className="py-8 text-center text-slate-500">
            <p>No products found.</p>
          </div>
        )}
      </div>
      <Pagination
        currentPage={productList.page}
        totalItems={filteredProducts.length}
        pageSize={productList.itemsPerPage}
        onPageChange={productList.setPage}
      />

      <ConfirmModal
        open={deleteTarget !== null}
        title="Delete Product?"
        message="Are you sure you want to permanently delete this product? This action cannot be undone."
        confirmLabel="Yes, Delete"
        cancelLabel="Cancel"
        variant="danger"
        loading={deleteProduct.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          try {
            await deleteProduct.mutateAsync(deleteTarget);
            setDeleteTarget(null);
            toast.success("Product deleted successfully");
          } catch {
            toast.error("Delete failed");
          }
        }}
      />
    </div>
  );
};
