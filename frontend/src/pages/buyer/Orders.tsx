import { useState, useEffect } from "react";
import { orderApi } from "../../services/api";
import Table from "../../components/common/Table";
import { Order } from "../../types";
import { Link } from "react-router-dom";

export default function BuyerOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderApi.getMine().then((res) => setOrders(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-900 dark:text-white">My Orders</h1>
        <p className="text-sm text-navy-400 mt-1">{orders.length} order{orders.length !== 1 ? "s" : ""}</p>
      </div>

      {orders.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-navy-400 mb-4">No orders placed yet</p>
          <Link to="/buyer" className="btn-primary">Browse crops</Link>
        </div>
      ) : (
        <Table
          columns={[
            { key: "crop", header: "Crop", render: (o: Order) => o.crop?.cropName || "—" },
            { key: "quantityKg", header: "Qty", render: (o: Order) => `${o.quantityKg} kg` },
            { key: "totalPrice", header: "Total", render: (o: Order) => `TSh ${o.totalPrice.toLocaleString()}` },
            { key: "orderStatus", header: "Status", render: (o: Order) => (
              <span className={`status-${
                o.orderStatus === "DELIVERED" ? "green" :
                o.orderStatus === "CANCELLED" ? "red" :
                o.orderStatus === "SHIPPED" ? "blue" :
                o.orderStatus === "CONFIRMED" ? "yellow" : "yellow"
              }`}>{o.orderStatus}</span>
            )},
            { key: "paymentStatus", header: "Payment", render: (o: Order) => (
              <span className={o.paymentStatus === "PAID" ? "status-green" : "status-yellow"}>{o.paymentStatus}</span>
            )},
            { key: "deliveryLocation", header: "Deliver to", render: (o: Order) => o.deliveryLocation || "—" },
            { key: "createdAt", header: "Date", render: (o: Order) => new Date(o.createdAt).toLocaleDateString() },
          ]}
          data={orders}
        />
      )}
    </div>
  );
}
