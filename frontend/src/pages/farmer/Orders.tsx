import { useState, useEffect } from "react";
import { farmerApi, orderApi } from "../../services/api";
import Table from "../../components/common/Table";
import KpiCard from "../../components/common/KpiCard";
import { Order } from "../../types";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  CONFIRMED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  SHIPPED: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  DELIVERED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  CANCELLED: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
};
const PAYMENT_STYLES: Record<string, string> = {
  PAID: "text-emerald-600 dark:text-emerald-400",
  UNPAID: "text-amber-600 dark:text-amber-400",
  REFUNDED: "text-red-600 dark:text-red-400",
};

export default function FarmerOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    farmerApi.getOrders().then((res) => setOrders(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const update = async (id: string, status: string) => {
    setActionId(id);
    try {
      await orderApi.updateStatus(id, { orderStatus: status });
      setOrders(orders.map((o) => (o.id === id ? { ...o, orderStatus: status as any } : o)));
    } catch (err) { console.error(err); }
    finally { setActionId(null); }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-[3px] border-primary-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-navy-400 animate-pulse">Loading orders...</span>
      </div>
    </div>
  );

  const pending = orders.filter((o) => o.orderStatus === "PENDING");
  const confirmed = orders.filter((o) => o.orderStatus === "CONFIRMED");
  const shipped = orders.filter((o) => o.orderStatus === "SHIPPED");
  const delivered = orders.filter((o) => o.orderStatus === "DELIVERED");
  const revenue = delivered.reduce((a, o) => a + Number(o.totalPrice), 0);
  const filtered = filter === "ALL" ? orders : orders.filter((o) => o.orderStatus === filter);

  const columns = [
    { key: "crop", header: "Crop", render: (o: Order) => o.crop?.cropName || "—" },
    { key: "buyer", header: "Buyer", render: (o: Order) => (
      <div>
        <span className="text-sm font-medium text-navy-900 dark:text-white">{o.buyer?.user?.fullName || "—"}</span>
        {o.buyer?.user?.phone && <p className="text-xs text-navy-400">{o.buyer.user.phone}</p>}
      </div>
    )},
    { key: "quantityKg", header: "Qty", render: (o: Order) => `${o.quantityKg} kg` },
    { key: "totalPrice", header: "Total", render: (o: Order) => (
      <span className="font-medium">TSh {o.totalPrice.toLocaleString()}</span>
    )},
    { key: "orderStatus", header: "Status", render: (o: Order) => (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[o.orderStatus] || "bg-navy-100 text-navy-600"}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${o.orderStatus === "DELIVERED" ? "bg-emerald-500" : o.orderStatus === "CANCELLED" ? "bg-red-500" : o.orderStatus === "PENDING" ? "bg-amber-500" : o.orderStatus === "SHIPPED" ? "bg-purple-500" : "bg-blue-500"}`} />
        {o.orderStatus}
      </span>
    )},
    { key: "paymentStatus", header: "Payment", render: (o: Order) => (
      <span className={`text-xs font-medium ${PAYMENT_STYLES[o.paymentStatus] || "text-navy-400"}`}>{o.paymentStatus}</span>
    )},
    { key: "actions", header: "", render: (o: Order) => (
      <div className="flex gap-1.5">
        {o.orderStatus === "PENDING" && (
          <>
            <button onClick={() => update(o.id, "CONFIRMED")} disabled={actionId === o.id}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 font-medium transition-colors">
              Accept
            </button>
            <button onClick={() => update(o.id, "CANCELLED")} disabled={actionId === o.id}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 disabled:opacity-50 font-medium transition-colors">
              Decline
            </button>
          </>
        )}
        {o.orderStatus === "CONFIRMED" && (
          <button onClick={() => update(o.id, "SHIPPED")} disabled={actionId === o.id}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 font-medium transition-colors">
            Mark shipped
          </button>
        )}
        {o.orderStatus === "SHIPPED" && (
          <button onClick={() => update(o.id, "DELIVERED")} disabled={actionId === o.id}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 font-medium transition-colors">
            Confirm delivery
          </button>
        )}
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-down">
        <span className="label">Orders</span>
        <h1 className="text-2xl font-bold text-navy-900 dark:text-white mt-1">Incoming Orders</h1>
        <p className="text-sm text-navy-400 mt-0.5">
          {orders.length} total · {pending.length} pending · TSh {revenue.toLocaleString()} revenue
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="animate-fade-in-up"><KpiCard label="Total" value={orders.length} icon="📦" /></div>
        <div className="animate-fade-in-up" style={{ animationDelay: "0.06s" }}>
          <div className="card p-5">
            <span className="label">Pending</span>
            <div className="flex items-center gap-2 mt-2">
              <span className={`w-2 h-2 rounded-full ${pending.length > 0 ? "bg-amber-500 animate-pulse" : "bg-navy-300"}`} />
              <span className="kpi-value text-lg text-navy-900 dark:text-white">{pending.length}</span>
            </div>
          </div>
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: "0.12s" }}><KpiCard label="Confirmed" value={confirmed.length} /></div>
        <div className="animate-fade-in-up" style={{ animationDelay: "0.18s" }}><KpiCard label="Shipped" value={shipped.length} /></div>
        <div className="animate-fade-in-up" style={{ animationDelay: "0.24s" }}><KpiCard label="Delivered" value={delivered.length} /></div>
      </div>

      <div className="flex gap-1.5 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
        {["ALL", "PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
              filter === s
                ? "bg-primary-500 text-white shadow-sm"
                : "bg-navy-50 dark:bg-navy-800 text-navy-500 dark:text-navy-300 hover:bg-navy-100 dark:hover:bg-navy-700"
            }`}>
            {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center animate-fade-in-up">
          <svg className="w-16 h-16 mx-auto text-navy-300 dark:text-navy-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
          <p className="text-navy-400 mb-1">
            {filter === "ALL" ? "No orders received yet" : `No ${filter.toLowerCase()} orders`}
          </p>
          <p className="text-xs text-navy-300">Orders will appear here when buyers purchase your crops</p>
        </div>
      ) : (
        <div className="animate-fade-in-up" style={{ animationDelay: "0.35s" }}>
          <Table columns={columns} data={filtered} />
        </div>
      )}
    </div>
  );
}
