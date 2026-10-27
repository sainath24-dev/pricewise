/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { generateSampleDataset } from '../data/sampleData';
import { engineerFeatures } from '../features/engineering';
import { calculateMetrics } from './evaluation';
import { trainModelsPipeline, executeModelPrediction } from './pipeline';
import { AppSettings, PredictionInput } from '../types';

test('Feature Engineering computes valid ratios and differences', () => {
  const dummy = {
    id: 'T1',
    date: '2026-10-26',
    product_id: 'P1',
    product_name: 'Test Headphone',
    category: 'Electronics',
    current_price: 10000,
    historical_price: 9500,
    target_price: 10500,
    demand: 60,
    stock_available: 5,
    competitor_price: 10800,
    units_sold: 25,
    season: 'Festival' as const,
    promotion_active: true,
  };

  const engineered = engineerFeatures(dummy);

  // demand / (stock + 1) = 60 / 6 = 10
  assert.equal(engineered.demand_to_stock_ratio, 10);
  // competitor - current = 10800 - 10000 = 800
  assert.equal(engineered.competitor_price_diff, 800);
  assert.equal(engineered.season_intensity, 1.3);
  assert.equal(engineered.promo_boost, 1);
});

test('Evaluation metrics MAE, RMSE, and R2 compute accurately', () => {
  const actuals = [100, 200, 300, 400];
  const predictions = [110, 190, 310, 390];
  // Errors: 10, -10, 10, -10 -> MAE = 10, RMSE = 10
  const metrics = calculateMetrics(actuals, predictions);

  assert.equal(metrics.mae, 10);
  assert.equal(metrics.rmse, 10);
  assert.ok(metrics.r2 > 0.98, `Expected R2 > 0.98, got ${metrics.r2}`);
});

test('Machine Learning Pipeline trains all 3 algorithms and computes genuine benchmarks', () => {
  const dataset = generateSampleDataset();
  const engineeredData = dataset.map(engineerFeatures);

  const { results, bestAlgorithm } = trainModelsPipeline({
    records: engineeredData,
    splitRatio: 0.8,
    splitMethod: 'random',
    hyperparameters: {
      maxDepth: 4,
      minSamplesLeaf: 2,
      nEstimators: 10,
      regularization: 0.05,
    },
  });

  // Verify all 3 models are evaluated
  const algos = ['Linear Regression', 'Decision Tree', 'Random Forest'] as const;
  for (const algo of algos) {
    const res = results[algo];
    assert.ok(res, `Missing model result for ${algo}`);
    assert.ok(res.metrics.mae > 0, `${algo} MAE should be positive`);
    assert.ok(res.metrics.rmse > 0, `${algo} RMSE should be positive`);
    assert.ok(res.testPredictions.length > 0, `${algo} should have test predictions`);
    assert.ok(res.featureImportances.length > 0, `${algo} should compute feature importances`);
  }

  assert.ok(['Linear Regression', 'Decision Tree', 'Random Forest'].includes(bestAlgorithm));
});

test('Prediction Engine applies guardrails and generates recommendations', () => {
  const dataset = generateSampleDataset();
  const engineeredData = dataset.map(engineerFeatures);
  const { results, preprocessingState } = trainModelsPipeline({
    records: engineeredData,
    splitRatio: 0.8,
  });

  const settings: AppSettings = {
    currency: 'INR',
    maxSurgePercent: 20, // max +20%
    maxDiscountPercent: 25, // max -25%
    minMarginFloorRatio: 0.7,
    lowStockThreshold: 5,
    highDemandThreshold: 70,
    defaultModel: 'Random Forest',
    autoSaveHistory: true,
  };

  const input: PredictionInput = {
    product_name: 'Test Gaming Console',
    category: 'Electronics',
    current_price: 30000,
    historical_price: 29000,
    demand: 90,
    stock_available: 3,
    competitor_price: 33000,
    season: 'Festival',
    promotion_active: false,
  };

  const pred = executeModelPrediction(
    input,
    'Random Forest',
    results['Random Forest'],
    preprocessingState,
    settings
  );

  assert.ok(pred.rawPredictedPrice > 0, 'Predicted price should be positive');
  assert.ok(pred.recommendedPrice > 0, 'Recommended price should be positive');
  assert.ok(
    pred.recommendedPrice <= input.current_price * 1.2 + 1,
    'Price should not violate max surge guardrail'
  );
  assert.ok(
    pred.recommendedPrice >= input.current_price * 0.75 - 1,
    'Price should not violate max discount guardrail'
  );
  assert.ok(pred.keyFactors.length > 0, 'Key driving factors should be identified');
});
