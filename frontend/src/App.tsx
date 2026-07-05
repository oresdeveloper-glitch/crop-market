import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/common/Layout";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import FarmerDashboard from "./pages/farmer/Dashboard";
import FarmerProfile from "./pages/farmer/Profile";
import AddCrop from "./pages/farmer/AddCrop";
import FarmerListings from "./pages/farmer/Listings";
import FarmerOrders from "./pages/farmer/Orders";
import LiveSensor from "./pages/farmer/LiveSensor";
import BuyerMarketplace from "./pages/buyer/Marketplace";
import CropDetail from "./pages/buyer/CropDetail";
import BuyerOrders from "./pages/buyer/Orders";
import BuyerProfile from "./pages/buyer/Profile";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminCrops from "./pages/admin/Crops";
import AdminOrders from "./pages/admin/Orders";
import AdminSensors from "./pages/admin/Sensors";
import AdminReports from "./pages/admin/Reports";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/farmer" element={<ProtectedRoute roles={["FARMER"]}><FarmerDashboard /></ProtectedRoute>} />
        <Route path="/farmer/profile" element={<ProtectedRoute roles={["FARMER"]}><FarmerProfile /></ProtectedRoute>} />
        <Route path="/farmer/add-crop" element={<ProtectedRoute roles={["FARMER"]}><AddCrop /></ProtectedRoute>} />
        <Route path="/farmer/listings" element={<ProtectedRoute roles={["FARMER"]}><FarmerListings /></ProtectedRoute>} />
        <Route path="/farmer/orders" element={<ProtectedRoute roles={["FARMER"]}><FarmerOrders /></ProtectedRoute>} />
        <Route path="/farmer/live-sensor" element={<ProtectedRoute roles={["FARMER"]}><LiveSensor /></ProtectedRoute>} />
        <Route path="/buyer" element={<ProtectedRoute roles={["BUYER"]}><BuyerMarketplace /></ProtectedRoute>} />
        <Route path="/buyer/crop/:id" element={<ProtectedRoute roles={["BUYER"]}><CropDetail /></ProtectedRoute>} />
        <Route path="/buyer/orders" element={<ProtectedRoute roles={["BUYER"]}><BuyerOrders /></ProtectedRoute>} />
        <Route path="/buyer/profile" element={<ProtectedRoute roles={["BUYER"]}><BuyerProfile /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute roles={["ADMIN"]}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute roles={["ADMIN"]}><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/crops" element={<ProtectedRoute roles={["ADMIN"]}><AdminCrops /></ProtectedRoute>} />
        <Route path="/admin/orders" element={<ProtectedRoute roles={["ADMIN"]}><AdminOrders /></ProtectedRoute>} />
        <Route path="/admin/sensors" element={<ProtectedRoute roles={["ADMIN"]}><AdminSensors /></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute roles={["ADMIN"]}><AdminReports /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
