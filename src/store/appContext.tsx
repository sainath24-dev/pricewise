/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { PreprocessingState } from '../data/preprocessor';
import { INITIAL_DEMO_DATASET } from '../data/sampleData';
import { validateAndCleanDataset } from '../data/validator';
import { engineerDataset, engineerFeatures } from '../features/engineering';
import { executeModelPrediction, trainModelsPipeline } from '../ml/pipeline';
import {
  AlgorithmType,
  AppSettings,
  CartItem,
  Currency,
  DataQualityReport,
  DataRecord,
  EngineeredRecord,
  Hyperparameters,
  PredictionInput,
  PredictionResult,
  PriceAlert,
  StoreProduct,
  TrainedModelResult,
} from '../types';
import { INITIAL_STORE_PRODUCTS } from './storefrontData';

interface AppContextType {
  // Data
  dataset: DataRecord[];
  engineeredDataset: EngineeredRecord[];
  dataReport: DataQualityReport;
  isCustomDataset: boolean;
  datasetName: string;
  loadDataset: (rows: Record<string, any>[], name?: string) => void;
  resetToDemoDataset: () => void;

  // ML Models
  trainedModels: Record<AlgorithmType, TrainedModelResult> | null;
  activeModel: AlgorithmType;
  setActiveModel: (algo: AlgorithmType) => void;
  preprocessingState: PreprocessingState | null;
  isTraining: boolean;
  trainProgress: number;
  trainAllModels: (
    hyperparameters?: Partial<Hyperparameters>,
    splitRatio?: number,
    splitMethod?: 'random' | 'chronological'
  ) => void;

  // Predictions
  predict: (input: PredictionInput, specificModel?: AlgorithmType) => PredictionResult | null;
  predictionsHistory: PredictionResult[];
  deletePrediction: (id: string) => void;
  clearHistory: () => void;

  // Settings
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  formatCurrency: (amount: number) => string;

  // Storefront & Cart
  storeProducts: StoreProduct[];
  updateStoreProductStock: (id: string, newStock: number) => void;
  updateStoreProductDemand: (id: string, newDemand: number) => void;
  updateStoreProductCompetitors: (id: string, amazonPrice: number, flipkartPrice: number) => void;
  cart: CartItem[];
  addToCart: (product: StoreProduct, qty?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;

  // Price Alerts
  priceAlerts: PriceAlert[];
  setPriceAlert: (productId: string, targetPrice: number) => void;
  removePriceAlert: (productId: string) => void;
  triggeredAlertNotification: { alert: PriceAlert; currentPrice: number } | null;
  dismissAlertNotification: () => void;
  simulatePriceDropForAlert: (productId: string) => void;
}

const DEFAULT_SETTINGS: AppSettings = {
  currency: 'INR',
  maxSurgePercent: 30,
  maxDiscountPercent: 35,
  minMarginFloorRatio: 0.65,
  lowStockThreshold: 5,
  highDemandThreshold: 75,
  defaultModel: 'Random Forest',
  autoSaveHistory: true,
};

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Dataset state
  const [dataset, setDataset] = useState<DataRecord[]>(INITIAL_DEMO_DATASET);
  const [datasetName, setDatasetName] = useState<string>('DPS E-Commerce Canonical Demo Dataset');
  const [isCustomDataset, setIsCustomDataset] = useState<boolean>(false);

  const { cleanedData, report } = useMemo(() => {
    return validateAndCleanDataset(dataset);
  }, [dataset]);

  const engineeredDataset = useMemo(() => {
    return engineerDataset(cleanedData);
  }, [cleanedData]);

