import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { cropApi } from "../../services/api";
import { CropListing } from "../../types";

export default function BuyerMarketplace() {
  const [crops, setCrops] = useState<CropListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ cropName: "", location: "", qualityGrade: "", minPrice: "", maxPrice: "" });

  useEffect(() => { fetchCrops(); }, []);

  const fetchCrops = async () => {
    setLoading(true);
    try {
      const params: any = {};
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
      const res = await cropApi.getAll(params);
      setCrops(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-in-down">
        <div>
          <span className="label">Marketplace</span>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white mt-1">Browse Crops</h1>
          <p className="text-sm text-navy-400 mt-0.5">{crops.length} crops available</p>
        </div>
        <Link to="/buyer/orders" className="btn-secondary text-sm">My orders</Link>
      </div>

      <div className="card p-4 animate-fade-in-up">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <input type="text" placeholder="Crop name" value={filters.cropName}
            onChange={(e) => setFilters({ ...filters, cropName: e.target.value })}
            className="input-field text-sm" />
          <input type="text" placeholder="Location" value={filters.location}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            className="input-field text-sm" />
          <select value={filters.qualityGrade}
            onChange={(e) => setFilters({ ...filters, qualityGrade: e.target.value })}
            className="input-field text-sm">
            <option value="">All grades</option>
            <option value="A">Grade A</option>
            <option value="B">Grade B</option>
            <option value="C">Grade C</option>
          </select>
          <input type="number" placeholder="Min price" value={filters.minPrice}
            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
            className="input-field text-sm" />
          <input type="number" placeholder="Max price" value={filters.maxPrice}
            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
            className="input-field text-sm" />
        </div>
        <button onClick={fetchCrops} className="btn-primary mt-3">Search</button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-[3px] border-primary-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-navy-400 animate-pulse">Searching crops...</span>
          </div>
        </div>
      ) : crops.length === 0 ? (
        <div className="card p-12 text-center animate-fade-in">
          <p className="text-navy-400">No crops match your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {crops.map((crop, i) => (
            <Link key={crop.id} to={`/buyer/crop/${crop.id}`}
              className="group relative overflow-hidden rounded-2xl bg-white/80 dark:bg-navy-800/80 backdrop-blur-sm border border-navy-100/60 dark:border-navy-700/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${i * 0.06}s` }}>
              <div className="h-40 overflow-hidden bg-navy-100 dark:bg-navy-700">
                <img src={crop.imageUrl} alt={crop.cropName}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy" />
              </div>
              <div className="p-4 relative">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-navy-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {crop.cropName}
                  </h3>
                  {crop.qualityGrade && (
                    <span className={`status-${
                      crop.qualityGrade === "A" ? "green" : crop.qualityGrade === "B" ? "yellow" : "red"
                    }`}>{crop.qualityGrade}</span>
                  )}
                </div>
                <p className="text-2xl font-bold text-primary-600 mb-1">
                  TSh {crop.pricePerKg.toLocaleString()}
                  <span className="text-sm text-navy-400 font-normal">/kg</span>
                </p>
                <div className="flex items-center gap-3 text-xs text-navy-400">
                  <span>{crop.quantityKg} kg</span>
                  {crop.location && <span>{crop.location}</span>}
                </div>
                {crop.farmer && (
                  <p className="text-xs text-navy-400 mt-1.5">by {crop.farmer.user.fullName}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
