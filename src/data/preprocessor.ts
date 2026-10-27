/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { engineerFeatures } from '../features/engineering';
import { DataRecord, EngineeredRecord, PredictionInput } from '../types';

export interface PreprocessingState {
  featureNames: string[];
  categories: string[];
  mean: number[];
  std: number[];
}

export function extractFeatureVector(
  record: EngineeredRecord,
  categories: string[]
): number[] {
  // Base numerical features
  const features: number[] = [
    record.current_price,
    record.historical_price,
    record.demand,
    record.stock_available,
    record.competitor_price,
    record.units_sold,
    record.demand_to_stock_ratio,
    record.competitor_price_diff,
    record.competitor_price_ratio,
    record.historical_price_change,
    record.season_intensity,
    record.promo_boost,
  ];

  // One-Hot Encoding for categories
  categories.forEach((cat) => {
    features.push(record.category === cat ? 1 : 0);
  });

  return features;
}

export function getFeatureColumnNames(categories: string[]): string[] {
  const base = [
    'current_price',
    'historical_price',
    'demand',
    'stock_available',
    'competitor_price',
    'units_sold',
    'demand_to_stock_ratio',
    'competitor_price_diff',
    'competitor_price_ratio',
    'historical_price_change',
    'season_intensity',
    'promo_boost',
  ];
  return [...base, ...categories.map((c) => `cat_${c.toLowerCase().replace(/[^a-z0-9]/g, '_')}`)];
}

export function fitPreprocessing(
  trainRecords: EngineeredRecord[]
): PreprocessingState {
  const catSet = new Set<string>();
  trainRecords.forEach((r) => catSet.add(r.category));
  const categories = Array.from(catSet).sort();
  const featureNames = getFeatureColumnNames(categories);

  const numFeatures = featureNames.length;
  const sums = new Array(numFeatures).fill(0);
  const sumSquares = new Array(numFeatures).fill(0);
  const n = trainRecords.length;

  trainRecords.forEach((r) => {
    const vec = extractFeatureVector(r, categories);
    for (let j = 0; j < numFeatures; j++) {
      sums[j] += vec[j];
      sumSquares[j] += vec[j] * vec[j];
    }
  });

  const mean = sums.map((s) => s / (n || 1));
  const std = mean.map((m, j) => {
    const variance = sumSquares[j] / (n || 1) - m * m;
    const s = Math.sqrt(Math.max(1e-7, variance));
    return s === 0 ? 1 : s;
  });

  return {
    featureNames,
    categories,
    mean,
    std,
  };
}

export function transformRecord(
  record: EngineeredRecord,
  state: PreprocessingState,
  normalize: boolean = false
): number[] {
  const rawVec = extractFeatureVector(record, state.categories);
  if (!normalize) return rawVec;

  return rawVec.map((val, idx) => {
    const m = state.mean[idx] ?? 0;
    const s = state.std[idx] ?? 1;
    return (val - m) / s;
  });
}

export function transformPredictionInput(
  input: PredictionInput,
  state: PreprocessingState,
  normalize: boolean = false
): number[] {
  const dummyRecord: DataRecord = {
    id: 'PRED-TEMP',
    date: '2026-10-26',
    product_id: 'PRED',
    product_name: input.product_name || 'Target Product',
    category: input.category,
    current_price: input.current_price,
    historical_price: input.historical_price,
    target_price: input.current_price,
    demand: input.demand,
    stock_available: input.stock_available,
    competitor_price: input.competitor_price,
    units_sold: input.units_sold || Math.max(1, Math.round(input.demand * 0.35)),
    season: input.season,
    promotion_active: input.promotion_active,
  };

  const engineered = engineerFeatures(dummyRecord);
  return transformRecord(engineered, state, normalize);
}

export function splitTrainTest(
  records: EngineeredRecord[],
  splitRatio: number = 0.8,
  method: 'chronological' | 'random' = 'random'
): { train: EngineeredRecord[]; test: EngineeredRecord[] } {
  if (method === 'chronological') {
    const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date));
    const splitIndex = Math.floor(sorted.length * splitRatio);
    return {
      train: sorted.slice(0, splitIndex),
      test: sorted.slice(splitIndex),
    };
  }

  // Deterministic seeded random split
  const shuffled = [...records];
  let seed = 12345;
  for (let i = shuffled.length - 1; i > 0; i--) {
    seed = (seed * 9301 + 49297) % 233280;
    const j = Math.floor((seed / 233280) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const splitIndex = Math.floor(shuffled.length * splitRatio);
  return {
    train: shuffled.slice(0, splitIndex),
    test: shuffled.slice(splitIndex),
  };
}
