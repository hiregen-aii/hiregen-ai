export function calculateSuccessRate(
  successful: number,
  total: number,
): number {
  if (total === 0) return 0;
  return successful / total;
}

export function calculateAverageLatency(
  latencies: number[],
): number {
  if (latencies.length === 0) return 0;
  return latencies.reduce((sum, value) => sum + value, 0) / latencies.length;
}
