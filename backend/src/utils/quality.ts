export function assessCropQuality(data: {
  moistureScore: number;
  colorScore: number;
  imageScore: number;
  freshnessScore: number;
  sizeScore: number;
  storageScore: number;
}): { finalScore: number; grade: string } {
  const finalScore =
    data.moistureScore * 0.25 +
    data.colorScore * 0.25 +
    data.imageScore * 0.20 +
    data.freshnessScore * 0.15 +
    data.sizeScore * 0.10 +
    data.storageScore * 0.05;

  let grade: string;
  if (finalScore >= 80) grade = "A";
  else if (finalScore >= 60) grade = "B";
  else grade = "C";

  return { finalScore: Math.round(finalScore * 100) / 100, grade };
}

export function normalizeSensorData(sensorData: {
  temperature: number;
  humidity: number;
  moisture: number;
  colorScore: number;
  gasLevel: number;
  weightKg: number;
}): {
  moistureScore: number;
  colorScore: number;
  sizeScore: number;
  freshnessScore: number;
  imageScore: number;
  storageScore: number;
} {
  const moistureScore = normalize(sensorData.moisture, 0, 100, true);
  const colorScore = sensorData.colorScore;
  const sizeScore = normalize(sensorData.weightKg, 0.1, 100, true);
  const freshnessScore = normalize(sensorData.temperature, 15, 40, false);
  const imageScore = normalize(sensorData.colorScore + sensorData.moisture, 0, 200, true);
  const storageScore = normalize(sensorData.gasLevel, 0, 500, false);

  return {
    moistureScore: Math.round(moistureScore * 100) / 100,
    colorScore: Math.min(colorScore, 100),
    sizeScore: Math.round(sizeScore * 100) / 100,
    freshnessScore: Math.round(freshnessScore * 100) / 100,
    imageScore: Math.round(Math.min(imageScore, 100)),
    storageScore: Math.round(storageScore * 100) / 100,
  };
}

function normalize(value: number, min: number, max: number, higherIsBetter: boolean): number {
  if (value <= min) return higherIsBetter ? 0 : 100;
  if (value >= max) return higherIsBetter ? 100 : 0;
  const ratio = (value - min) / (max - min);
  return higherIsBetter ? ratio * 100 : (1 - ratio) * 100;
}
