import { useState, useEffect, useRef, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { cropApi, uploadApi } from "../../services/api";
import QualityGauge from "../../components/common/QualityGauge";

export default function AddCrop() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    cropName: "", quantityKg: "", pricePerKg: "", location: "", description: "",
  });
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [liveData, setLiveData] = useState<any>(null);
  const [connected, setConnected] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const socket = io("/", { transports: ["websocket", "polling"] });
    socketRef.current = socket;
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("sensor-update", (payload) => setLiveData(payload));
    return () => { socket.disconnect(); };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      setCameraActive(true);
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch { setError("Camera access denied. Use file upload instead."); }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")!.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    setPreview(dataUrl);
    setImageUrl("__captured__");
    stopCamera();
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => () => stopCamera(), []);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImageUrl("__file__");
    setPreview(URL.createObjectURL(file));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setUploading(true);
    try {
      let finalImageUrl = "";
      if (imageUrl === "__captured__" && preview) {
        const res = await uploadApi.base64(preview);
        finalImageUrl = res.data.url;
      } else if (imageUrl === "__file__" && imageFile) {
        const res = await uploadApi.image(imageFile);
        finalImageUrl = res.data.url;
      }
      await cropApi.create({
        ...form,
        quantityKg: parseFloat(form.quantityKg),
        pricePerKg: parseFloat(form.pricePerKg),
        imageUrl: finalImageUrl,
      });
      navigate("/farmer/listings");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create listing");
    } finally { setUploading(false); }
  };

  const score = liveData?.qualityScore || 0;
  const grade = liveData?.grade || "N/A";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="animate-fade-in-down">
        <span className="label">New Listing</span>
        <h1 className="text-2xl font-bold text-navy-900 dark:text-white mt-1">Add Crop Listing</h1>
        <p className="text-sm text-navy-400 mt-0.5">Fill in the details below. Grade will be set from live sensor data.</p>
      </div>

      {liveData && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-fade-in-up">
          <div className="card p-3 flex items-center gap-3">
            <span className="text-lg">🌡️</span>
            <div>
              <p className="text-[10px] text-navy-400 uppercase tracking-wide">Temperature</p>
              <p className="text-sm font-bold text-navy-900 dark:text-white">{liveData.temperature}°C</p>
            </div>
          </div>
          <div className="card p-3 flex items-center gap-3">
            <span className="text-lg">💧</span>
            <div>
              <p className="text-[10px] text-navy-400 uppercase tracking-wide">Humidity</p>
              <p className="text-sm font-bold text-navy-900 dark:text-white">{liveData.humidity}%</p>
            </div>
          </div>
          <div className="card p-3 flex items-center gap-3">
            <span className="text-lg">🌱</span>
            <div>
              <p className="text-[10px] text-navy-400 uppercase tracking-wide">Moisture</p>
              <p className="text-sm font-bold text-navy-900 dark:text-white">{liveData.moisture}%</p>
            </div>
          </div>
          <div className="card p-3 flex items-center gap-3">
            <span className="text-lg">⭐</span>
            <div>
              <p className="text-[10px] text-navy-400 uppercase tracking-wide">Live Grade</p>
              <p className="text-sm font-bold" style={{ color: grade === "A" ? "#16a34a" : grade === "B" ? "#f59e0b" : "#dc2626" }}>{grade}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <form onSubmit={submit} className="card p-6 space-y-5">
            {error && <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg">{error}</div>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-navy-500 mb-1.5">Crop name *</label>
                <input type="text" value={form.cropName} onChange={(e) => setForm({ ...form, cropName: e.target.value })}
                  className="input-field" placeholder="e.g. Tomatoes" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-navy-500 mb-1.5">Quantity (kg) *</label>
                <input type="number" step="0.01" min="0" value={form.quantityKg}
                  onChange={(e) => setForm({ ...form, quantityKg: e.target.value })}
                  className="input-field" placeholder="100" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-navy-500 mb-1.5">Price per kg (TSh) *</label>
                <input type="number" step="0.01" min="0" value={form.pricePerKg}
                  onChange={(e) => setForm({ ...form, pricePerKg: e.target.value })}
                  className="input-field" placeholder="1200" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-navy-500 mb-1.5">Location</label>
                <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="input-field" placeholder="e.g. Mbeya" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-navy-500 mb-1.5">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input-field" rows={3} placeholder="Freshly harvested, organic..." />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={uploading} className="btn-primary">
                {uploading ? "Creating..." : "Create listing"}
              </button>
              <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>

        <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          {liveData && (
            <div className="card p-5 flex flex-col items-center">
              <h3 className="section-title mb-3 text-center">Auto Grade</h3>
              <QualityGauge score={score} grade={grade} size="sm" />
              <p className={`text-xs mt-2 font-medium ${
                grade === "A" ? "text-green-600" : grade === "B" ? "text-amber-600" : "text-red-600"
              }`}>
                {connected ? "From live sensor" : "Last known reading"}
              </p>
            </div>
          )}

          <div className="card p-5">
            <h3 className="section-title mb-3">Crop Photo</h3>
            {preview ? (
              <div className="space-y-3">
                <img src={preview} alt="Preview" className="w-full h-40 object-cover rounded-xl" />
                <button type="button" onClick={() => { setPreview(""); setImageUrl(""); setImageFile(null); }}
                  className="text-xs text-red-500 hover:text-red-700 font-medium">Remove</button>
              </div>
            ) : (
              <div className="space-y-3">
                {cameraActive ? (
                  <div className="space-y-3">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-40 object-cover rounded-xl bg-navy-900" />
                    <div className="flex gap-2">
                      <button type="button" onClick={capturePhoto} className="btn-primary text-xs flex-1">Capture</button>
                      <button type="button" onClick={stopCamera} className="btn-secondary text-xs">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button type="button" onClick={startCamera}
                      className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-navy-200 dark:border-navy-600 text-navy-400 hover:border-primary-400 hover:text-primary-500 transition-all text-sm font-medium flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      Take photo
                    </button>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-navy-100 dark:border-navy-700" />
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="px-2 bg-white dark:bg-navy-800 text-navy-400">or upload</span>
                      </div>
                    </div>
                    <label className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-navy-200 dark:border-navy-600 text-navy-400 hover:border-primary-400 hover:text-primary-500 transition-all text-sm font-medium flex items-center justify-center gap-2 cursor-pointer">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      Browse files
                      <input type="file" accept="image/*" capture="environment" onChange={handleFile} className="hidden" />
                    </label>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
