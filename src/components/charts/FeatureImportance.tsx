/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FeatureImportance as FeatureImpType } from '../../types';

interface FeatureImportanceProps {
  importances: FeatureImpType[];
  modelName: string;
}

const HUMAN_FEATURE_LABELS: Record<string, string> = {
  current_price: 'Current Price',
  historical_price: 'Historical Base Price',
  demand: 'Daily Demand Volume',
  stock_available: 'Available Inventory Stock',
  competitor_price: 'Competitor Price',
  units_sold: 'Historical Units Sold',
  demand_to_stock_ratio: 'Demand-to-Stock Ratio',
  competitor_price_diff: 'Competitor Price Difference',
  competitor_price_ratio: 'Competitor Price Ratio',
  historical_price_change: 'Historical Price Delta',
  season_intensity: 'Seasonal Index Multiplier',
  promo_boost: 'Active Promotional Flag',
};

export const FeatureImportanceChart: React.FC<FeatureImportanceProps> = ({
  importances,
  modelName,
}) => {
  const topFeatures = importances.slice(0, 8);
  const maxImportance = Math.max(...topFeatures.map((f) => f.importance), 0.001);

  return (
    <div className="kraken-card p-5">
      <div className="mb-4">
        <h4 className="text-sm font-bold text-[#101114]">
          Feature Influence Weights ({modelName})
        </h4>
        <p className="text-xs text-[#686b82]">
          Relative mathematical contribution of each signal in determining selling price
        </p>
      </div>

      <div className="space-y-3">
        {topFeatures.map((item, idx) => {
          const label =
            HUMAN_FEATURE_LABELS[item.feature] ||
            item.feature.replace(/^cat_/, 'Category: ').replace(/_/g, ' ');
          const percent = (item.importance * 100).toFixed(1);
          const widthPercent = (item.importance / maxImportance) * 100;

          return (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#101114]">{label}</span>
                <div className="flex items-center gap-2 font-mono">
                  {item.coefficient !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-[6px] font-semibold ${
                        item.coefficient >= 0
                          ? 'bg-[rgba(20,158,97,0.16)] text-[#026b3f]'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      coef: {item.coefficient > 0 ? '+' : ''}
                      {item.coefficient}
                    </span>
                  )}
                  <span className="font-bold text-[#101114]">{percent}%</span>
                </div>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-[4px] bg-[#dedee5]/50">
                <div
                  className="h-full rounded-[4px] bg-[#7132f5] transition-all duration-500"
                  style={{ width: `${widthPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
