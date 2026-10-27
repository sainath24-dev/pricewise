/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { EngineeredRecord } from '../../types';

interface CorrelationHeatmapProps {
  data: EngineeredRecord[];
}

const HEATMAP_FEATURES: { key: keyof EngineeredRecord; label: string }[] = [
  { key: 'target_price', label: 'Target Price' },
  { key: 'current_price', label: 'Current Price' },
  { key: 'competitor_price', label: 'Competitor' },
  { key: 'historical_price', label: 'Hist Price' },
  { key: 'demand', label: 'Demand' },
  { key: 'stock_available', label: 'Stock' },
  { key: 'demand_to_stock_ratio', label: 'Dem/Stock' },
];

function calculatePearson(x: number[], y: number[]): number {
  const n = x.length;
  if (n === 0) return 0;
  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;

  let num = 0;
  let denX = 0;
  let denY = 0;

  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }

  const den = Math.sqrt(denX * denY);
  return den === 0 ? 0 : Number((num / den).toFixed(2));
}

export const CorrelationHeatmap: React.FC<CorrelationHeatmapProps> = ({ data }) => {
  const matrix = useMemo(() => {
    const valuesByKey: Record<string, number[]> = {};
    HEATMAP_FEATURES.forEach((f) => {
      valuesByKey[f.key] = data.map((d) => Number(d[f.key]) || 0);
    });

    return HEATMAP_FEATURES.map((rowF) =>
      HEATMAP_FEATURES.map((colF) => {
        if (rowF.key === colF.key) return 1.0;
        return calculatePearson(valuesByKey[rowF.key], valuesByKey[colF.key]);
      })
    );
  }, [data]);

  const getColor = (val: number) => {
    if (val === 1) return 'bg-emerald-700 text-white font-semibold';
    if (val > 0.6) return 'bg-emerald-600/90 text-white';
    if (val > 0.3) return 'bg-emerald-100 text-emerald-900';
    if (val > 0) return 'bg-emerald-50 text-emerald-800';
    if (val === 0) return 'bg-neutral-50 text-neutral-600';
    if (val > -0.3) return 'bg-rose-50 text-rose-800';
    if (val > -0.6) return 'bg-rose-100 text-rose-900';
    return 'bg-rose-600 text-white';
  };

  return (
    <div className="rounded-xl border border-neutral-200/80 bg-white p-5 shadow-xs">
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-neutral-900">
          Feature Correlation Matrix (Pearson r)
        </h4>
        <p className="text-xs text-neutral-500">
          Quantifies linear relationships between key pricing features and target selling price
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-fixed border-collapse text-center text-xs">
          <thead>
            <tr>
              <th className="w-24 p-2 text-left font-medium text-neutral-500">Feature</th>
              {HEATMAP_FEATURES.map((f, i) => (
                <th key={i} className="p-2 font-medium text-neutral-700">
                  {f.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HEATMAP_FEATURES.map((rowF, rIdx) => (
              <tr key={rIdx}>
                <td className="p-2 text-left font-medium text-neutral-700 whitespace-nowrap">
                  {rowF.label}
                </td>
                {matrix[rIdx].map((val, cIdx) => (
                  <td key={cIdx} className="p-1">
                    <div
                      className={`h-9 w-full flex items-center justify-center rounded font-mono text-[11px] transition-colors ${getColor(
                        val
                      )}`}
                    >
                      {val > 0 && val !== 1 ? `+${val}` : val}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-[11px] text-neutral-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded bg-rose-600"></span> Negative Correlation (-1.0)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded bg-neutral-200"></span> Uncorrelated (0.0)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded bg-emerald-700"></span> Strong Positive (+1.0)
        </span>
      </div>
    </div>
  );
};
