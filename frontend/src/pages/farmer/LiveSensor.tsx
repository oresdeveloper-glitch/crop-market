import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import QualityGauge from "../../components/common/QualityGauge";
import KpiCard from "../../components/common/KpiCard";
import api from "../../services/api";

export default function LiveSensor() {
  const [data, setData] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [connected, setConnected] = useState(false);
  const [timeAgo, setTimeAgo] = useState("");
  const [simulating, setSimulating] = useState(false);
  const [loadingLatest, setLoadingLatest] = useState(true);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    api.get("/iot/latest").then((res) => {
      if (res.data) {
        setData(res.data);
        setHistory([{ ...res.data, time: new Date(res.data.timestamp).toLocaleTimeString() }]);
      }
    }).catch(() => {}).finally(() => setLoadingLatest(false));
  }, []);

  const simulate = async () => {
    setSimulating(true);
    try { await api.post("/iot/simulate"); } catch { }
    setTimeout(() => setSimulating(false), 1500);
  };

  useEffect(() => {
    const socket = io("/", { transports: ["websocket", "polling"] });
    socketRef.current = socket;
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("sensor-update", (payload) => {
      setData(payload);
      setHistory((prev) => [...prev.slice(-29), { ...payload, time: new Date().toLocaleTimeString() }]);
    });
    return () => { socket.disconnect(); };
  }, []);

  useEffect(() => {
    if (!data?.timestamp) { setTimeAgo(""); return; }
    const update = () => {
      const diff = Date.now() - new Date(data.timestamp).getTime();
      if (diff < 1000) { setTimeAgo("just now"); return; }
      const s = Math.floor(diff / 1000);
      if (s < 60) { setTimeAgo(`${s}s ago`); return; }
      const m = Math.floor(s / 60);
      if (m < 60) { setTimeAgo(`${m}m ago`); return; }
      setTimeAgo(`${Math.floor(m / 60)}h ago`);
    };
    update();
    const id = setInterval(update, 5000);
    return () => clearInterval(id);
  }, [data?.timestamp]);

  const avg = (key: string) => history.length > 0
    ? (history.reduce((a: number, h: any) => a + (h[key] || 0), 0) / history.length).toFixed(1)
    : "—";

  const latest = (key: string) => history.length > 0
    ? Math.max(...history.map((h: any) => h[key] || 0))
    : 0;

  const trend = history.length > 1
    ? { value: `${history.length} readings`, positive: history[history.length - 1]?.temperature >= history[0]?.temperature }
    : undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-in-down">
        <div>
          <span className="label">Live Monitoring</span>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white mt-1">Real-Time Sensor Data</h1>
          <p className="text-sm text-navy-400 mt-0.5">
            WebSocket · {history.length} records{timeAgo && ` · last update ${timeAgo}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={simulate} disabled={simulating}
            className="text-xs px-3 py-1.5 rounded-lg bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-50 font-medium transition-colors flex items-center gap-1.5">
            <svg className={`w-3.5 h-3.5 ${simulating ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            {simulating ? "Sending..." : "Simulate"}
          </button>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${connected ? "bg-green-500 animate-pulse-slow" : "bg-red-500"}`} />
            <span className="text-xs text-navy-400">{connected ? "Connected" : "Disconnected"}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="animate-fade-in-up" style={{ animationDelay: "0s" }}>
          <KpiCard label="Temperature" value={data ? `${data.temperature}°C` : "—"} icon="🌡️" trend={trend} />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: "0.08s" }}>
          <KpiCard label="Humidity" value={data ? `${data.humidity}%` : "—"} icon="💧" />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: "0.16s" }}>
          <KpiCard label="Soil Moisture" value={data ? `${data.moisture}%` : "—"} icon="🌱" />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: "0.24s" }}>
          <KpiCard label="Quality Score" value={data ? `${data.qualityScore?.toFixed(1)}` : "—"} icon="⭐" subtext={data?.grade ? `Grade ${data.grade}` : undefined} />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <KpiCard label="Avg Temperature" value={`${avg("temperature")}°C`} icon="📊" />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: "0.35s" }}>
          <KpiCard label="Avg Humidity" value={`${avg("humidity")}%`} icon="📊" />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          <KpiCard label="Avg Moisture" value={`${avg("moisture")}%`} icon="📊" />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: "0.45s" }}>
          <KpiCard label="Peak Temp" value={`${latest("temperature")}°C`} icon="🔥" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
          <div className="card p-6 flex flex-col items-center relative overflow-hidden">
            <div className="absolute inset-0 gradient-subtle" />
            <div className="relative w-full flex flex-col items-center">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="section-title mb-0">Crop Grade</h2>
                {connected && (
                  <span className="flex items-center gap-1 text-[10px] text-green-500 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> LIVE
                  </span>
                )}
              </div>
              {data ? (
                <>
                  <QualityGauge score={data.qualityScore || 0} grade={data.grade || "C"} size="lg" />
                  <p className="text-sm text-navy-400 mt-3">
                    {data.grade === "A" ? "Excellent quality — premium market ready" :
                     data.grade === "B" ? "Average quality — standard market suitable" :
                     "Low quality — consider alternative use"}
                  </p>
                </>
              ) : (
                <p className="text-navy-400 py-12 text-center">Waiting for sensor data...</p>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 animate-fade-in-up" style={{ animationDelay: "0.55s" }}>
          <div className="card p-6">
            <h2 className="section-title mb-4">Sensor History (last 30)</h2>
            {history.length === 0 ? (
              <p className="text-navy-400 py-8 text-center">No data yet — start your Wokwi simulation to see live readings</p>
            ) : (
              <div className="space-y-1 max-h-80 overflow-y-auto">
                {[...history].reverse().map((h, i) => (
                  <div key={i} className="flex items-center justify-between text-xs px-3 py-2.5 rounded-lg bg-navy-50 dark:bg-navy-700/50 hover:bg-navy-100 dark:hover:bg-navy-700/80 transition-colors">
                    <span className="text-navy-400 w-14">{h.time}</span>
                    <span className="text-navy-700 dark:text-navy-200 w-16">
                      <span className={`inline-block w-2 h-2 rounded-full mr-1 ${h.temperature > 30 ? "bg-red-400" : h.temperature > 20 ? "bg-green-400" : "bg-blue-400"}`} />
                      {h.temperature}°C
                    </span>
                    <span className="text-navy-700 dark:text-navy-200 w-14">{h.humidity}%</span>
                    <span className="text-navy-700 dark:text-navy-200 w-16">{h.moisture}%</span>
                    <span className="flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${h.grade === "A" ? "bg-green-500" : h.grade === "B" ? "bg-amber-500" : "bg-red-500"}`} />
                      <span className="font-medium">{h.qualityScore?.toFixed(1) || "—"}</span>
                      <span className={`text-[10px] font-semibold status-${h.grade === "A" ? "green" : h.grade === "B" ? "yellow" : "red"}`}>{h.grade}</span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {history.length > 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6 animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
            <h2 className="section-title mb-4">Temperature Trend</h2>
            <div className="h-48 flex items-end gap-0.5">
              {history.map((h, i) => {
                const max = Math.max(...history.map((x) => x.temperature), 40);
                const min = Math.min(...history.map((x) => x.temperature), 15);
                const pct = ((h.temperature - min) / (max - min || 1)) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-0.5 group relative">
                    <span className="text-[10px] text-navy-400 opacity-0 group-hover:opacity-100 transition-opacity">{h.temperature}°</span>
                    <div className="w-full rounded-t-sm bg-gradient-to-t from-primary-500 to-teal-400 transition-all duration-500"
                      style={{ height: `${Math.max(pct, 5)}%` }} />
                  </div>
                );
              })}
            </div>
          </div>
          <div className="card p-6 animate-fade-in-up" style={{ animationDelay: "0.65s" }}>
            <h2 className="section-title mb-4">Humidity Trend</h2>
            <div className="h-48 flex items-end gap-0.5">
              {history.map((h, i) => {
                const max = Math.max(...history.map((x) => x.humidity), 100);
                const min = Math.min(...history.map((x) => x.humidity), 0);
                const pct = ((h.humidity - min) / (max - min || 1)) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-0.5 group relative">
                    <span className="text-[10px] text-navy-400 opacity-0 group-hover:opacity-100 transition-opacity">{h.humidity}%</span>
                    <div className="w-full rounded-t-sm bg-gradient-to-t from-blue-500 to-cyan-400 transition-all duration-500"
                      style={{ height: `${Math.max(pct, 5)}%` }} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
