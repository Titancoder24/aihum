/**
 * Statistical analysis utilities for NLP feature extraction.
 */

/**
 * Arithmetic mean of a numeric array.
 */
export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/**
 * Population variance of a numeric array.
 */
export function variance(values: number[]): number {
  if (values.length === 0) return 0;
  const m = mean(values);
  return values.reduce((sum, v) => sum + (v - m) ** 2, 0) / values.length;
}

/**
 * Population standard deviation of a numeric array.
 */
export function standardDeviation(values: number[]): number {
  return Math.sqrt(variance(values));
}

/**
 * Coefficient of variation (CV): standard deviation divided by mean.
 * Returns 0 when mean is 0 to avoid division by zero.
 */
export function coefficientOfVariation(values: number[]): number {
  const m = mean(values);
  if (m === 0) return 0;
  return standardDeviation(values) / m;
}

/**
 * Shannon entropy from a frequency map.
 * H = -sum(p * log2(p)) for each unique item.
 * Frequencies are converted to probabilities internally.
 */
export function shannonEntropy(frequencies: Map<string, number>): number {
  if (frequencies.size === 0) return 0;

  const values = Array.from(frequencies.values());
  let total = 0;
  for (let i = 0; i < values.length; i++) {
    total += values[i];
  }
  if (total === 0) return 0;

  let entropy = 0;
  for (let i = 0; i < values.length; i++) {
    const count = values[i];
    if (count <= 0) continue;
    const p = count / total;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

/**
 * Fit a Zipf's law distribution via log-log linear regression.
 * Ranks items by frequency (descending), then performs linear regression
 * on log(rank) vs log(frequency).
 *
 * Returns the slope and R-squared (goodness of fit).
 * A perfect Zipf distribution has slope close to -1.
 */
export function zipfFit(frequencies: Map<string, number>): { slope: number; rSquared: number } {
  if (frequencies.size < 2) {
    return { slope: 0, rSquared: 0 };
  }

  // Sort frequencies descending
  const sorted = Array.from(frequencies.values()).sort((a, b) => b - a);

  // Build log-log data points
  const logRanks: number[] = [];
  const logFreqs: number[] = [];

  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i] <= 0) continue;
    logRanks.push(Math.log(i + 1));
    logFreqs.push(Math.log(sorted[i]));
  }

  if (logRanks.length < 2) {
    return { slope: 0, rSquared: 0 };
  }

  // Linear regression: logFreq = slope * logRank + intercept
  const n = logRanks.length;
  const sumX = logRanks.reduce((s, v) => s + v, 0);
  const sumY = logFreqs.reduce((s, v) => s + v, 0);
  const sumXY = logRanks.reduce((s, v, i) => s + v * logFreqs[i], 0);
  const sumX2 = logRanks.reduce((s, v) => s + v * v, 0);

  const denominator = n * sumX2 - sumX * sumX;
  if (denominator === 0) {
    return { slope: 0, rSquared: 0 };
  }

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  // R-squared
  const meanY = sumY / n;
  let ssRes = 0;
  let ssTot = 0;

  for (let i = 0; i < n; i++) {
    const predicted = slope * logRanks[i] + intercept;
    ssRes += (logFreqs[i] - predicted) ** 2;
    ssTot += (logFreqs[i] - meanY) ** 2;
  }

  const rSquared = ssTot === 0 ? 0 : 1 - ssRes / ssTot;

  return { slope, rSquared: Math.max(0, rSquared) };
}

/**
 * Normalize a value to the 0-1 range given min and max bounds.
 * Clamps the result to [0, 1].
 */
export function normalize(value: number, min: number, max: number): number {
  if (max === min) return 0;
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}
