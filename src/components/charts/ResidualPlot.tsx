/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { calculateResidualDistribution } from '../../ml/evaluation';
import { TestPrediction } from '../../types';

interface ResidualPlotProps {
  predictions: TestPrediction[];
  formatCurrency: (val: number) => string;
}

export const ResidualPlot: React.FC<ResidualPlotProps> = ({
  predictions,
  formatCurrency,
}) => {
  const residuals = predictions.map((p) => p.residual);
  const bins = calculateResidualDistribution(residuals, 12);
  const maxCount = Math.max(...bins.map((b) => b.count), 1);

  return (
    <div className="rounded-xl border border-neutral-200/80 bg-white p-5 shadow-xs">
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-neutral-900">
          Residual Error Distribution (Actual - Predicted)
        </h4>
        <p className="text-xs text-neutral-500">
          A bell-shaped distribution centered near zero validates Gaussian error assumptions
        </p>
      </div>

      <div className="grid h-48 grid-cols-12 items-end gap-1.5 border-b border-neutral-200 pb-2">
        {bins.map((bin, i) => {
          const heightPercent = Math.max(4, (bin.count / maxCount) * 100);
          const isCenter = bin.binStart <= 0 && bin.binEnd >= 0;

          return (
            <div key={i} className="group relative flex h-full flex-col justify-end items-center">
              {/* Tooltip on hover */}
              <div className="pointer-events-none absolute -top-12 z-10 hidden whitespace-nowrap rounded bg-neutral-900 px-2 py-1 text-[10px] text-white group-hover:block">
                <span>{bin.count} items ({bin.label})</span>
              </div>

              <div
                style={{ height: `${heightPercent}%` }}
                className={`w-full rounded-t transition-all ${
                  isCenter
                    ? 'bg-emerald-600 group-hover:bg-emerald-700'
                    : 'bg-slate-400/80 group-hover:bg-slate-500'
                }`}
              />
              <span className="mt-1 text-[9px] font-mono text-neutral-400 truncate max-w-full">
                {Math.round((bin.binStart + bin.binEnd) / 2)}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-neutral-500">
        <span>Underprediction (Negative Residual)</span>
        <span className="font-mono text-emerald-700 font-semibold">Zero Error Center</span>
        <span>Overprediction (Positive Residual)</span>
      </div>
    </div>
  );
};
