/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Currency = 'INR' | 'USD' | 'EUR';

export interface DataRecord {
  id: string;
  date: string;
  product_id: string;
  product_name: string;
  category: string;
  current_price: number;
  historical_price: number;
  target_price: number; // ground truth optimal selling price
  demand: number; // daily customer inquiries / views / traffic index (1-100)
  stock_available: number; // inventory in stock (units)
  competitor_price: number; // price offered by competitor (Flipkart/Amazon/etc)
  units_sold: number; // historical daily sales volume
  season: 'Festival' | 'Peak' | 'Normal' | 'Clearance';
  promotion_active: boolean; // 1 or 0
}

export interface EngineeredRecord extends DataRecord {
  demand_to_stock_ratio: number;
  competitor_price_diff: number;
  competitor_price_ratio: number;
  historical_price_change: number;
  season_intensity: number;
  promo_boost: number;
}

export interface DataQualityReport {
  totalRows: number;
  validRows: number;
  missingValuesCount: number;
  duplicateRowsCount: number;
  negativeStockCount: number;
  negativeDemandCount: number;
  invalidPriceCount: number;
  categories: string[];
  dateRange: { start: string; end: string } | null;
  features: string[];
  targetColumn: string;
  cleaningLog: string[];
}

export type AlgorithmType = 'Linear Regression' | 'Decision Tree' | 'Random Forest';

export interface ModelMetrics {
  mae: number;
  rmse: number;
  r2: number;
  trainingTimeMs: number;
  sampleCount: number;
  testCount: number;
}

export interface Hyperparameters {
  // Decision Tree & Random Forest
  maxDepth: number;
  minSamplesLeaf: number;
  // Random Forest
  nEstimators: number;
  // Linear Regression
  regularization: number;
}

export interface FeatureImportance {
  feature: string;
  importance: number; // 0 to 1
  coefficient?: number; // for linear regression
}

export interface TestPrediction {
  actual: number;
  predicted: number;
  residual: number;
  product_name?: string;
  category?: string;
}

export interface TrainedModelResult {
  algorithm: AlgorithmType;
  trainedAt: string;
  datasetId: string;
  metrics: ModelMetrics;
  featureImportances: FeatureImportance[];
  testPredictions: TestPrediction[];
  hyperparameters: Hyperparameters;
  // Serialized weights/tree structure for fast evaluation
  serializedModel: string;
}

export interface PredictionInput {
  product_name?: string;
  category: string;
  current_price: number;
  historical_price: number;
  demand: number;
  stock_available: number;
  competitor_price: number;
  season: 'Festival' | 'Peak' | 'Normal' | 'Clearance';
  promotion_active: boolean;
  units_sold?: number;
}

export interface PredictionResult {
  id: string;
  timestamp: string;
  input: PredictionInput;
  rawPredictedPrice: number;
  recommendedPrice: number;
  currentPrice: number;
  absoluteChange: number;
  percentageChange: number;
  modelUsed: AlgorithmType;
  modelR2: number;
  modelMae: number;
  appliedGuardrails: string[];
  keyFactors: { factor: string; impact: 'positive' | 'negative' | 'neutral'; description: string }[];
}

export interface AppSettings {
  currency: Currency;
  maxSurgePercent: number; // e.g. 35% max price increase above current
  maxDiscountPercent: number; // e.g. 40% max price drop below current
  minMarginFloorRatio: number; // min price ratio compared to historical (e.g. 0.65)
  lowStockThreshold: number; // e.g. 5 units
  highDemandThreshold: number; // e.g. 70 index
  defaultModel: AlgorithmType;
  autoSaveHistory: boolean;
}

export interface StoreProduct {
  id: string;
  title: string;
  category: string;
  basePrice: number; // base list price
  currentPrice: number;
  historicalPrice: number;
  competitorPrice: number;
  amazonPrice: number;
  flipkartPrice: number;
  stock: number;
  demandIndex: number;
  season: 'Festival' | 'Peak' | 'Normal' | 'Clearance';
  promotionActive: boolean;
  rating: number;
  reviewsCount: number;
  image: string;
  description: string;
  features: string[];
  dynamicPrice: number;
  priceDeltaPercent: number;
  dynamicBadge: {
    label: string;
    type: 'surge' | 'discount' | 'match' | 'neutral';
    reason: string;
  };
}

export interface CartItem {
  product: StoreProduct;
  quantity: number;
}

export interface PriceAlert {
  productId: string;
  productTitle: string;
  targetPrice: number;
  initialPrice: number;
  createdAt: string;
  triggered?: boolean;
}
