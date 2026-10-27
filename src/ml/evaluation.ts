/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ModelMetrics, TestPrediction } from '../types';

export function calculateMetrics(actuals: number[], predictions: number[]): {
  mae: number;
  rmse: number;
  r2: number;
} {
  const n = actuals.length;
  if (n === 0) return { mae: 0, rmse: 0, r2: 0 };

  let sumAbsError = 0;
  let sumSqError = 0;
  let sumActual = 0;

  for (let i = 0; i < n; i++) {
    const error = actuals[i] - predictions[i];
    sumAbsError += Math.abs(error);
    sumSqError += error * error;
    sumActual += actuals[i];
  }

  const meanActual = sumActual / n;
  let sumTotalSq = 0;
  for (let i = 0; i < n; i++) {
    const diff = actuals[i] - meanActual;
    sumTotalSq += diff * diff;
  }

  const mae = sumAbsError / n;
  const rmse = Math.sqrt(sumSqError / n);
  const r2 = sumTotalSq > 0 ? 1 - sumSqError / sumTotalSq : 0;

  return {
    mae: Number(mae.toFixed(2)),
    rmse: Number(rmse.toFixed(2)),
    r2: Number(r2.toFixed(4)),
  };
}

export function buildTestPredictions(
  actuals: number[],
  predictions: number[],
  metadata?: { product_name?: string; category?: string }[]
): TestPrediction[] {
  return actuals.map((actual, idx) => {
    const predicted = Number(predictions[idx].toFixed(2));
    const residual = Number((actual - predicted).toFixed(2));
    return {
      actual,
      predicted,
      residual,
      product_name: metadata?.[idx]?.product_name,
      category: metadata?.[idx]?.category,
    };
  });
}

export function calculateResidualDistribution(residuals: number[], binCount: number = 10): {
  binStart: number;
  binEnd: number;
  count: number;
  label: string;
}[] {
  if (residuals.length === 0) return [];
  const min = Math.min(...residuals);
  const max = Math.max(...residuals);
  const range = Math.max(1, max - min);
  const step = range / binCount;

  const bins = Array.from({ length: binCount }, (_, i) => {
    const start = min + i * step;
    const end = start + step;
    return {
      binStart: Number(start.toFixed(1)),
      binEnd: Number(end.toFixed(1)),
      count: 0,
      label: `${Math.round(start)} to ${Math.round(end)}`,
    };
  });

  residuals.forEach((res) => {
    let bIdx = Math.floor((res - min) / step);
    if (bIdx >= binCount) bIdx = binCount - 1;
    if (bIdx < 0) bIdx = 0;
    bins[bIdx].count++;
  });

  return bins;
}
