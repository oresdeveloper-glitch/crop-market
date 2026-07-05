interface QualityGaugeProps {
  score: number;
  grade: string;
  size?: "sm" | "md" | "lg";
}

export default function QualityGauge({ score, grade, size = "md" }: QualityGaugeProps) {
  const radius = size === "sm" ? 54 : size === "md" ? 70 : 90;
  const strokeWidth = size === "sm" ? 8 : size === "md" ? 10 : 12;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const gradeColors: Record<string, string> = {
    A: "#16a34a",
    B: "#f59e0b",
    C: "#dc2626",
  };

  const gradeLabels: Record<string, string> = {
    A: "Excellent",
    B: "Average",
    C: "Low",
  };

  const color = gradeColors[grade] || "#64748b";
  const label = gradeLabels[grade] || "Unknown";

  const textSize = size === "sm" ? "text-lg" : size === "md" ? "text-2xl" : "text-3xl";
  const gradeSize = size === "sm" ? "text-xs" : size === "md" ? "text-sm" : "text-base";

  return (
    <div className="flex flex-col items-center">
      <svg width={(radius + strokeWidth) * 2} height={(radius + strokeWidth) * 2} className="transform -rotate-90">
        <circle cx={radius + strokeWidth} cy={radius + strokeWidth} r={radius}
          fill="none" stroke="currentColor" strokeWidth={strokeWidth}
          className="text-navy-100 dark:text-navy-700" />
        <circle cx={radius + strokeWidth} cy={radius + strokeWidth} r={radius}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" className="transition-all duration-1000 ease-out" />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ marginTop: -(radius + strokeWidth) * 2 }}>
        <span className={`${textSize} font-bold`} style={{ color }}>{score}%</span>
        <span className={`${gradeSize} font-medium text-navy-400 dark:text-navy-300`}>{label}</span>
      </div>
    </div>
  );
}
