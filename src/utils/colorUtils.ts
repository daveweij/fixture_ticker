/**
 * Generate a color based on difficulty value using a diverging colormap
 * Green (easy) -> White (average) -> Red (hard)
 */
export function getColor(value: number, min: number, max: number, median: number): string {
  if (value <= median) {
    // Green to white
    const p = (value - min) / (median - min);
    const r = Math.round(255 * p);
    const b = Math.round(100 * (1 - p) + 255 * p);
    return `rgb(${r},255,${b})`;
  } else {
    // White to red
    const p = (value - median) / (max - median);
    const g = Math.round(255 * (1 - p));
    const b = Math.round(255 * (1 - p) + 100 * p); // from 255 to 100
    return `rgb(255,${g},${b})`;
  }
}

/**
 * Calculate percentile from a sorted array
 */
export function percentile(arr: number[], p: number): number {
  if (!arr.length) return 0;
  const idx = (arr.length - 1) * p;
  const lower = Math.floor(idx);
  const upper = Math.ceil(idx);
  if (upper === lower) return arr[lower];
  return arr[lower] + (arr[upper] - arr[lower]) * (idx - lower);
}