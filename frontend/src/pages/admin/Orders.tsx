import { useState, useEffect } from "react";
import { adminApi, orderApi } from "../../services/api";
import Table from "../../components/common/Table";

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getOrders().then((res) => setOrders(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const update = async (id: string, orderStatus: string) => {
    try {
      await orderApi.updateStatus(id, { orderStatus });
      setOrders(orders.map((o) => (o.id === id ? { ...o, orderStatus } : o)));
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-900 dark:text-white">All Orders</h1>
        <p className="text-sm text-navy-400 mt-1">{orders.length} total orders</p>
      </div>

      <Table
        columns={[
          { key: "crop", header: "Crop", render: (o: any) => o.crop?.cropName || "—" },
          { key: "buyer", header: "Buyer", render: (o: any) => o.buyer?.user.fullName || "—" },
          { key: "quantityKg", header: "Qty", render: (o: any) => `${o.quantityKg} kg` },
          { key: "totalPrice", header: "Total", render: (o: any) => `TSh ${o.totalPrice.toLocaleString()}` },
          { key: "orderStatus", header: "Status", render: (o: any) => (
            <span className={`status-${
              o.orderStatus === "DELIVERED" ? "green" :
              o.orderStatus === "CANCELLED" ? "red" :
              o.orderStatus === "SHIPPED" ? "blue" : "yellow"
            }`}>{o.orderStatus}</span>
          )},
          { key: "paymentStatus", header: "Payment", render: (o: any) => (
            <span className={o.paymentStatus === "PAID" ? "status-green" : "status-yellow"}>{o.paymentStatus}</span>
          )},
          { key: "actions", header: "", render: (o: any) => (
            <select value={o.orderStatus} onChange={(e) => update(o.id, e.target.value)}
              className="text-xs border border-navy-200 dark:border-navy-600 rounded-lg px-2 py-1 bg-transparent text-navy-700 dark:text-navy-200">
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          )},
        ]}
        data={orders}
      />
    </div>
  );
}
