import { useState, useEffect } from "react";
import { adminApi } from "../../services/api";
import Table from "../../components/common/Table";

export default function AdminCrops() {
  const [crops, setCrops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getCrops().then((res) => setCrops(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Crop Listings</h1>
        <p className="text-sm text-navy-400 mt-1">{crops.length} total listings</p>
      </div>

      <Table
        columns={[
          { key: "cropName", header: "Crop", render: (c: any) => (
            <span className="font-medium text-navy-900 dark:text-white">{c.cropName}</span>
          )},
          { key: "farmer", header: "Farmer", render: (c: any) => c.farmer?.user.fullName || "—" },
          { key: "quantityKg", header: "Qty", render: (c: any) => `${c.quantityKg} kg` },
          { key: "pricePerKg", header: "Price", render: (c: any) => `TSh ${c.pricePerKg.toLocaleString()}` },
          { key: "qualityGrade", header: "Grade", render: (c: any) =>
            c.qualityGrade ? (
              <span className={`status-${c.qualityGrade === "A" ? "green" : c.qualityGrade === "B" ? "yellow" : "red"}`}>
                {c.qualityGrade}
              </span>
            ) : <span className="text-navy-400 text-xs">—</span>
          },
          { key: "status", header: "Status", render: (c: any) =>
            <span className={c.status === "AVAILABLE" ? "status-green" : "status-yellow"}>{c.status}</span>
          },
          { key: "createdAt", header: "Created", render: (c: any) => new Date(c.createdAt).toLocaleDateString() },
        ]}
        data={crops}
      />
    </div>
  );
}
