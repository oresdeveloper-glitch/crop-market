import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data: { fullName: string; email?: string; phone?: string; password: string; role: string }) =>
    api.post("/auth/register", data),
  login: (data: { email?: string; phone?: string; password: string }) =>
    api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
};

export const farmerApi = {
  getProfile: () => api.get("/farmers/profile"),
  updateProfile: (data: any) => api.put("/farmers/profile", data),
  getListings: () => api.get("/farmers/listings"),
  getOrders: () => api.get("/farmers/orders"),
  getFarmerById: (id: string) => api.get(`/farmers/${id}`),
};

export const buyerApi = {
  getProfile: () => api.get("/buyers/profile"),
  updateProfile: (data: any) => api.put("/buyers/profile", data),
};

export const cropApi = {
  create: (data: any) => api.post("/crops", data),
  getAll: (params?: any) => api.get("/crops", { params }),
  getById: (id: string) => api.get(`/crops/${id}`),
  update: (id: string, data: any) => api.put(`/crops/${id}`, data),
  delete: (id: string) => api.delete(`/crops/${id}`),
};

export const uploadApi = {
  image: (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return api.post("/upload/image", fd, { headers: { "Content-Type": "multipart/form-data" } });
  },
  base64: (image: string) => api.post("/upload/base64", { image }),
};

export const sensorApi = {
  postData: (data: any) => api.post("/iot/sensor-data", data),
  getData: (cropId: string) => api.get(`/iot/sensor-data/${cropId}`),
  getLatest: (cropId: string) => api.get(`/iot/sensor-data/${cropId}/latest`),
};

export const qualityApi = {
  assess: (data: any) => api.post("/quality/assess", data),
  getByCrop: (cropId: string) => api.get(`/quality/${cropId}`),
  getLatest: (cropId: string) => api.get(`/quality/${cropId}/latest`),
};

export const orderApi = {
  create: (data: any) => api.post("/orders", data),
  getMine: () => api.get("/orders"),
  getById: (id: string) => api.get(`/orders/${id}`),
  updateStatus: (id: string, data: any) => api.put(`/orders/${id}/status`, data),
};

export const adminApi = {
  getOverview: () => api.get("/admin/overview"),
  getFarmers: () => api.get("/admin/farmers"),
  getBuyers: () => api.get("/admin/buyers"),
  getOrders: () => api.get("/admin/orders"),
  getCrops: () => api.get("/admin/crops"),
  getSensors: () => api.get("/admin/sensors"),
  getReports: () => api.get("/admin/reports"),
  verifyFarmer: (id: string, verificationStatus: string) =>
    api.patch(`/admin/farmers/${id}/verify`, { verificationStatus }),
};

export default api;
