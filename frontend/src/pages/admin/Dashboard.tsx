import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../../services/api";
import KpiCard from "../../components/common/KpiCard";
import Table from "../../components/common/Table";
import { Order, Farmer, CropListing } from "../../types";

export default function AdminDashboard() {
  const [overview, setOverview] = useState<any>(null);
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [crops, setCrops] = useState<CropListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminApi.getOverview(),
      adminApi.getFarmers(),
      adminApi.getOrders(),
      adminApi.getCrops(),
    ])
      .then(([oRes, fRes, ordRes, cRes]) => {
        setOverview(oRes.data);
        setFarmers(Array.isArray(fRes.data) ? fRes.data : []);
        setOrders(Array.isArray(ordRes.data) ? ordRes.data : []);
        setCrops(Array.isArray(cRes.data) ? cRes.data : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-[3px] border-primary-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-navy-400 animate-pulse">Loading platform data...</span>
      </div>
    </div>
  );

  const verifiedFarmers = farmers.filter((f) => f.verificationStatus === "VERIFIED");
  const pendingFarmers = farmers.filter((f) => f.verificationStatus === "PENDING");
  const pendingOrders = orders.filter((o) => o.orderStatus === "PENDING");
  const deliveredOrders = orders.filter((o) => o.orderStatus === "DELIVERED");
  const revenue = overview?.totalRevenue || 0;

  const gradeDistribution = crops.reduce((acc: Record<string, number>, c) => {
    const g = c.qualityGrade || "NONE";
    acc[g] = (acc[g] || 0) + 1;
    return acc;
  }, {});
  const gradeColors: Record<string, string> = { A: "bg-green-500", B: "bg-amber-500", C: "bg-red-500", NONE: "bg-navy-300" };
  const gradeMax = Math.max(...Object.values(gradeDistribution), 1);

  const farmerColumns = [
    { key: "name", header: "Name", render: (f: Farmer) => f.user?.fullName || "—" },
    { key: "phone", header: "Phone", render: (f: Farmer) => f.user?.phone || "—" },
    { key: "region", header: "Region", render: (f: Farmer) => f.region || "—" },
    { key: "verificationStatus", header: "Status", render: (f: Farmer) =>
      <span className={`status-${f.verificationStatus === "VERIFIED" ? "green" : f.verificationStatus === "PENDING" ? "yellow" : "red"}`}>
        {f.verificationStatus}
      </span>
    },
  ];

  const orderColumns = [
    { key: "id", header: "ID", render: (o: Order) => o.id.slice(0, 8) + "…" },
    { key: "crop", header: "Crop", render: (o: Order) => o.crop?.cropName || "—" },
    { key: "buyer", header: "Buyer", render: (o: Order) => o.buyer?.user?.fullName || "—" },
    { key: "totalPrice", header: "Amount", render: (o: Order) => `TSh ${o.totalPrice.toLocaleString()}` },
    { key: "status", header: "Status", render: (o: Order) =>
      <span className={`status-${o.orderStatus === "DELIVERED" ? "green" : o.orderStatus === "PENDING" ? "yellow" : o.orderStatus === "SHIPPED" ? "blue" : "red"}`}>
        {o.orderStatus}
      </span>
    },
  ];

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-down">
        <span className="label">Admin Panel</span>
        <h1 className="text-2xl font-bold text-navy-900 dark:text-white mt-1">Platform Overview</h1>
        <p className="text-sm text-navy-400 mt-0.5">
          {farmers.length} farmers · {orders.length} orders · TSh {revenue.toLocaleString()} revenue
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          { label: "Farmers", value: overview?.totalFarmers || 0, icon: "🌱", subtext: `${verifiedFarmers.length} verified` },
          { label: "Buyers", value: overview?.totalBuyers || 0, icon: "🏪" },
          { label: "Active listings", value: overview?.activeListings || 0, icon: "📋" },
          { label: "Orders", value: overview?.totalOrders || 0, icon: "📦", subtext: `${pendingOrders.length} pending` },
          { label: "Assessments", value: overview?.totalAssessments || 0, icon: "🔬" },
          { label: "Revenue", value: `TSh ${revenue.toLocaleString()}`, icon: "💰" },
        ].map((c, i) => (
          <div key={c.label} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.08}s` }}>
            <KpiCard label={c.label} value={c.value} icon={<span className="text-lg">{c.icon}</span>} subtext={c.subtext} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
          <div className="card p-6">
            <h3 className="section-title mb-4">Crop Grade Distribution</h3>
            {Object.keys(gradeDistribution).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(gradeDistribution)
                  .sort(([a], [b]) => (b === "NONE" ? -1 : a.localeCompare(b)))
                  .map(([grade, count]) => (
                    <div key={grade} className="flex items-center gap-3">
                      <span className="text-sm font-medium text-navy-600 dark:text-navy-300 w-10">{grade === "NONE" ? "—" : grade}</span>
                      <div className="flex-1 h-5 bg-navy-100 dark:bg-navy-700 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-700 ${gradeColors[grade] || "bg-navy-300"}`}
                          style={{ width: `${(count / gradeMax) * 100}%` }} />
                      </div>
                      <span className="text-sm text-navy-400 w-8 text-right">{count}</span>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-navy-400 text-sm py-8 text-center">No grades assigned yet</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-3 animate-fade-in-up" style={{ animationDelay: "0.55s" }}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: "Verify Farmers", desc: `${pendingFarmers.length} pending`, path: "/admin/users", color: "from-primary-500 to-emerald-600", icon: "👥" },
              { label: "Crop Listings", desc: `${crops.length} total`, path: "/admin/crops", color: "from-teal-500 to-cyan-600", icon: "📋" },
              { label: "Orders", desc: `${pendingOrders.length} pending`, path: "/admin/orders", color: "from-amber-500 to-orange-600", icon: "📦" },
              { label: "Sensors", desc: "IoT device status", path: "/admin/sensors", color: "from-blue-500 to-indigo-600", icon: "🔌" },
              { label: "Reports", desc: "Analytics & insights", path: "/admin/reports", color: "from-purple-500 to-pink-600", icon: "📊" },
            ].map((link, i) => (
              <Link key={link.path} to={link.path}
                className="group relative overflow-hidden rounded-2xl p-5 bg-white/80 dark:bg-navy-800/80 backdrop-blur-sm border border-navy-100/60 dark:border-navy-700/60 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br ${link.color}`} />
                <div className="relative">
                  <span className="text-2xl mb-2 block">{link.icon}</span>
                  <p className="font-medium text-navy-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{link.label}</p>
                  <p className="text-xs text-navy-400 mt-1">{link.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Recent Farmers</h2>
            <Link to="/admin/users" className="text-sm text-primary-600 font-medium hover:text-primary-700 transition-colors">View all →</Link>
          </div>
          <Table columns={farmerColumns} data={farmers.slice(0, 5)} />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: "0.7s" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Recent Orders</h2>
            <Link to="/admin/orders" className="text-sm text-primary-600 font-medium hover:text-primary-700 transition-colors">View all →</Link>
          </div>
          <Table columns={orderColumns} data={orders.slice(0, 5)} />
        </div>
      </div>
    </div>
  );
}
