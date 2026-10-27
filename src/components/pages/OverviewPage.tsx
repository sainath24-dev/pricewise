/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../../store/appContext';
import { CleanPageId } from '../layout/Sidebar';

interface OverviewPageProps {
  setActivePage: (page: CleanPageId) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ setActivePage }) => {
  const { trainedModels, activeModel, formatCurrency } = useApp();

  return (
    <div className="space-y-6 max-w-5xl pb-12">
      {/* Introduction Card with Official Logo */}
      <div className="kraken-card p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="flex items-center gap-2">
              <span className="badge-neutral inline-block text-[11px] font-bold">
                Dynamic Pricing Architecture
              </span>
              <span className="badge-success inline-block text-[11px] font-bold">
                ML Pipeline Active
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-[-1px] text-[#101114]">
              How Dynamic Pricing Operates
            </h2>
            <p className="text-sm text-[#686b82] leading-relaxed">
              This platform determines optimal selling prices by balancing customer demand, warehouse inventory, and competitor market benchmarks using supervised machine learning algorithms.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 text-xs">
              <div className="rounded-[12px] border border-[#dedee5] bg-white p-4">
                <span className="font-bold text-[#101114] text-sm block mb-1">
                  Risk of Overpricing
                </span>
                <p className="text-[#686b82] leading-relaxed">
                  Setting prices higher than prevailing market benchmarks leads to cart abandonment and immediate customer loss to rival platforms.
                </p>
              </div>
              <div className="rounded-[12px] border border-[#dedee5] bg-white p-4">
                <span className="font-bold text-[#101114] text-sm block mb-1">
                  Risk of Underpricing
                </span>
                <p className="text-[#686b82] leading-relaxed">
                  Selling scarce inventory at fixed low rates during peak demand forfeits critical profit margin that could be captured safely.
                </p>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex justify-center md:justify-end">
            <div className="rounded-2xl border border-[#2b2d35] bg-[#18191c] p-4 shadow-md flex flex-col items-center justify-center w-44 text-center">
              <img
                src="/logo.png"
                alt="PriceWise Official Logo"
                className="w-36 h-auto object-contain"
              />
              <span className="mt-2 text-[10px] font-mono font-medium text-[#86efac] tracking-wide uppercase">
                Official ML System
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center gap-3 pt-6 border-t border-[#dedee5]">
          <button
            onClick={() => setActivePage('calculator')}
            className="btn-primary text-xs font-semibold py-2.5 px-5 cursor-pointer"
          >
            Open Price Calculator
          </button>
          <button
            onClick={() => setActivePage('storefront')}
            className="btn-outlined text-xs font-semibold py-2.5 px-5 cursor-pointer"
          >
            Browse Live Storefront
          </button>
        </div>
      </div>

      {/* 3 Core Stages */}
      <div className="kraken-card p-6 md:p-8">
        <h3 className="text-xl font-bold tracking-[-0.5px] text-[#101114] mb-1">
          System Workflow
        </h3>
        <p className="text-xs text-[#686b82] mb-6">
          How market data transforms into an optimal selling price recommendation.
        </p>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Step 1 */}
          <div className="rounded-[12px] border border-[#dedee5] bg-white p-5 space-y-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[rgba(133,91,251,0.16)] font-mono text-sm font-bold text-[#7132f5]">
              1
            </div>
            <h4 className="text-sm font-bold text-[#101114]">Market Signals</h4>
            <p className="text-xs text-[#686b82] leading-relaxed">
              Continuous monitoring of key features:
            </p>
            <div className="text-xs text-[#101114] space-y-1 font-mono">
              <div className="p-1.5 rounded-[6px] bg-[#dedee5]/25">Demand Index (1-100)</div>
              <div className="p-1.5 rounded-[6px] bg-[#dedee5]/25">Warehouse Stock (units)</div>
              <div className="p-1.5 rounded-[6px] bg-[#dedee5]/25">Competitor Benchmark (₹)</div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="rounded-[12px] border border-[#dedee5] bg-white p-5 space-y-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[rgba(133,91,251,0.16)] font-mono text-sm font-bold text-[#7132f5]">
              2
            </div>
            <h4 className="text-sm font-bold text-[#101114]">ML Processing</h4>
            <p className="text-xs text-[#686b82] leading-relaxed">
              Evaluated across 3 supervised algorithms:
            </p>
            <div className="text-xs text-[#101114] space-y-1 font-mono">
              <div className="p-1.5 rounded-[6px] bg-[#dedee5]/25">Linear Regression</div>
              <div className="p-1.5 rounded-[6px] bg-[#dedee5]/25">Decision Tree Regressor</div>
              <div className="p-1.5 rounded-[6px] bg-[#dedee5]/25">Random Forest Regressor</div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="rounded-[12px] border border-[#dedee5] bg-white p-5 space-y-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[rgba(133,91,251,0.16)] font-mono text-sm font-bold text-[#7132f5]">
              3
            </div>
            <h4 className="text-sm font-bold text-[#101114]">Dynamic Price</h4>
            <p className="text-xs text-[#686b82] leading-relaxed">
              Price recommendation with safety bounds:
            </p>
            <div className="text-xs text-[#101114] space-y-1 font-mono">
              <div className="p-1.5 rounded-[6px] bg-[#dedee5]/25">Scarcity Premium (+5% to +10%)</div>
              <div className="p-1.5 rounded-[6px] bg-[#dedee5]/25">Competitor Match (-3% to -8%)</div>
              <div className="p-1.5 rounded-[6px] bg-[#dedee5]/25">Inventory Clearance (-15%)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Model Benchmark Card */}
      {trainedModels && (
        <div className="kraken-card p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
            <div>
              <h3 className="text-xl font-bold tracking-[-0.5px] text-[#101114]">
                Model Evaluation on Held-Out Test Data
              </h3>
              <p className="text-xs text-[#686b82] mt-0.5">
                80% train / 20% test split evaluated on MAE, RMSE, and R² score.
              </p>
            </div>
            <button
              onClick={() => setActivePage('models')}
              className="text-xs font-bold text-[#7132f5] hover:text-[#5741d8] cursor-pointer"
            >
              View Full Metrics Report →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(['Random Forest', 'Decision Tree', 'Linear Regression'] as const).map((algo) => {
              const res = trainedModels[algo];
              const isSelected = activeModel === algo;

              return (
                <div
                  key={algo}
                  className={`rounded-[12px] border p-4 transition-all ${
                    isSelected
                      ? 'border-[#7132f5] bg-[rgba(133,91,251,0.04)] shadow-[0_2px_12px_rgba(113,50,245,0.12)]'
                      : 'border-[#dedee5] bg-[#ffffff]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#101114]">{algo}</span>
                    {isSelected && (
                      <span className="badge-success text-[10px]">
                        Active
                      </span>
                    )}
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#686b82]">Mean Absolute Error (MAE):</span>
                      <span className="font-mono font-bold text-[#101114]">
                        {formatCurrency(res.metrics.mae)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#686b82]">Accuracy (R² Score):</span>
                      <span className="font-mono font-bold text-[#026b3f]">
                        {(res.metrics.r2 * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#686b82]">RMSE:</span>
                      <span className="font-mono text-[#686b82]">
                        {formatCurrency(res.metrics.rmse)}
                      </span>
                    </div>
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
