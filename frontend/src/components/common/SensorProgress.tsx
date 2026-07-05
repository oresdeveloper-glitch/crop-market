interface SensorProgressProps {
  label: string;
  value: number;
  unit: string;
  min?: number;
  max?: number;
  color?: string;
}

export default function SensorProgress({ label, value, unit, min = 0, max = 100, color }: SensorProgressProps) {
  const pct = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  const barColor =
    color ||
    (pct > 80 ? "#16a34a" : pct > 50 ? "#2563eb" : pct > 30 ? "#f59e0b" : "#dc2626");

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-navy-700 dark:text-navy-200">{label}</span>
        <span className="text-sm font-semibold text-navy-900 dark:text-white">
          {value}
          <span className="text-xs text-navy-400 ml-0.5">{unit}</span>
        </span>
      </div>
      <div className="h-2 bg-navy-100 dark:bg-navy-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>
    </div>
  );
}
