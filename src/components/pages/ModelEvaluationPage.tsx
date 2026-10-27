/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  Cpu,
  Info,
  Play,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../../store/appContext';
import { AlgorithmType } from '../../types';
import { FeatureImportanceChart } from '../charts/FeatureImportance';
import { ScatterPlot } from '../charts/ScatterPlot';

export const ModelEvaluationPage: React.FC = () => {
  const {
    trainedModels,
    activeModel,
    setActiveModel,
    formatCurrency,
    trainAllModels,
    isTraining,
    engineeredDataset,
  } = useApp();

  const [selectedEvalModel, setSelectedEvalModel] = useState<AlgorithmType>(activeModel);
  const [splitRatio, setSplitRatio] = useState<number>(0.8);

  if (!trainedModels) {
    return (
      <div className="kraken-card p-12 text-center text-sm flex flex-col items-center justify-center">
        <Cpu className="h-8 w-8 text-[#00D4A4] mb-2 animate-spin" />
        <p className="font-semibold text-[#101114]">Training baseline models...</p>
      </div>
    );
  }

  const currentResult = trainedModels[selectedEvalModel];
  const algorithms: AlgorithmType[] = ['Random Forest', 'Decision Tree', 'Linear Regression'];

  // Best model by lowest MAE
  const ranked = [...algorithms].sort((a, b) => {
    return trainedModels[a].metrics.mae - trainedModels[b].metrics.mae;
  });
  const bestModel = ranked[0];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Header with Kraken Retrain Action */}
      <div className="kraken-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-[-0.5px] text-[#101114]">
              Supervised Machine Learning Models
            </h2>
            <p className="text-xs text-[#686b82] mt-0.5">
              Trained on {engineeredDataset.length} historical records (80% training set, 20% held-out test evaluation).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => trainAllModels(undefined, splitRatio)}
              disabled={isTraining}
              className="btn-primary flex items-center gap-2"
            >
              <Play className="h-3.5 w-3.5" />
              <span>{isTraining ? 'Training...' : 'Retrain All 3 Models'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Model Benchmark Table */}
      <div className="kraken-card p-6 space-y-4">
        <div>
          <h3 className="text-base font-bold text-[#101114]">
            Model Comparison on Held-Out Test Data
          </h3>
          <p className="text-xs text-[#686b82] mt-0.5">
            Lower MAE (error in rupees) indicates closer predictions. Higher R² score indicates superior fit.
          </p>
        </div>

        <div className="overflow-x-auto rounded-[12px] border border-[#dedee5]">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#dedee5] bg-[#ffffff] text-[#686b82] font-semibold">
              <tr>
                <th className="py-3 px-3">Algorithm</th>
                <th className="py-3 px-3">Average Error (MAE)</th>
                <th className="py-3 px-3">Root Mean Sq Error (RMSE)</th>
                <th className="py-3 px-3">R² Accuracy Score</th>
                <th className="py-3 px-3">Latency</th>
                <th className="py-3 px-3">Deployment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dedee5]">
              {ranked.map((algo, idx) => {
                const res = trainedModels[algo];
                const isWinner = idx === 0;
                const isSelected = selectedEvalModel === algo;
                const isCurrent = activeModel === algo;

                return (
                  <tr
                    key={algo}
                    onClick={() => setSelectedEvalModel(algo)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-[rgba(133,91,251,0.06)] font-medium' : 'hover:bg-neutral-50'
                    }`}
                  >
                    <td className="py-3.5 px-3 font-bold text-[#101114] flex items-center gap-2">
                      <span>{algo}</span>
                      {isWinner && (
                        <span className="badge-success">
                          Lowest Error
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-[#101114]">
                      {formatCurrency(res.metrics.mae)}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-[#686b82]">
                      {formatCurrency(res.metrics.rmse)}
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-[#026b3f]">
                      {(res.metrics.r2 * 100).toFixed(2)}%
                    </td>
                    <td className="py-3.5 px-3 font-mono text-[#9497a9]">
                      {res.metrics.trainingTimeMs} ms
                    </td>
                    <td className="py-3.5 px-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveModel(algo);
                        }}
                        disabled={isCurrent}
                        className={`rounded-[10px] px-3 py-1.5 text-xs font-semibold transition-colors ${
                          isCurrent
                            ? 'bg-[#00D4A4] text-white cursor-default'
                            : 'btn-outlined py-1 text-xs'
                        }`}
                      >
                        {isCurrent ? 'Active Model' : 'Select'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actual vs Predicted Scatter Plot & Feature Importance */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ScatterPlot
          predictions={currentResult.testPredictions}
          title={`Actual vs. Predicted Selling Price (${selectedEvalModel})`}
          formatCurrency={formatCurrency}
        />
        <FeatureImportanceChart
          importances={currentResult.featureImportances}
          modelName={selectedEvalModel}
        />
      </div>

      {/* Explanations for Students & Evaluators */}
      <div className="kraken-card p-6 space-y-3 text-xs text-[#686b82]">
        <h4 className="font-bold text-[#101114] text-sm">
          Understanding the 3 Algorithms Used:
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div className="rounded-[12px] bg-white p-4 border border-[#dedee5]">
            <span className="font-bold text-[#101114] text-sm">Linear Regression</span>
            <p className="mt-1 text-[#686b82] text-xs leading-relaxed">
              Finds a linear mathematical relationship between input features (demand, stock, competitor) and price using Ordinary Least Squares with Ridge regularization.
            </p>
          </div>
          <div className="rounded-[12px] bg-white p-4 border border-[#dedee5]">
            <span className="font-bold text-[#101114] text-sm">Decision Tree</span>
            <p className="mt-1 text-[#686b82] text-xs leading-relaxed">
              Splits data recursively like a flowchart (e.g. If stock &lt; 5 and demand &gt; 70 $\rightarrow$ price ₹16,000) based on variance reduction.
            </p>
          </div>
          <div className="rounded-[12px] bg-white p-4 border border-[#dedee5]">
            <span className="font-bold text-[#101114] text-sm">Random Forest</span>
            <p className="mt-1 text-[#686b82] text-xs leading-relaxed">
              Builds an ensemble of multiple independent decision trees on random subsets of data and averages their predictions to achieve the highest accuracy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
