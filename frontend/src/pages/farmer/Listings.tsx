import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { farmerApi } from "../../services/api";
import Table from "../../components/common/Table";
import KpiCard from "../../components/common/KpiCard";
import { CropListing } from "../../types";

type ViewMode = "table" | "grid";

const GRADE_COLORS: Record<string, string> = {
  A: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  B: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  C: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};
const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  SOLD: "bg-navy-100 text-navy-600 dark:bg-navy-700 dark:text-navy-300",
  REMOVED: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
};

export default function FarmerListings() {
  const [listings, setListings] = useState<CropListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>("table");
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    farmerApi.getListings().then((res) => setListings(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-[3px] border-primary-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-navy-400 animate-pulse">Loading your crops...</span>
      </div>
    </div>
  );

  const active = listings.filter((l) => l.status === "AVAILABLE");
  const sold = listings.filter((l) => l.status === "SOLD");
  const totalKg = listings.reduce((a, l) => a + l.quantityKg, 0);
  const filtered = filter === "ALL" ? listings : listings.filter((l) => l.status === filter);

  const columns = [
    { key: "cropName", header: "Crop", render: (c: CropListing) => (
      <div className="flex items-center gap-3">
        {c.imageUrl ? (
          <img src={c.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-navy-100 dark:bg-navy-700 flex items-center justify-center text-navy-400 text-xs">
            {c.cropName.charAt(0)}
          </div>
        )}
        <div>
          <span className="font-medium text-navy-900 dark:text-white">{c.cropName}</span>
          {c.description && <p className="text-xs text-navy-400 mt-0.5">{c.description.slice(0, 50)}</p>}
        </div>
      </div>
    )},
    { key: "quantityKg", header: "Volume", render: (c: CropListing) => `${c.quantityKg} kg` },
    { key: "pricePerKg", header: "Price", render: (c: CropListing) => `TSh ${c.pricePerKg.toLocaleString()}` },
    { key: "location", header: "Location", render: (c: CropListing) => c.location || "—" },
    { key: "qualityGrade", header: "Grade", render: (c: CropListing) =>
      c.qualityGrade ? (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${GRADE_COLORS[c.qualityGrade] || "bg-navy-100 text-navy-600"}`}>
          {c.qualityGrade} {c.qualityScore ? `${c.qualityScore}` : ""}
        </span>
      ) : <span className="text-navy-400 text-xs">—</span>
    },
    { key: "status", header: "Status", render: (c: CropListing) =>
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[c.status]}`}>{c.status}</span>
    },
    { key: "createdAt", header: "Added", render: (c: CropListing) =>
      new Date(c.createdAt).toLocaleDateString()
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-in-down">
        <div>
          <span className="label">My Crops</span>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white mt-1">Crop Listings</h1>
          <p className="text-sm text-navy-400 mt-0.5">{listings.length} total · {active.length} active · {sold.length} sold</p>
        </div>
        <Link to="/farmer/add-crop" className="btn-primary">+ New crop</Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="animate-fade-in-up"><KpiCard label="Total Listings" value={listings.length} icon="📋" /></div>
        <div className="animate-fade-in-up" style={{ animationDelay: "0.08s" }}><KpiCard label="Active" value={active.length} icon="✅" subtext={`${((active.length / (listings.length || 1)) * 100).toFixed(0)}% of total`} /></div>
        <div className="animate-fade-in-up" style={{ animationDelay: "0.16s" }}><KpiCard label="Sold" value={sold.length} icon="💰" /></div>
        <div className="animate-fade-in-up" style={{ animationDelay: "0.24s" }}><KpiCard label="Total Volume" value={`${totalKg.toLocaleString()} kg`} icon="📦" /></div>
      </div>

      <div className="flex items-center justify-between animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
        <div className="flex gap-1.5">
          {["ALL", "AVAILABLE", "SOLD", "REMOVED"].map((s) => (
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
        <div className="flex gap-1.5">
          <button onClick={() => setView("table")}
            className={`p-1.5 rounded-lg transition-colors ${view === "table" ? "bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400" : "text-navy-400 hover:text-navy-600 dark:hover:text-navy-200"}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          </button>
          <button onClick={() => setView("grid")}
            className={`p-1.5 rounded-lg transition-colors ${view === "grid" ? "bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400" : "text-navy-400 hover:text-navy-600 dark:hover:text-navy-200"}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center animate-fade-in-up">
          <svg className="w-16 h-16 mx-auto text-navy-300 dark:text-navy-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          <p className="text-navy-400 mb-1">
            {filter === "ALL" ? "No crop listings yet" : `No ${filter.toLowerCase()} crops`}
          </p>
          <p className="text-xs text-navy-300 mb-4">
            {filter === "ALL" ? "Add your first crop to start selling" : "Try a different filter"}
          </p>
          {filter === "ALL" && <Link to="/farmer/add-crop" className="btn-primary">Add your first crop</Link>}
        </div>
      ) : view === "table" ? (
        <div className="animate-fade-in-up">
          <Table columns={columns} data={filtered} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fade-in-up">
          {filtered.map((c, i) => (
            <div key={c.id} className="card overflow-hidden group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              style={{ animationDelay: `${i * 0.05}s` }}>
              {c.imageUrl ? (
                <div className="h-36 overflow-hidden">
                  <img src={c.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
              ) : (
                <div className="h-36 bg-gradient-to-br from-primary-100 to-teal-100 dark:from-navy-700 dark:to-navy-600 flex items-center justify-center">
                  <span className="text-4xl text-primary-300 dark:text-primary-500">{c.cropName.charAt(0)}</span>
                </div>
              )}
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-navy-900 dark:text-white">{c.cropName}</h3>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_COLORS[c.status]}`}>{c.status}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-navy-400">Volume</span>
                    <p className="font-medium text-navy-700 dark:text-navy-200">{c.quantityKg} kg</p>
                  </div>
                  <div>
                    <span className="text-navy-400">Price</span>
                    <p className="font-medium text-navy-700 dark:text-navy-200">TSh {c.pricePerKg.toLocaleString()}/kg</p>
                  </div>
                  {c.location && (
                    <div>
                      <span className="text-navy-400">Location</span>
                      <p className="font-medium text-navy-700 dark:text-navy-200">{c.location}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-navy-400">Grade</span>
                    <p className="font-medium">
                      {c.qualityGrade
                        ? <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${GRADE_COLORS[c.qualityGrade] || ""}`}>{c.qualityGrade}</span>
                        : <span className="text-navy-400">—</span>}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
