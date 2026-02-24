import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Filter } from "lucide-react";
import toast from "react-hot-toast";

import { useOrders, useCancelOrder } from "../../features/orders/orderHooks";
import { useCancelPaidOrder } from "../../features/payment/paymentHooks";
import { useClientFilter } from "../../hooks/useClientFilter";
import { Pagination } from "../Pagination";
import { ConfirmModal } from "../ConfirmModal";

export const DashboardOrders = () => {
  const ordersQuery = useOrders(true);
  const cancelOrder = useCancelOrder();
  const cancelPaidOrder = useCancelPaidOrder();

  const [cancelTarget, setCancelTarget] = useState<{
    orderId: string;
    type: "pending" | "paid";
    total: number;
  } | null>(null);

  const orderList = useClientFilter({
    data: ordersQuery.data,
    searchFields: ["id", (order) => order.shippingDetails.recipientName],
  });

  const filteredOrders = orderList.filteredData.filter(
    (o) => !orderList.filter || o.status === orderList.filter,
  );
  const pagedOrders = orderList.paginate(filteredOrders);

  if (ordersQuery.isLoading) {
    return (
      <div className="py-8 text-center text-slate-500">Loading orders...</div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <h2 className="text-xl font-semibold">Recent Orders</h2>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              id="order-search"
              name="orderSearch"
              type="text"
              placeholder="Search orders..."
              className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-brand-600 focus:ring-1 focus:ring-brand-600 w-full sm:w-48"
              value={orderList.search}
              onChange={(e) => {
                orderList.setSearch(e.target.value);
                orderList.setPage(1);
              }}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <select
              id="order-filter"
              name="orderFilter"
              className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-brand-600 bg-white w-full sm:w-40"
              value={orderList.filter}
              onChange={(e) => {
                orderList.setFilter(e.target.value);
                orderList.setPage(1);
              }}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="shipped">Shipped</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>
      <div className="mt-4 space-y-3">
        {pagedOrders.map((order) => (
          <div
            key={order.id}
            className="rounded-lg border border-slate-200 p-4 hover:border-brand-500 transition-colors"
          >
            <p className="font-semibold text-lg">
              Order #{order.id.slice(0, 8)}
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              <div className="text-sm text-slate-600">
                <span className="font-medium">Status:</span>{" "}
                <span
                  className={`capitalize ${order.status === "paid" ? "text-green-600 font-semibold" : order.status === "cancelled" ? "text-red-500" : ""}`}
                >
                  {order.status}
                </span>
              </div>
              <div className="text-sm text-slate-600">
                <span className="font-medium">Total:</span> $
                {order.totalAmount.toFixed(2)}
              </div>
              <div className="text-sm text-slate-600 content-start">
                <span className="font-medium">Recipient:</span>{" "}
                {order.shippingDetails.recipientName}
              </div>
              <div className="col-span-full font-medium text-sm text-slate-600 mt-1">
                Shipping Address:{" "}
                <span className="font-normal">
                  {order.shippingDetails.address}
                </span>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              {order.status === "pending" && (
                <button
                  type="button"
                  className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50 transition-colors"
                  onClick={() =>
                    setCancelTarget({
                      orderId: order.id,
                      type: "pending",
                      total: order.totalAmount,
                    })
                  }
                >
                  Cancel Order
                </button>
              )}
              {order.status === "paid" && (
                <button
                  type="button"
                  className="rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors"
                  onClick={() =>
                    setCancelTarget({
                      orderId: order.id,
                      type: "paid",
                      total: order.totalAmount,
                    })
                  }
                >
                  Cancel & Refund
                </button>
              )}
            </div>
          </div>
        ))}
        {filteredOrders.length === 0 && (
          <div className="py-8 text-center text-slate-500">
            <p>No orders found.</p>
            {orderList.search === "" && orderList.filter === "" && (
              <Link
                to="/products"
                className="text-brand-700 hover:underline mt-2 inline-block"
              >
                Start shopping
              </Link>
            )}
          </div>
        )}
      </div>
      <Pagination
        currentPage={orderList.page}
        totalItems={filteredOrders.length}
        pageSize={orderList.itemsPerPage}
        onPageChange={orderList.setPage}
      />

      <ConfirmModal
        open={cancelTarget !== null}
        title={
          cancelTarget?.type === "paid"
            ? "Cancel Order & Request Refund?"
            : "Cancel Order?"
        }
        message={
          cancelTarget?.type === "paid"
            ? `This will cancel your order and initiate a refund of $${cancelTarget?.total.toFixed(2)} to your original payment method. This action cannot be undone.`
            : "Are you sure you want to cancel this order? This action cannot be undone."
        }
        confirmLabel={
          cancelTarget?.type === "paid"
            ? "Yes, Cancel & Refund"
            : "Yes, Cancel Order"
        }
        cancelLabel="Keep Order"
        variant="danger"
        loading={cancelOrder.isPending || cancelPaidOrder.isPending}
        onCancel={() => setCancelTarget(null)}
        onConfirm={async () => {
          if (!cancelTarget) return;
          try {
            if (cancelTarget.type === "paid") {
              await cancelPaidOrder.mutateAsync(cancelTarget.orderId);
            } else {
              await cancelOrder.mutateAsync(cancelTarget.orderId);
            }
            setCancelTarget(null);
          } catch {
            toast.error(
              cancelTarget.type === "paid"
                ? "Cancel & refund failed"
                : "Cancel failed",
            );
          }
        }}
      />
    </div>
  );
};
