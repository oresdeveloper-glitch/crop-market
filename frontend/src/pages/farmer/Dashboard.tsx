import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { farmerApi, BACKEND_URL } from "../../services/api";
import KpiCard from "../../components/common/KpiCard";
import QualityGauge from "../../components/common/QualityGauge";
import SensorProgress from "../../components/common/SensorProgress";
import Table from "../../components/common/Table";
import { CropListing, Order } from "../../types";

export default function FarmerDashboard() {
  const [listings, setListings] = useState<CropListing[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [liveData, setLiveData] = useState<any>(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    Promise.all([farmerApi.getProfile(), farmerApi.getListings(), farmerApi.getOrders()])
      .then(([profRes, listRes, ordRes]) => {
        setProfile(profRes.data);
        setListings(listRes.data);
        setOrders(ordRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const socket = io(BACKEND_URL || "/", { transports: ["websocket", "polling"] });
    socketRef.current = socket;
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("sensor-update", (payload) => setLiveData(payload));
    return () => { socket.disconnect(); };
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-[3px] border-primary-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-navy-400 animate-pulse">Loading your farm data...</span>
      </div>
    </div>
  );

  const active = listings.filter((l) => l.status === "AVAILABLE");
  const revenue = listings.filter((l) => l.status === "SOLD").reduce((a, l) => a + l.quantityKg * l.pricePerKg, 0);
  const totalKg = listings.reduce((a, l) => a + l.quantityKg, 0);
  const pendingOrders = orders.filter((o) => o.orderStatus === "PENDING");

  const latestQuality = [...listings].sort((a, b) => {
    const aDate = a.qualityAssessments?.[0]?.assessedAt || a.createdAt;
    const bDate = b.qualityAssessments?.[0]?.assessedAt || b.createdAt;
    return new Date(bDate).getTime() - new Date(aDate).getTime();
  })[0];

  const qualityScore = liveData?.qualityScore || latestQuality?.qualityScore || 0;
  const qualityGrade = liveData?.grade || latestQuality?.qualityGrade || "N/A";

  const temp = liveData?.temperature ?? listings[0]?.sensorData?.[0]?.temperature;
  const hum = liveData?.humidity ?? listings[0]?.sensorData?.[0]?.humidity;
  const moist = liveData?.moisture ?? listings[0]?.sensorData?.[0]?.moisture;
  const hasSensor = temp !== undefined && temp !== null;

  const orderColumns = [
    { key: "id", header: "ID", render: (o: Order) => o.id.slice(0, 8) + "…" },
    { key: "cropName", header: "Crop", render: (o: Order) => o.crop?.cropName || "—" },
    { key: "quantityKg", header: "Qty", render: (o: Order) => `${o.quantityKg} kg` },
    { key: "totalPrice", header: "Total", render: (o: Order) => `TSh ${o.totalPrice.toLocaleString()}` },
    { key: "orderStatus", header: "Status", render: (o: Order) =>
      <span className={`status-${o.orderStatus === "DELIVERED" ? "green" : o.orderStatus === "PENDING" ? "yellow" : o.orderStatus === "SHIPPED" ? "blue" : "red"}`}>
        {o.orderStatus}
      </span>
    },
    { key: "paymentStatus", header: "Payment", render: (o: Order) =>
      <span className={`${o.paymentStatus === "PAID" ? "text-green-600" : o.paymentStatus === "UNPAID" ? "text-amber-600" : "text-red-600"} text-xs font-medium`}>{o.paymentStatus}</span>
    },
  ];

  const cropColumns = [
    { key: "cropName", header: "Crop" },
    { key: "quantityKg", header: "Qty", render: (c: CropListing) => `${c.quantityKg} kg` },
    { key: "pricePerKg", header: "Price/kg", render: (c: CropListing) => `TSh ${c.pricePerKg.toLocaleString()}` },
    { key: "qualityGrade", header: "Grade", render: (c: CropListing) =>
      c.qualityGrade
        ? <span className={`status-${c.qualityGrade === "A" ? "green" : c.qualityGrade === "B" ? "yellow" : "red"}`}>{c.qualityGrade}</span>
        : <span className="text-navy-400">—</span>
    },
    { key: "status", header: "Status", render: (c: CropListing) =>
      <span className={`${c.status === "AVAILABLE" ? "status-green" : "status-yellow"}`}>{c.status}</span>
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-in-down">
        <div>
          <span className="label">Farmer Dashboard</span>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white mt-1">Welcome back, {profile?.user?.fullName?.split(" ")[0] || "Farmer"}</h1>
          <p className="text-sm text-navy-400 mt-0.5">{active.length} active crops · {profile?.region || "Set your location"}</p>
        </div>
        <Link to="/farmer/add-crop" className="btn-primary">+ New crop</Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="animate-fade-in-up"><KpiCard label="Active crops" value={active.length} icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>} /></div>
        <div className="animate-fade-in-up" style={{ animationDelay: "0.08s" }}><KpiCard label="Total volume" value={`${totalKg.toLocaleString()} kg`} icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>} /></div>
        <div className="animate-fade-in-up" style={{ animationDelay: "0.16s" }}><KpiCard label="Revenue" value={`TSh ${revenue.toLocaleString()}`} trend={revenue > 0 ? { value: `${listings.filter(l => l.status === "SOLD").length} sold`, positive: true } : undefined} icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} /></div>
        <div className="animate-fade-in-up" style={{ animationDelay: "0.24s" }}>
          <div className="card p-5">
            <span className="label">Verification</span>
            <div className="flex items-center gap-2 mt-2">
              <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${profile?.verificationStatus === "VERIFIED" ? "bg-green-500" : "bg-amber-500"}`} />
              <span className="kpi-value text-lg text-navy-900 dark:text-white">{profile?.verificationStatus}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
        <Link to="/farmer/listings" className="group relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-primary-500/10 to-teal-500/10 dark:from-primary-500/5 dark:to-teal-500/5 border border-primary-200/50 dark:border-primary-700/30 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primary-600 dark:text-primary-400 font-medium">My Listings</p>
              <p className="text-xs text-navy-400 mt-0.5">{listings.length} total · {active.length} active</p>
            </div>
            <svg className="w-8 h-8 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
          </div>
        </Link>
        <Link to="/farmer/orders" className="group relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:from-amber-500/5 dark:to-orange-500/5 border border-amber-200/50 dark:border-amber-700/30 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">Orders</p>
              <p className="text-xs text-navy-400 mt-0.5">{orders.length} total · {pendingOrders.length} pending</p>
            </div>
            <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          <div className="card p-6 flex flex-col items-center justify-center min-h-[280px] relative overflow-hidden">
            <div className="absolute inset-0 gradient-subtle" />
            <div className="relative w-full flex flex-col items-center">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="section-title mb-0">Crop Quality</h3>
                {connected && (
                  <span className="flex items-center gap-1 text-[10px] text-green-500 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> LIVE
                  </span>
                )}
              </div>
              <QualityGauge score={qualityScore} grade={qualityGrade} />
              {qualityGrade && (
                <div className="mt-4 text-center">
                  <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${
                    qualityGrade === "A" ? "text-green-600" : qualityGrade === "B" ? "text-amber-600" : "text-red-600"
                  }`}>
                    <span className={`w-2 h-2 rounded-full animate-pulse ${
                      qualityGrade === "A" ? "bg-green-500" : qualityGrade === "B" ? "bg-amber-500" : "bg-red-500"
                    }`} />
                    {qualityGrade === "A" ? "Excellent quality" : qualityGrade === "B" ? "Average quality" : "Needs improvement"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
          <div className="card p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="section-title mb-0">Latest Sensor Readings</h3>
              <Link to="/farmer/live-sensor" className="text-xs text-primary-600 font-medium hover:text-primary-700 transition-colors">Live view →</Link>
            </div>
            {hasSensor ? (
              <div className="space-y-4">
                <SensorProgress label="Temperature" value={temp} unit="°C" max={50} />
                <SensorProgress label="Humidity" value={hum} unit="%" />
                <SensorProgress label="Soil Moisture" value={moist} unit="%" />
                {liveData && (
                  <p className="text-[10px] text-navy-400 text-right">Updated {new Date(liveData.timestamp).toLocaleTimeString()}</p>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-navy-400">
                <svg className="w-12 h-12 mb-3 text-navy-300 dark:text-navy-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" /></svg>
                <p className="text-sm">No sensor data yet</p>
                <p className="text-xs mt-1">Start your Wokwi ESP32 simulation to see live readings</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Recent Listings</h2>
            <Link to="/farmer/listings" className="text-sm text-primary-600 font-medium hover:text-primary-700 transition-colors">View all →</Link>
          </div>
          <Table
            columns={cropColumns}
            data={listings.slice(0, 5)}
          />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: "0.7s" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Recent Orders</h2>
            <Link to="/farmer/orders" className="text-sm text-primary-600 font-medium hover:text-primary-700 transition-colors">View all →</Link>
          </div>
          <Table
            columns={orderColumns}
            data={orders.slice(0, 5)}
          />
        </div>
      </div>
    </div>
  );
}
