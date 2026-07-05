import { useState, useEffect } from "react";
import { adminApi } from "../../services/api";

export default function AdminReports() {
  const [reports, setReports] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getReports().then((res) => setReports(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>;

  if (!reports) return <div className="card p-12 text-center text-navy-400">No data available</div>;

  const gradeMax = Math.max(1, ...(reports.gradeDistribution?.map((g: any) => g._count) || [1]));
  const orderMax = Math.max(1, ...(reports.monthlyOrders?.map((o: any) => o._count) || [1]));
  const cropMax = Math.max(1, ...(reports.topCrops?.map((c: any) => c._sum?.quantityKg || 0) || [1]));

  const gradeColors: Record<string, string> = {
    A: "bg-green-500", B: "bg-amber-500", C: "bg-red-500",
  };

  const orderColors: Record<string, string> = {
    DELIVERED: "bg-green-500", CANCELLED: "bg-red-500", SHIPPED: "bg-blue-500",
    CONFIRMED: "bg-primary-500", PENDING: "bg-amber-500",
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Reports & Analytics</h1>
        <p className="text-sm text-navy-400 mt-1">Platform insights</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="section-title mb-4">Grade Distribution</h3>
          <div className="space-y-4">
            {reports.gradeDistribution?.map((item: any) => (
              <div key={item.qualityGrade || "ungraded"}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="font-medium text-navy-700 dark:text-navy-200">
                    Grade {item.qualityGrade || "N/A"}
                  </span>
                  <span className="text-navy-500">{item._count} crops</span>
                </div>
                <div className="h-2.5 bg-navy-100 dark:bg-navy-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${gradeColors[item.qualityGrade] || "bg-navy-400"}`}
                    style={{ width: `${(item._count / gradeMax) * 100}%` }} />
                </div>
              </div>
            ))}
            {(!reports.gradeDistribution || reports.gradeDistribution.length === 0) && (
              <p className="text-sm text-navy-400 text-center py-4">No assessments yet</p>
            )}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="section-title mb-4">Order Status Breakdown</h3>
          <div className="space-y-4">
            {reports.monthlyOrders?.map((item: any) => (
              <div key={item.orderStatus}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="font-medium text-navy-700 dark:text-navy-200">{item.orderStatus}</span>
                  <span className="text-navy-500">{item._count} orders</span>
                </div>
                <div className="h-2.5 bg-navy-100 dark:bg-navy-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${orderColors[item.orderStatus] || "bg-navy-400"}`}
                    style={{ width: `${(item._count / orderMax) * 100}%` }} />
                </div>
              </div>
            ))}
            {(!reports.monthlyOrders || reports.monthlyOrders.length === 0) && (
              <p className="text-sm text-navy-400 text-center py-4">No orders yet</p>
            )}
          </div>
        </div>

        <div className="card p-6 lg:col-span-2">
          <h3 className="section-title mb-4">Top Crops by Volume</h3>
          <div className="space-y-4">
            {reports.topCrops?.map((item: any, i: number) => (
              <div key={item.cropName}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="font-medium text-navy-700 dark:text-navy-200">
                    {i + 1}. {item.cropName}
                  </span>
                  <span className="text-navy-500">{item._sum?.quantityKg || 0} kg</span>
                </div>
                <div className="h-2.5 bg-navy-100 dark:bg-navy-700 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-primary-500 transition-all"
                    style={{ width: `${((item._sum?.quantityKg || 0) / cropMax) * 100}%` }} />
                </div>
              </div>
            ))}
            {(!reports.topCrops || reports.topCrops.length === 0) && (
              <p className="text-sm text-navy-400 text-center py-4">No crop data yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
