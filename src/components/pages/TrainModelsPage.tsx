/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Cpu,
  Layers,
  Play,
  RotateCcw,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../store/appContext';
import { AlgorithmType, Hyperparameters } from '../../types';

export const TrainModelsPage: React.FC = () => {
  const {
    dataset,
    engineeredDataset,
    trainedModels,
    activeModel,
    setActiveModel,
    trainAllModels,
    isTraining,
    trainProgress,
    formatCurrency,
  } = useApp();

  const [splitRatio, setSplitRatio] = useState<number>(0.8);
  const [splitMethod, setSplitMethod] = useState<'random' | 'chronological'>('random');

  // Hyperparameters
  const [maxDepth, setMaxDepth] = useState<number>(5);
  const [minSamplesLeaf, setMinSamplesLeaf] = useState<number>(3);
  const [nEstimators, setNEstimators] = useState<number>(20);
  const [regularization, setRegularization] = useState<number>(0.05);

  const handleTrain = () => {
    trainAllModels(
      {
        maxDepth,
        minSamplesLeaf,
        nEstimators,
        regularization,
      },
      splitRatio,
      splitMethod
    );
  };

  const handleResetDefaults = () => {
    setSplitRatio(0.8);
    setSplitMethod('random');
    setMaxDepth(5);
    setMinSamplesLeaf(3);
    setNEstimators(20);
    setRegularization(0.05);
  };

  const trainCount = Math.floor(engineeredDataset.length * splitRatio);
  const testCount = engineeredDataset.length - trainCount;

  return (
    <div className="space-y-6">
      {/* Configuration Header */}
      <div className="rounded-xl border border-neutral-200/90 bg-white p-5 shadow-xs">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-neutral-900">
                Supervised Model Training Studio (Phase 4)
              </h2>
              <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                Scikit-Learn Methodology
              </span>
            </div>
            <p className="mt-1 text-xs text-neutral-500">
              Train and compare Linear Regression, Decision Tree, and Random Forest on {engineeredDataset.length} engineered observations
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleResetDefaults}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-700 shadow-2xs hover:bg-neutral-50"
            >
              <RotateCcw className="h-3.5 w-3.5 text-neutral-500" />
              <span>Defaults</span>
            </button>
            <button
              onClick={handleTrain}
              disabled={isTraining}
              className="flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-800 disabled:opacity-50 transition-colors"
            >
              <Play className="h-3.5 w-3.5" />
              <span>{isTraining ? 'Training Models...' : 'Execute Training Pipeline'}</span>
            </button>
          </div>
        </div>

        {/* Training Progress bar */}
        {isTraining && (
          <div className="mt-5 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-neutral-700">
              <span className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-emerald-600 animate-spin" />
                <span>Running Matrix Decompositions & Tree Split Ensembles...</span>
              </span>
              <span className="font-mono text-emerald-700">{trainProgress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
              <div
                className="h-full bg-emerald-600 transition-all duration-300"
                style={{ width: `${trainProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Hyperparameter & Split Settings Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Train/Test Splitting */}
        <div className="rounded-xl border border-neutral-200/90 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900">Dataset Partitioning</h3>
              <p className="text-xs text-neutral-500">
                Split raw dataset into disjoint training and out-of-sample evaluation sets
              </p>
            </div>
            <span className="rounded bg-neutral-100 px-2 py-0.5 font-mono text-xs text-neutral-700">
              {Math.round(splitRatio * 100)}% / {Math.round((1 - splitRatio) * 100)}%
            </span>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs text-neutral-600 mb-1">
                <span>Training Partition Ratio:</span>
                <span className="font-mono font-semibold text-neutral-900">
                  {Math.round(splitRatio * 100)}% ({trainCount} records)
                </span>
              </div>
              <input
                type="range"
                min="0.6"
                max="0.85"
                step="0.05"
                value={splitRatio}
                onChange={(e) => setSplitRatio(parseFloat(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-400 font-mono mt-1">
                <span>60% (Rapid)</span>
                <span>80% (Recommended by DPS)</span>
                <span>85% (Max Data)</span>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-xs font-medium text-neutral-700">Splitting Methodology:</span>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSplitMethod('random')}
                  className={`rounded-lg border p-3 text-left text-xs transition-colors ${
                    splitMethod === 'random'
                      ? 'border-emerald-600 bg-emerald-50/50 font-medium text-emerald-950'
                      : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  <p className="font-semibold">Deterministic Random Split</p>
                  <p className="mt-0.5 text-[11px] text-neutral-500">
                    Seeded pseudorandom permutation for standard I.I.D. evaluation.
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setSplitMethod('chronological')}
                  className={`rounded-lg border p-3 text-left text-xs transition-colors ${
                    splitMethod === 'chronological'
                      ? 'border-emerald-600 bg-emerald-50/50 font-medium text-emerald-950'
                      : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  <p className="font-semibold">Chronological Time Split</p>
                  <p className="mt-0.5 text-[11px] text-neutral-500">
                    Sorts by date to prevent future lookahead leakage.
                  </p>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Model Hyperparameters */}
        <div className="rounded-xl border border-neutral-200/90 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900">Hyperparameter Tuning</h3>
              <p className="text-xs text-neutral-500">Controls tree depth and regularization parameters</p>
            </div>
            <Sliders className="h-4 w-4 text-neutral-400" />
          </div>

          <div className="space-y-4 pt-1 text-xs">
            {/* Tree Max Depth */}
            <div>
              <div className="flex justify-between text-neutral-700 mb-1">
                <span>Tree Maximum Depth (`max_depth`):</span>
                <span className="font-mono font-semibold text-neutral-900">{maxDepth} levels</span>
              </div>
              <input
                type="range"
                min="3"
                max="10"
                step="1"
                value={maxDepth}
                onChange={(e) => setMaxDepth(parseInt(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <p className="text-[10px] text-neutral-400 mt-0.5">
                Balances bias-variance tradeoff. Values 4–6 prevent overfitting on small tabular sets.
              </p>
            </div>

            {/* Min Samples Leaf */}
            <div>
              <div className="flex justify-between text-neutral-700 mb-1">
                <span>Minimum Samples per Leaf (`min_samples_leaf`):</span>
                <span className="font-mono font-semibold text-neutral-900">{minSamplesLeaf} samples</span>
              </div>
              <input
                type="range"
                min="1"
                max="6"
                step="1"
                value={minSamplesLeaf}
                onChange={(e) => setMinSamplesLeaf(parseInt(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            {/* Random Forest Estimators */}
            <div>
              <div className="flex justify-between text-neutral-700 mb-1">
                <span>Forest Estimators (`n_estimators`):</span>
                <span className="font-mono font-semibold text-neutral-900">{nEstimators} trees</span>
              </div>
              <input
                type="range"
                min="5"
                max="40"
                step="5"
                value={nEstimators}
                onChange={(e) => setNEstimators(parseInt(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            {/* Ridge Regularization */}
            <div>
              <div className="flex justify-between text-neutral-700 mb-1">
                <span>Linear Regression Ridge (`alpha / lambda`):</span>
                <span className="font-mono font-semibold text-neutral-900">{regularization}</span>
              </div>
              <input
                type="range"
                min="0.01"
                max="0.2"
                step="0.01"
                value={regularization}
                onChange={(e) => setRegularization(parseFloat(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Model Cards with Selection */}
      {trainedModels && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-900">
              Trained Model Status & Deployment Selection
            </h3>
            <span className="text-xs text-neutral-500">
              Select which model powers the active Storefront and Price Predictor
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {(['Linear Regression', 'Decision Tree', 'Random Forest'] as AlgorithmType[]).map((algo) => {
              const res = trainedModels[algo];
              const isSelected = activeModel === algo;

              return (
                <div
                  key={algo}
                  className={`relative flex flex-col justify-between rounded-xl border p-5 transition-all ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/20 shadow-xs ring-1 ring-emerald-600'
                      : 'border-neutral-200/90 bg-white hover:border-neutral-300'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-emerald-700 px-2 py-0.5 text-[10px] font-semibold text-white">
                      <Sparkles className="h-3 w-3" />
                      <span>Active Production</span>
                    </div>
                  )}

                  <div>
                    <h4 className="text-base font-semibold text-neutral-900">{algo}</h4>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      {algo === 'Linear Regression'
                        ? 'Parametric baseline with Ridge L2 regularization'
                        : algo === 'Decision Tree'
                        ? 'Non-linear CART regression with variance reduction'
                        : 'Bagged ensemble with random feature subspace sampling'}
                    </p>

                    <div className="mt-4 space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-neutral-100">
                        <span className="text-neutral-500">Mean Absolute Error (MAE):</span>
                        <span className="font-mono font-medium text-neutral-900">
                          {formatCurrency(res.metrics.mae)}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-neutral-100">
                        <span className="text-neutral-500">Root Mean Sq Error (RMSE):</span>
                        <span className="font-mono font-medium text-neutral-900">
                          {formatCurrency(res.metrics.rmse)}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-neutral-100">
                        <span className="text-neutral-500">R² Coefficient:</span>
                        <span className="font-mono font-bold text-emerald-800">
                          {(res.metrics.r2 * 100).toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-neutral-500">Training Latency:</span>
                        <span className="font-mono text-neutral-600">
                          {res.metrics.trainingTimeMs} ms
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-neutral-100">
                    <button
                      onClick={() => setActiveModel(algo)}
                      disabled={isSelected}
                      className={`w-full rounded-lg py-2 text-xs font-semibold transition-colors ${
                        isSelected
                          ? 'bg-neutral-100 text-neutral-400 cursor-default'
                          : 'bg-neutral-900 text-white hover:bg-neutral-800'
                      }`}
                    >
                      {isSelected ? 'Currently Selected' : `Deploy ${algo}`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
