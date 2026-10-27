/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DataRecord, EngineeredRecord } from '../types';

export function getSeasonIntensity(season: string): number {
  switch (season) {
    case 'Festival':
      return 1.3;
    case 'Peak':
      return 1.15;
    case 'Normal':
      return 1.0;
    case 'Clearance':
      return 0.8;
    default:
      return 1.0;
  }
}

/**
 * Transforms raw e-commerce records into engineered feature representations
 * according to Phase 3 of the DPS syllabus.
 */
export function engineerFeatures(record: DataRecord): EngineeredRecord {
  const stockSafe = Math.max(0, record.stock_available);
  const currentPriceSafe = Math.max(1, record.current_price);
  const histPriceSafe = Math.max(1, record.historical_price);

  const demandToStockRatio = Number((record.demand / (stockSafe + 1)).toFixed(4));
  const competitorPriceDiff = Number((record.competitor_price - currentPriceSafe).toFixed(2));
  const competitorPriceRatio = Number((record.competitor_price / currentPriceSafe).toFixed(4));
  const historicalPriceChange = Number(((currentPriceSafe - histPriceSafe) / histPriceSafe).toFixed(4));
  const seasonIntensity = getSeasonIntensity(record.season);
  const promoBoost = record.promotion_active ? 1 : 0;

  return {
    ...record,
    demand_to_stock_ratio: demandToStockRatio,
    competitor_price_diff: competitorPriceDiff,
    competitor_price_ratio: competitorPriceRatio,
    historical_price_change: historicalPriceChange,
    season_intensity: seasonIntensity,
    promo_boost: promoBoost,
  };
}

export function engineerDataset(dataset: DataRecord[]): EngineeredRecord[] {
  return dataset.map(engineerFeatures);
}
