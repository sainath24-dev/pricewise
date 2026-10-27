/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  fitPreprocessing,
  PreprocessingState,
  splitTrainTest,
  transformPredictionInput,
  transformRecord,
} from '../data/preprocessor';
import {
  AlgorithmType,
  AppSettings,
  EngineeredRecord,
  Hyperparameters,
  PredictionInput,
  PredictionResult,
  TrainedModelResult,
} from '../types';
import { DecisionTreeRegressor } from './decisionTree';
import { buildTestPredictions, calculateMetrics } from './evaluation';
import { LinearRegressionModel } from './linearRegression';
import { RandomForestRegressor } from './randomForest';

export interface TrainAllOptions {
  records: EngineeredRecord[];
  splitRatio?: number;
  splitMethod?: 'random' | 'chronological';
  hyperparameters?: Partial<Hyperparameters>;
  datasetId?: string;
}

export function trainModelsPipeline(options: TrainAllOptions): {
  results: Record<AlgorithmType, TrainedModelResult>;
  bestAlgorithm: AlgorithmType;
  preprocessingState: PreprocessingState;
} {
  const {
    records,
    splitRatio = 0.8,
    splitMethod = 'random',
    datasetId = 'CANONICAL_DATASET',
  } = options;

  const defaultHyper: Hyperparameters = {
    maxDepth: options.hyperparameters?.maxDepth ?? 5,
    minSamplesLeaf: options.hyperparameters?.minSamplesLeaf ?? 3,
    nEstimators: options.hyperparameters?.nEstimators ?? 20,
    regularization: options.hyperparameters?.regularization ?? 0.05,
  };

  // 1. Train / Test Split
  const { train, test } = splitTrainTest(records, splitRatio, splitMethod);

  // 2. Fit Preprocessing ONLY on training data to prevent data leakage
  const prepState = fitPreprocessing(train);

  // 3. Transform train and test matrices
  // For Linear Regression, we use normalized features for numerical stability
  const X_train_norm = train.map((r) => transformRecord(r, prepState, true));
  const X_test_norm = test.map((r) => transformRecord(r, prepState, true));

  // For Tree models, unnormalized features preserve natural unit thresholds
  const X_train_raw = train.map((r) => transformRecord(r, prepState, false));
  const X_test_raw = test.map((r) => transformRecord(r, prepState, false));

  const y_train = train.map((r) => r.target_price);
  const y_test = test.map((r) => r.target_price);
  const testMeta = test.map((r) => ({
    product_name: r.product_name,
    category: r.category,
  }));

  const trainedAt = new Date().toISOString();

  // --- Model A: Linear Regression ---
  const t0_lr = performance.now();
  const lrModel = new LinearRegressionModel();
  lrModel.fit(X_train_norm, y_train, prepState.featureNames, defaultHyper.regularization);
  const lrTestPreds = lrModel.predictBatch(X_test_norm);
  const t1_lr = performance.now();

  const lrMetrics = {
    ...calculateMetrics(y_test, lrTestPreds),
    trainingTimeMs: Math.round(t1_lr - t0_lr),
    sampleCount: train.length,
    testCount: test.length,
  };

  const lrResult: TrainedModelResult = {
    algorithm: 'Linear Regression',
    trainedAt,
    datasetId,
    metrics: lrMetrics,
    featureImportances: lrModel.getFeatureImportances(),
    testPredictions: buildTestPredictions(y_test, lrTestPreds, testMeta),
    hyperparameters: defaultHyper,
    serializedModel: JSON.stringify(lrModel.toJSON()),
  };

  // --- Model B: Decision Tree ---
  const t0_dt = performance.now();
  const dtModel = new DecisionTreeRegressor(
    defaultHyper.maxDepth,
    defaultHyper.minSamplesLeaf
  );
  dtModel.fit(X_train_raw, y_train, prepState.featureNames);
  const dtTestPreds = dtModel.predict(X_test_raw);
  const t1_dt = performance.now();

  const dtMetrics = {
    ...calculateMetrics(y_test, dtTestPreds),
    trainingTimeMs: Math.round(t1_dt - t0_dt),
    sampleCount: train.length,
    testCount: test.length,
  };

  const dtResult: TrainedModelResult = {
    algorithm: 'Decision Tree',
    trainedAt,
    datasetId,
    metrics: dtMetrics,
    featureImportances: dtModel.getFeatureImportances(),
    testPredictions: buildTestPredictions(y_test, dtTestPreds, testMeta),
    hyperparameters: defaultHyper,
    serializedModel: dtModel.toJSON(),
  };

  // --- Model C: Random Forest ---
  const t0_rf = performance.now();
  const rfModel = new RandomForestRegressor(
    defaultHyper.nEstimators,
    defaultHyper.maxDepth,
    defaultHyper.minSamplesLeaf
  );
  rfModel.fit(X_train_raw, y_train, prepState.featureNames);
  const rfTestPreds = rfModel.predict(X_test_raw);
  const t1_rf = performance.now();

  const rfMetrics = {
    ...calculateMetrics(y_test, rfTestPreds),
    trainingTimeMs: Math.round(t1_rf - t0_rf),
    sampleCount: train.length,
    testCount: test.length,
  };

  const rfResult: TrainedModelResult = {
    algorithm: 'Random Forest',
    trainedAt,
    datasetId,
    metrics: rfMetrics,
    featureImportances: rfModel.getFeatureImportances(),
    testPredictions: buildTestPredictions(y_test, rfTestPreds, testMeta),
    hyperparameters: defaultHyper,
    serializedModel: rfModel.toJSON(),
  };

  const results: Record<AlgorithmType, TrainedModelResult> = {
    'Linear Regression': lrResult,
    'Decision Tree': dtResult,
    'Random Forest': rfResult,
  };

  // Determine best algorithm primarily by lowest MAE, secondary by highest R²
  const algorithms: AlgorithmType[] = ['Linear Regression', 'Decision Tree', 'Random Forest'];
  algorithms.sort((a, b) => {
    const maDiff = results[a].metrics.mae - results[b].metrics.mae;
    if (Math.abs(maDiff) > 1) return maDiff;
    return results[b].metrics.r2 - results[a].metrics.r2;
  });

  return {
    results,
    bestAlgorithm: algorithms[0],
    preprocessingState: prepState,
  };
}

