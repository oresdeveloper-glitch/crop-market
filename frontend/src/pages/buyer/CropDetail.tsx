import { useState, useEffect, FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { cropApi, qualityApi, sensorApi, orderApi } from "../../services/api";
import QualityGauge from "../../components/common/QualityGauge";
import SensorProgress from "../../components/common/SensorProgress";

export default function CropDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [crop, setCrop] = useState<any>(null);
  const [quality, setQuality] = useState<any>(null);
  const [sensor, setSensor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState("");
  const [delivery, setDelivery] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!id) return;
    Promise.all([
      cropApi.getById(id),
      qualityApi.getLatest(id).catch(() => null),
      sensorApi.getLatest(id).catch(() => null),
    ]).then(([c, q, s]) => { setCrop(c.data); setQuality(q?.data); setSensor(s?.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const place = async (e: FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await orderApi.create({ cropId: id, quantityKg: parseFloat(qty), deliveryLocation: delivery });
      setMsg("Order placed! Redirecting...");
      setTimeout(() => navigate("/buyer/orders"), 1500);
    } catch (err: any) { setMsg(err.response?.data?.error || "Order failed"); }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!crop) return <div className="card p-12 text-center text-navy-400">Crop not found</div>;

  return (
    <div className="max-w-5xl mx-auto">
      <button onClick={() => navigate(-1)} className="text-sm text-navy-400 hover:text-navy-600 dark:hover:text-navy-200 mb-6">&larr; Back</button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-navy-900 dark:text-white">{crop.cropName}</h1>
              {crop.description && <p className="text-sm text-navy-400 mt-1">{crop.description}</p>}
            </div>
            {crop.qualityGrade && (
              <span className={`status-${
                crop.qualityGrade === "A" ? "green" : crop.qualityGrade === "B" ? "yellow" : "red"
              } text-sm`}>Grade {crop.qualityGrade}</span>
            )}
          </div>

          <p className="text-3xl font-bold text-primary-600 mb-4">
            TSh {crop.pricePerKg.toLocaleString()} <span className="text-sm text-navy-400 font-normal">/ kg</span>
          </p>

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="card p-3 text-center">
              <span className="label">Available</span>
              <p className="text-lg font-semibold text-navy-900 dark:text-white">{crop.quantityKg} kg</p>
            </div>
            <div className="card p-3 text-center">
              <span className="label">Location</span>
              <p className="text-lg font-semibold text-navy-900 dark:text-white">{crop.location || "—"}</p>
            </div>
            <div className="card p-3 text-center">
              <span className="label">Farmer</span>
              <p className="text-lg font-semibold text-navy-900 dark:text-white">{crop.farmer?.user.fullName || "—"}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-navy-900 dark:text-white mb-4">Place Order</h2>
          {msg && (
            <div className={`text-sm px-3 py-2 rounded-lg mb-4 ${msg.includes("placed") ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-50 text-red-600"}`}>
              {msg}
            </div>
          )}
          <form onSubmit={place} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-navy-500 mb-1.5">Quantity (kg)</label>
              <input type="number" step="0.01" min="0.01" max={crop.quantityKg} value={qty}
                onChange={(e) => setQty(e.target.value)} className="input-field" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy-500 mb-1.5">Delivery location</label>
              <input type="text" value={delivery} onChange={(e) => setDelivery(e.target.value)}
                className="input-field" placeholder="e.g. Dar es Salaam" />
            </div>
            <div className="text-sm text-navy-600 dark:text-navy-300 font-medium">
              Total: TSh {(parseFloat(qty || "0") * crop.pricePerKg).toLocaleString()}
            </div>
            <button type="submit" className="btn-primary w-full">Place order</button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {quality && (
          <div className="card p-6">
            <h3 className="section-title mb-4">Quality Assessment</h3>
            <div className="flex items-center gap-6">
              <QualityGauge score={quality.finalScore} grade={quality.grade || "C"} />
              <div className="flex-1 space-y-2 text-sm">
                {[
                  { label: "Moisture", val: quality.moistureScore },
                  { label: "Color", val: quality.colorScore },
                  { label: "Size", val: quality.sizeScore },
                  { label: "Freshness", val: quality.freshnessScore },
                  { label: "Image", val: quality.imageScore },
                  { label: "Storage", val: quality.storageScore },
                ].map(({ label, val }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-navy-500">{label}</span>
                    <span className="font-medium text-navy-900 dark:text-white">{val}</span>
                  </div>
                ))}
                {quality.remarks && (
                  <p className="text-xs text-navy-400 italic mt-2">{quality.remarks}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {sensor && (
          <div className="card p-6">
            <h3 className="section-title mb-4">Sensor Readings</h3>
            <div className="space-y-3">
              <SensorProgress label="Temperature" value={sensor.temperature || 0} unit="°C" max={50} />
              <SensorProgress label="Humidity" value={sensor.humidity || 0} unit="%" />
              <SensorProgress label="Soil Moisture" value={sensor.moisture || 0} unit="%" />
              <SensorProgress label="Color Score" value={sensor.colorScore || 0} unit="" />
              <SensorProgress label="Gas Level" value={sensor.gasLevel || 0} unit="ppb" max={500} />
              <p className="text-xs text-navy-400 mt-2">
                Recorded: {new Date(sensor.recordedAt).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
