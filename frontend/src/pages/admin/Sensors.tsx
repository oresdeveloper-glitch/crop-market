import { useState, useEffect } from "react";
import { adminApi } from "../../services/api";
import Table from "../../components/common/Table";

export default function AdminSensors() {
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getSensors().then((res) => setDevices(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Sensor Devices</h1>
        <p className="text-sm text-navy-400 mt-1">{devices.length} registered devices</p>
      </div>

      <Table
        columns={[
          { key: "deviceCode", header: "Device", render: (d: any) => (
            <span className="font-mono text-xs font-medium text-navy-900 dark:text-white">{d.deviceCode}</span>
          )},
          { key: "farmer", header: "Farmer", render: (d: any) => d.farmer?.user.fullName || "—" },
          { key: "deviceType", header: "Type", render: (d: any) => d.deviceType || "—" },
          { key: "status", header: "Status", render: (d: any) => (
            <span className={`status-${
              d.status === "ACTIVE" ? "green" : d.status === "INACTIVE" ? "red" : "yellow"
            }`}>{d.status}</span>
          )},
          { key: "lastSeen", header: "Last seen", render: (d: any) =>
            d.lastSeen ? new Date(d.lastSeen).toLocaleString() : <span className="text-navy-400">Never</span>
          },
        ]}
        data={devices}
      />
    </div>
  );
}
