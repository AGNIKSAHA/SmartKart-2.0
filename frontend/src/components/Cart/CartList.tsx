import { Search } from "lucide-react";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";

import {
  useRemoveCartItem,
  useUpsertCartItem,
} from "../../features/cart/cartHooks";
import { Pagination } from "../Pagination";

import type { CartLine } from "../../types/api";

type CartListOptions = {
  search: string;
  setSearch: (val: string) => void;
  setPage: (val: number) => void;
  filteredData: CartLine[];
  page: number;
  itemsPerPage: number;
};

type Props = {
  cartList: CartListOptions;
  pagedLines: CartLine[];
};

export const CartList = ({ cartList, pagedLines }: Props) => {
  const removeItem = useRemoveCartItem();
  const upsertItem = useUpsertCartItem();

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Your Cart</h1>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search cart..."
            className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-brand-600 focus:ring-1 focus:ring-brand-600 w-full sm:w-64"
            value={cartList.search}
            onChange={(e) => {
              cartList.setSearch(e.target.value);
              cartList.setPage(1);
            }}
          />
        </div>
      </div>
      <div className="mt-6 space-y-3">
        {pagedLines.map((line) => (
          <div
            key={line.productId}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4"
          >
            <div>
              <p className="font-semibold">
                {line.product?.title ?? line.productId}
              </p>
              <p className="text-sm text-slate-500">
                ${(line.product?.price ?? 0).toFixed(2)} each
              </p>
              <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                <span>Qty:</span>
                <button
                  type="button"
                  className="rounded border border-slate-300 px-2"
                  disabled={line.quantity <= 1 || upsertItem.isPending}
                  onClick={async () => {
                    try {
                      await upsertItem.mutateAsync({
                        productId: line.productId,
                        quantity: line.quantity - 1,
                      });
                    } catch (error) {
                      if (isAxiosError(error)) {
                        toast.error(
                          error.response?.data?.message ||
                            "Quantity update failed",
                        );
                      } else {
                        toast.error("Quantity update failed");
                      }
                    }
                  }}
                >
                  -
                </button>
                <span className="min-w-6 text-center font-medium">
                  {line.quantity}
                </span>
                <button
                  type="button"
                  className="rounded border border-slate-300 px-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={
                    upsertItem.isPending ||
                    (line.product?.stock !== undefined &&
                      line.quantity >= line.product.stock)
                  }
                  onClick={async () => {
                    try {
                      await upsertItem.mutateAsync({
                        productId: line.productId,
                        quantity: line.quantity + 1,
                      });
                    } catch (error) {
                      if (isAxiosError(error)) {
                        toast.error(
                          error.response?.data?.message ||
                            "Quantity update failed",
                        );
                      } else {
                        toast.error("Quantity update failed");
                      }
                    }
                  }}
                >
                  +
                </button>
                <span className="ml-4 text-xs font-medium">
                  {line.product?.stock === 0 ? (
                    <span className="text-red-500 uppercase tracking-tighter">
                      Out of Stock
                    </span>
                  ) : line.product?.stock !== undefined &&
                    line.product.stock <= 5 ? (
                    <span className="text-amber-600">
                      Only {line.product.stock} left
                    </span>
                  ) : (
                    <span className="text-slate-400">
                      {line.product?.stock} in stock
                    </span>
                  )}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <p className="font-semibold text-brand-700">
                ${((line.product?.price ?? 0) * line.quantity).toFixed(2)}
              </p>
              <button
                type="button"
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 transition"
                onClick={async () => {
                  try {
                    await removeItem.mutateAsync(line.productId);
                  } catch {
                    toast.error("Remove failed");
                  }
                }}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        {cartList.filteredData.length === 0 && (
          <div className="py-8 text-center text-slate-500">
            <p>No items match your search.</p>
          </div>
        )}
      </div>
      <Pagination
        currentPage={cartList.page}
        totalItems={cartList.filteredData.length}
        pageSize={cartList.itemsPerPage}
        onPageChange={cartList.setPage}
      />
    </>
  );
};