  // 2. Settings state (with localStorage persistence)
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('pricewise_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem('pricewise_settings', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // 3. ML Models state
  const [trainedModels, setTrainedModels] = useState<Record<AlgorithmType, TrainedModelResult> | null>(null);
  const [activeModel, setActiveModel] = useState<AlgorithmType>(settings.defaultModel);
  const [preprocessingState, setPreprocessingState] = useState<PreprocessingState | null>(null);
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [trainProgress, setTrainProgress] = useState<number>(0);

  // 4. Prediction History
  const [predictionsHistory, setPredictionsHistory] = useState<PredictionResult[]>(() => {
    try {
      const saved = localStorage.getItem('pricewise_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const deletePrediction = (id: string) => {
    setPredictionsHistory((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      try {
        localStorage.setItem('pricewise_history', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const clearHistory = () => {
    setPredictionsHistory([]);
    try {
      localStorage.removeItem('pricewise_history');
    } catch {}
  };

  // 5. Training action
  const trainAllModels = (
    hyperparameters?: Partial<Hyperparameters>,
    splitRatio: number = 0.8,
    splitMethod: 'random' | 'chronological' = 'random'
  ) => {
    setIsTraining(true);
    setTrainProgress(15);

    setTimeout(() => {
      setTrainProgress(50);
      try {
        const { results, bestAlgorithm, preprocessingState: prep } = trainModelsPipeline({
          records: engineeredDataset,
          splitRatio,
          splitMethod,
          hyperparameters,
          datasetId: datasetName,
        });

        setTrainedModels(results);
        setPreprocessingState(prep);
        setActiveModel(bestAlgorithm);
        setTrainProgress(100);
      } catch (err) {
        console.error('Training pipeline error:', err);
      } finally {
        setTimeout(() => {
          setIsTraining(false);
          setTrainProgress(0);
        }, 400);
      }
    }, 250);
  };

  // Automatically train initial baseline models on initial mount so all pages have immediate real metrics
  useEffect(() => {
    if (!trainedModels) {
      trainAllModels();
    }
  }, []);

  // 6. Predict action
  const predict = (input: PredictionInput, specificModel?: AlgorithmType): PredictionResult | null => {
    const modelToUse = specificModel || activeModel;
    if (!trainedModels || !trainedModels[modelToUse] || !preprocessingState) {
      return null;
    }

    const modelResult = trainedModels[modelToUse];
    const prediction = executeModelPrediction(
      input,
      modelToUse,
      modelResult,
      preprocessingState,
      settings
    );

    if (settings.autoSaveHistory) {
      setPredictionsHistory((prev) => {
        const updated = [prediction, ...prev].slice(0, 50); // keep last 50
        try {
          localStorage.setItem('pricewise_history', JSON.stringify(updated));
        } catch {}
        return updated;
      });
    }

    return prediction;
  };

  // 7. Load / Reset Dataset
  const loadDataset = (rows: Record<string, any>[], name: string = 'Uploaded Dataset') => {
    const { cleanedData: newCleaned } = validateAndCleanDataset(rows);
    if (newCleaned.length > 0) {
      setDataset(newCleaned);
      setDatasetName(name);
      setIsCustomDataset(true);
      // Invalidate existing models so user trains on the newly loaded data
      setTrainedModels(null);
      setPreprocessingState(null);
    }
  };

  const resetToDemoDataset = () => {
    setDataset(INITIAL_DEMO_DATASET);
    setDatasetName('DPS E-Commerce Canonical Demo Dataset');
    setIsCustomDataset(false);
    trainAllModels();
  };

  // 8. Currency Formatter
  const formatCurrency = (amount: number): string => {
    const curr = settings.currency;
    if (curr === 'USD') {
      // Approximate 1 USD = 83 INR
      const inUsd = amount / 83;
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(inUsd);
    } else if (curr === 'EUR') {
      const inEur = amount / 90;
      return new Intl.NumberFormat('en-DE', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
      }).format(inEur);
    } else {
      // INR
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(amount);
    }
  };

  // 9. Storefront & Cart state
  const [storeProducts, setStoreProducts] = useState<StoreProduct[]>(INITIAL_STORE_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);

  const updateStoreProductStock = (id: string, newStock: number) => {
    setStoreProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        // Recalculate dynamic price for this product
        const stockSafe = Math.max(0, newStock);
        const demandRatio = (p.demandIndex - 50) / 100;
        const stockScarcity = stockSafe <= 5 ? 0.09 : stockSafe > 40 ? -0.07 : 0;
        const compDiffRatio = (p.competitorPrice - p.currentPrice) / p.currentPrice;
        const compWeight = 0.3 * compDiffRatio;
        const multiplier = Math.max(0.75, Math.min(1.25, 1 + demandRatio * 0.18 + stockScarcity + compWeight));
        const newDynamicPrice = Math.round(p.currentPrice * multiplier);
        const deltaPercent = Number((((newDynamicPrice - p.currentPrice) / p.currentPrice) * 100).toFixed(1));

        let badgeType: 'surge' | 'discount' | 'match' | 'neutral' = 'neutral';
        let label = 'Market Stable';
        let reason = 'Price aligned with market dynamics.';

        if (stockSafe <= 5) {
          badgeType = 'surge';
          label = `Scarcity Surge (+${deltaPercent}%)`;
          reason = `Low inventory (${stockSafe} units) triggered dynamic scarcity surge.`;
        } else if (compDiffRatio < -0.05) {
          badgeType = 'match';
          label = `Competitor Counter (${deltaPercent}%)`;
          reason = `Discount applied to match competitor undercut.`;
        } else if (stockSafe > 40) {
          badgeType = 'discount';
          label = `Volume Discount (${deltaPercent}%)`;
          reason = `Surplus inventory clearance pricing activated.`;
        }

        return {
          ...p,
          stock: stockSafe,
          dynamicPrice: newDynamicPrice,
          priceDeltaPercent: deltaPercent,
          dynamicBadge: { label, type: badgeType, reason },
        };
      })
    );
  };

  const updateStoreProductDemand = (id: string, newDemand: number) => {
    setStoreProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const demandSafe = Math.min(100, Math.max(10, newDemand));
        const demandRatio = (demandSafe - 50) / 100;
        const stockScarcity = p.stock <= 5 ? 0.09 : p.stock > 40 ? -0.07 : 0;
        const compDiffRatio = (p.competitorPrice - p.currentPrice) / p.currentPrice;
        const compWeight = 0.3 * compDiffRatio;
        const multiplier = Math.max(0.75, Math.min(1.25, 1 + demandRatio * 0.18 + stockScarcity + compWeight));
        const newDynamicPrice = Math.round(p.currentPrice * multiplier);
        const deltaPercent = Number((((newDynamicPrice - p.currentPrice) / p.currentPrice) * 100).toFixed(1));

        let badgeType: 'surge' | 'discount' | 'match' | 'neutral' = 'neutral';
        let label = 'Market Stable';
        let reason = 'Price aligned with demand equilibrium.';

        if (demandSafe > 75) {
          badgeType = 'surge';
          label = `Peak Demand (+${deltaPercent}%)`;
          reason = `Customer search index reached ${demandSafe}/100.`;
        } else if (demandSafe < 40) {
          badgeType = 'discount';
          label = `Demand Stimulus (${deltaPercent}%)`;
          reason = `Price lowered to stimulate purchasing interest.`;
        }

        return {
          ...p,
          demandIndex: demandSafe,
          dynamicPrice: newDynamicPrice,
          priceDeltaPercent: deltaPercent,
          dynamicBadge: { label, type: badgeType, reason },
        };
      })
    );
  };

  const updateStoreProductCompetitors = (id: string, amazonPrice: number, flipkartPrice: number) => {
    setStoreProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const validAmazon = Math.max(1, amazonPrice);
        const validFlipkart = Math.max(1, flipkartPrice);
        const lowestCompetitor = Math.min(validAmazon, validFlipkart);
        const stockScarcity = p.stock <= 5 ? 0.09 : p.stock > 40 ? -0.07 : 0;
        const demandRatio = (p.demandIndex - 50) / 100;
        const compDiffRatio = (lowestCompetitor - p.currentPrice) / p.currentPrice;
        const compWeight = 0.35 * compDiffRatio;
        const multiplier = Math.max(0.75, Math.min(1.25, 1 + demandRatio * 0.18 + stockScarcity + compWeight));
        const newDynamicPrice = Math.round(p.currentPrice * multiplier);
        const deltaPercent = Number((((newDynamicPrice - p.currentPrice) / p.currentPrice) * 100).toFixed(1));

        let badgeType: 'surge' | 'discount' | 'match' | 'neutral' = 'neutral';
        let label = 'Market Aligned';
        let reason = `Aligned with Amazon (${validAmazon}) and Flipkart (${validFlipkart}).`;

        if (lowestCompetitor < p.currentPrice) {
          badgeType = 'match';
          label = `Marketplace Counter (${deltaPercent}%)`;
          reason = `Rival platform discount (${validAmazon < validFlipkart ? 'Amazon' : 'Flipkart'} at ₹${lowestCompetitor}) countered.`;
        } else if (deltaPercent > 0) {
          badgeType = 'surge';
          label = `Premium Spread (+${deltaPercent}%)`;
          reason = `Rivals priced higher; PriceWise captures optimal margin while remaining lowest.`;
        }

        return {
          ...p,
          amazonPrice: validAmazon,
          flipkartPrice: validFlipkart,
          competitorPrice: lowestCompetitor,
          dynamicPrice: newDynamicPrice,
          priceDeltaPercent: deltaPercent,
          dynamicBadge: { label, type: badgeType, reason },
        };
      })
    );
  };

  const addToCart = (product: StoreProduct, qty: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      }
      return [...prev, { product, quantity: qty }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateCartQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity: qty } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.dynamicPrice * item.quantity, 0);
  }, [cart]);

  const cartCount = useMemo(() => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  }, [cart]);

  // 10. Price Alerts State & Monitoring
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>(() => {
    try {
      const saved = localStorage.getItem('pricewise_price_alerts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [triggeredAlertNotification, setTriggeredAlertNotification] = useState<{
    alert: PriceAlert;
    currentPrice: number;
  } | null>(null);

  const setPriceAlert = (productId: string, targetPrice: number) => {
    const prod = storeProducts.find((p) => p.id === productId);
    if (!prod) return;
    const newAlert: PriceAlert = {
      productId,
      productTitle: prod.title,
      targetPrice,
      initialPrice: prod.dynamicPrice,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      triggered: false,
    };
    setPriceAlerts((prev) => {
      const filtered = prev.filter((a) => a.productId !== productId);
      const updated = [...filtered, newAlert];
      try {
        localStorage.setItem('pricewise_price_alerts', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (prod.dynamicPrice <= targetPrice) {
      setTriggeredAlertNotification({ alert: newAlert, currentPrice: prod.dynamicPrice });
    }
  };

  const removePriceAlert = (productId: string) => {
    setPriceAlerts((prev) => {
      const updated = prev.filter((a) => a.productId !== productId);
      try {
        localStorage.setItem('pricewise_price_alerts', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const dismissAlertNotification = () => {
    setTriggeredAlertNotification(null);
  };

  const simulatePriceDropForAlert = (productId: string) => {
    const prod = storeProducts.find((p) => p.id === productId);
    const alert = priceAlerts.find((a) => a.productId === productId);
    if (!prod) return;

    const target = alert ? alert.targetPrice : Math.round(prod.dynamicPrice * 0.9);
    const targetComp = Math.round(target * 0.98);
    updateStoreProductCompetitors(productId, targetComp, targetComp);
    updateStoreProductStock(productId, 48); // surplus clearance triggers discount

    const activeAlert: PriceAlert = alert || {
      productId,
      productTitle: prod.title,
      targetPrice: target,
      initialPrice: prod.dynamicPrice,
      createdAt: 'Just now',
      triggered: true,
    };
    setTriggeredAlertNotification({ alert: activeAlert, currentPrice: targetComp });
  };

  useEffect(() => {
    priceAlerts.forEach((alert) => {
      if (!alert.triggered) {
        const prod = storeProducts.find((p) => p.id === alert.productId);
        if (prod && prod.dynamicPrice <= alert.targetPrice) {
          setTriggeredAlertNotification({ alert, currentPrice: prod.dynamicPrice });
          setPriceAlerts((prev) =>
            prev.map((a) => (a.productId === alert.productId ? { ...a, triggered: true } : a))
          );
        }
      }
    });
  }, [storeProducts]);

  return (
    <AppContext.Provider
      value={{
        dataset: cleanedData,
        engineeredDataset,
        dataReport: report,
        isCustomDataset,
        datasetName,
        loadDataset,
        resetToDemoDataset,
        trainedModels,
        activeModel,
        setActiveModel,
        preprocessingState,
        isTraining,
        trainProgress,
        trainAllModels,
        predict,
        predictionsHistory,
        deletePrediction,
        clearHistory,
        settings,
        updateSettings,
        formatCurrency,
        storeProducts,
        updateStoreProductStock,
        updateStoreProductDemand,
        updateStoreProductCompetitors,
        cart,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        cartTotal,
        cartCount,
        priceAlerts,
        setPriceAlert,
        removePriceAlert,
        triggeredAlertNotification,
        dismissAlertNotification,
        simulatePriceDropForAlert,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
