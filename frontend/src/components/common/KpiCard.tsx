import { ReactNode } from "react";

interface KpiCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: { value: string; positive: boolean };
  subtext?: string;
}

export default function KpiCard({ label, value, icon, trend, subtext }: KpiCardProps) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-2">
        <span className="label">{label}</span>
        {icon && <span className="text-navy-400">{icon}</span>}
      </div>
      <div className="kpi-value text-navy-900 dark:text-white">{value}</div>
      {trend && (
        <p className={`text-sm mt-1 ${trend.positive ? "text-green-600" : "text-red-500"}`}>
          {trend.positive ? "↑" : "↓"} {trend.value}
        </p>
      )}
      {subtext && <p className="text-xs text-navy-400 mt-1">{subtext}</p>}
    </div>
  );
}
