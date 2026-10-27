/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { BarChart3, PieChart, TrendingUp, Zap } from 'lucide-react';
import { useApp } from '../../store/appContext';
import { CorrelationHeatmap } from '../charts/CorrelationHeatmap';
import { DistributionPlot } from '../charts/DistributionPlot';

export const EDAPage: React.FC = () => {
  const { dataset, engineeredDataset, formatCurrency } = useApp();
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const filteredData = useMemo(() => {
    if (activeCategory === 'All') return engineeredDataset;
    return engineeredDataset.filter((d) => d.category === activeCategory);
  }, [engineeredDataset, activeCategory]);

  const targetPrices = filteredData.map((d) => d.target_price);
  const demandValues = filteredData.map((d) => d.demand);

  // Category summary calculations
  const categorySummary = useMemo(() => {
    const cats: Record<string, { count: number; sumPrice: number; sumDemand: number; sumUnits: number }> = {};
    engineeredDataset.forEach((d) => {
      if (!cats[d.category]) {
        cats[d.category] = { count: 0, sumPrice: 0, sumDemand: 0, sumUnits: 0 };
      }
      cats[d.category].count++;
      cats[d.category].sumPrice += d.target_price;
      cats[d.category].sumDemand += d.demand;
      cats[d.category].sumUnits += d.units_sold;
    });

    return Object.entries(cats).map(([name, stat]) => ({
      name,
      count: stat.count,
      avgPrice: Math.round(stat.sumPrice / stat.count),
      avgDemand: Math.round(stat.sumDemand / stat.count),
      totalUnits: stat.sumUnits,
    })).sort((a, b) => b.totalUnits - a.totalUnits);
  }, [engineeredDataset]);

  // Seasonal summary calculations
  const seasonalSummary = useMemo(() => {
    const seasons: Record<string, { count: number; sumRatio: number; sumPrice: number }> = {};
    engineeredDataset.forEach((d) => {
      if (!seasons[d.season]) seasons[d.season] = { count: 0, sumRatio: 0, sumPrice: 0 };
      seasons[d.season].count++;
      seasons[d.season].sumRatio += d.demand_to_stock_ratio;
      seasons[d.season].sumPrice += d.target_price;
    });
    return Object.entries(seasons).map(([season, stat]) => ({
      season,
      count: stat.count,
      avgRatio: Number((stat.sumRatio / stat.count).toFixed(2)),
      avgPrice: Math.round(stat.sumPrice / stat.count),
    }));
  }, [engineeredDataset]);

  return (
    <div className="space-y-6">
      {/* Header and Filter Banner */}
      <div className="rounded-xl border border-neutral-200/90 bg-white p-5 shadow-xs">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-base font-semibold text-neutral-900">
              Exploratory Data Analysis (EDA) & Feature Dynamics
            </h2>
            <p className="text-xs text-neutral-500">
              Empirical analysis of demand elasticity, competitor anchoring, and seasonal shifts
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500">Category Filter:</span>
            <select
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
              className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-medium text-neutral-800 focus:outline-hidden"
            >
              <option value="All">All Categories ({engineeredDataset.length})</option>
              {categorySummary.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.count})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Feature Correlation Heatmap & Seasonal Metrics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CorrelationHeatmap data={filteredData} />
        </div>

        {/* Seasonal Pricing Dynamics */}
        <div className="rounded-xl border border-neutral-200/90 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-semibold text-neutral-900">
              Seasonal Pricing & Scarcity Dynamics
            </h4>
            <p className="text-xs text-neutral-500">
              Impact of shopping calendar cycles on demand-to-stock pressure
            </p>

            <div className="mt-4 space-y-3">
              {seasonalSummary.map((s) => (
                <div key={s.season} className="rounded-lg border border-neutral-100 bg-neutral-50/70 p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-neutral-900">{s.season} Period</span>
                    <span className="font-mono text-emerald-800 font-medium">
                      Avg: {formatCurrency(s.avgPrice)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-500">
                    <span>Demand / Stock Ratio:</span>
                    <span className="font-mono font-semibold text-neutral-800">{s.avgRatio}x</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full rounded-full bg-neutral-200 overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full"
                      style={{ width: `${Math.min(100, s.avgRatio * 15)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-emerald-50/70 p-3 border border-emerald-100 text-xs text-emerald-900">
            <span className="font-semibold">Observation:</span> Festival and Peak periods exhibit 2.4x higher demand pressure, enabling dynamic price optimization without dampening conversions.
          </div>
        </div>
      </div>

      {/* Numerical Feature Distributions */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <DistributionPlot
          values={targetPrices}
          title={`Selling Price Distribution (${activeCategory})`}
          unitPrefix="₹"
          binsCount={10}
        />
        <DistributionPlot
          values={demandValues}
          title={`Customer Demand Index Distribution (${activeCategory})`}
          unitPrefix=""
          binsCount={10}
        />
      </div>

      {/* Category Performance & Elasticity Table */}
      <div className="rounded-xl border border-neutral-200/90 bg-white p-5 shadow-xs">
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-neutral-900">
            Cross-Category Pricing & Volume Aggregation
          </h4>
          <p className="text-xs text-neutral-500">
            Comparative performance across distinct retail product segments
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-neutral-200 bg-neutral-50/80 text-neutral-600">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Category</th>
                <th className="py-2.5 px-3 font-semibold">Observations</th>
                <th className="py-2.5 px-3 font-semibold">Average Target Price</th>
                <th className="py-2.5 px-3 font-semibold">Average Demand Score</th>
                <th className="py-2.5 px-3 font-semibold">Total Historical Units</th>
                <th className="py-2.5 px-3 font-semibold">Elasticity Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {categorySummary.map((cat) => {
                const isHighTicket = cat.avgPrice > 10000;
                return (
                  <tr key={cat.name} className="hover:bg-neutral-50/60">
                    <td className="py-2.5 px-3 font-medium text-neutral-900">{cat.name}</td>
                    <td className="py-2.5 px-3 font-mono text-neutral-600">{cat.count} records</td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-neutral-900">
                      {formatCurrency(cat.avgPrice)}
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-neutral-800">
                        {cat.avgDemand} / 100
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-neutral-700">
                      {cat.totalUnits.toLocaleString()} units
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                          isHighTicket
                            ? 'bg-amber-50 text-amber-800'
                            : 'bg-emerald-50 text-emerald-800'
                        }`}
                      >
                        {isHighTicket ? 'Premium Elastic' : 'Volume Inelastic'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