export function executeModelPrediction(
  input: PredictionInput,
  algorithm: AlgorithmType,
  modelResult: TrainedModelResult,
  prepState: PreprocessingState,
  settings: AppSettings
): PredictionResult {
  const isLR = algorithm === 'Linear Regression';
  const featureVec = transformPredictionInput(input, prepState, isLR);

  let rawPrediction = 0;

  if (algorithm === 'Linear Regression') {
    const lr = LinearRegressionModel.fromJSON(JSON.parse(modelResult.serializedModel));
    rawPrediction = lr.predict(featureVec);
  } else if (algorithm === 'Decision Tree') {
    const dt = DecisionTreeRegressor.fromJSON(modelResult.serializedModel);
    rawPrediction = dt.predictSingle(featureVec);
  } else {
    const rf = RandomForestRegressor.fromJSON(modelResult.serializedModel);
    rawPrediction = rf.predictSingle(featureVec).prediction;
  }

  // Ensure positive finite number
  if (isNaN(rawPrediction) || rawPrediction <= 0) {
    rawPrediction = input.current_price;
  }

  // Business Guardrails Logic
  const appliedGuardrails: string[] = [];
  let recommendedPrice = rawPrediction;

  const currentPrice = input.current_price;
  const maxAllowedPrice = currentPrice * (1 + settings.maxSurgePercent / 100);
  const minAllowedDiscountPrice = currentPrice * (1 - settings.maxDiscountPercent / 100);
  const minMarginFloor = input.historical_price * settings.minMarginFloorRatio;

  if (recommendedPrice > maxAllowedPrice) {
    recommendedPrice = maxAllowedPrice;
    appliedGuardrails.push(
      `Surge Cap: Price capped at +${settings.maxSurgePercent}% above current price to protect customer retention.`
    );
  }

  if (recommendedPrice < minAllowedDiscountPrice) {
    recommendedPrice = minAllowedDiscountPrice;
    appliedGuardrails.push(
      `Discount Floor: Price limited to -${settings.maxDiscountPercent}% below current price to prevent brand devaluation.`
    );
  }

  if (recommendedPrice < minMarginFloor) {
    recommendedPrice = minMarginFloor;
    appliedGuardrails.push(
      `Margin Protection: Price elevated to ${Math.round(
        settings.minMarginFloorRatio * 100
      )}% of historical baseline to maintain profit margin.`
    );
  }

  if (input.stock_available <= settings.lowStockThreshold) {
    appliedGuardrails.push(
      `Inventory Alert: Low stock (${input.stock_available} units left) allows premium pricing.`
    );
  }

  const rawRounded = Math.round(rawPrediction);
  const recommendedRounded = Math.round(recommendedPrice);
  const absoluteChange = recommendedRounded - currentPrice;
  const percentageChange = Number(((absoluteChange / currentPrice) * 100).toFixed(2));

  // Determine key driving factors
  const keyFactors: PredictionResult['keyFactors'] = [];

  if (input.demand > settings.highDemandThreshold) {
    keyFactors.push({
      factor: 'Elevated Demand',
      impact: 'positive',
      description: `Daily customer demand score of ${input.demand}/100 signals strong willingness to purchase.`,
    });
  } else if (input.demand < 35) {
    keyFactors.push({
      factor: 'Subdued Demand',
      impact: 'negative',
      description: `Lower demand score of ${input.demand}/100 indicates promotional pricing may be required.`,
    });
  }

  if (input.stock_available < 10) {
    keyFactors.push({
      factor: 'Low Inventory Scarcity',
      impact: 'positive',
      description: `Scarcity premium can be captured as only ${input.stock_available} units remain in inventory.`,
    });
  } else if (input.stock_available > 60) {
    keyFactors.push({
      factor: 'High Inventory Level',
      impact: 'negative',
      description: `High stock (${input.stock_available} units) encourages price competitiveness to accelerate inventory turnover.`,
    });
  }

  const compDiff = input.competitor_price - currentPrice;
  if (compDiff > 0) {
    keyFactors.push({
      factor: 'Competitor Higher Priced',
      impact: 'positive',
      description: `Competitor is charging ${Math.abs(compDiff)} more, leaving room for price optimization without losing competitive edge.`,
    });
  } else if (compDiff < 0) {
    keyFactors.push({
      factor: 'Competitor Undercutting',
      impact: 'negative',
      description: `Competitor is priced ${Math.abs(compDiff)} lower, creating downward market pressure.`,
    });
  }

  if (input.season === 'Festival' || input.season === 'Peak') {
    keyFactors.push({
      factor: `${input.season} Seasonality`,
      impact: 'positive',
      description: `Seasonal festival shopping appetite supports resilient pricing.`,
    });
  }

  return {
    id: `PRED-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    input,
    rawPredictedPrice: rawRounded,
    recommendedPrice: recommendedRounded,
    currentPrice,
    absoluteChange,
    percentageChange,
    modelUsed: algorithm,
    modelR2: modelResult.metrics.r2,
    modelMae: modelResult.metrics.mae,
    appliedGuardrails,
    keyFactors,
  };
}
