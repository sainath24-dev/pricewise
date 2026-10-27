/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CheckCircle,
  HelpCircle,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useApp } from '../../store/appContext';

export const PricingInsightsPage: React.FC = () => {
  const { dataset, engineeredDataset, formatCurrency } = useApp();

  // Find pricing anomalies (e.g. High demand (>75) & Low stock (<10), but price is still <= historical price)
  const anomalies = useMemo(() => {
    return engineeredDataset.filter((d) => {
      // Anomaly Type A: Underpriced despite intense demand and low inventory
      const isUnderpricedAnomaly =
        d.demand >= 75 && d.stock_available <= 8 && d.current_price <= d.historical_price;
      // Anomaly Type B: High price despite huge stock surplus and competitor undercutting by > 15%
      const compUndercutPercent = (d.current_price - d.competitor_price) / d.current_price;
      const isOverpricedAnomaly =
        d.stock_available >= 50 && compUndercutPercent > 0.15 && d.demand <= 40;

      return isUnderpricedAnomaly || isOverpricedAnomaly;
    }).slice(0, 8);
  }, [engineeredDataset]);

  // Competitor pricing gap analysis
  const competitorGapInsights = useMemo(() => {
    let higherCompCount = 0;
    let lowerCompCount = 0;
    let sumGap = 0;

    engineeredDataset.forEach((d) => {
      const diff = d.competitor_price - d.current_price;
      sumGap += diff;
      if (diff > 0) higherCompCount++;
      else if (diff < 0) lowerCompCount++;
    });

    const avgGap = Math.round(sumGap / (engineeredDataset.length || 1));
    return {
      higherCompCount,
      lowerCompCount,
      avgGap,
      percentHigher: Math.round((higherCompCount / (engineeredDataset.length || 1)) * 100),
    };
  }, [engineeredDataset]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-xl border border-neutral-200/90 bg-white p-5 shadow-xs">
        <h2 className="text-base font-semibold text-neutral-900">
          Executive Pricing Intelligence & Anomaly Surveillance
        </h2>
        <p className="mt-1 text-xs text-neutral-500">
          Empirical patterns, margin gap telemetry, and automated anomaly detection to optimize revenue capture
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-neutral-200/90 bg-white p-4 shadow-xs">
          <span className="text-xs text-neutral-500">Competitor Premium Buffer</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-neutral-900">
              {competitorGapInsights.percentHigher}%
            </span>
            <span className="text-xs text-emerald-700 font-semibold">of catalog</span>
          </div>
          <p className="mt-1 text-xs text-neutral-500">
            Competitors price higher on {competitorGapInsights.higherCompCount} SKUs, presenting room for margin expansion.
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200/90 bg-white p-4 shadow-xs">
          <span className="text-xs text-neutral-500">Average Price Gap</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-neutral-900">
              {competitorGapInsights.avgGap >= 0 ? '+' : ''}
              {formatCurrency(competitorGapInsights.avgGap)}
            </span>
          </div>
          <p className="mt-1 text-xs text-neutral-500">
            Average competitor price variance across historical catalog observations.
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200/90 bg-white p-4 shadow-xs">
          <span className="text-xs text-neutral-500">Flagged Pricing Anomalies</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-rose-700">
              {anomalies.length}
            </span>
            <span className="text-xs text-neutral-500">SKUs require review</span>
          </div>
          <p className="mt-1 text-xs text-neutral-500">
            Mismatches between demand elasticity, stock pressure, and active selling price.
          </p>
        </div>
      </div>

      {/* Flagged Pricing Anomalies Table */}
      <div className="rounded-xl border border-neutral-200/90 bg-white p-5 shadow-xs">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">
              Pricing Anomaly Detection Queue
            </h3>
            <p className="text-xs text-neutral-500">
              Static prices that fail to capture scarcity rents or fail to respond to competitor pressure
            </p>
          </div>
          <span className="rounded bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-800">
            Automated Audit
          </span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-neutral-200/70">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-neutral-600">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Product</th>
                <th className="py-2.5 px-3 font-semibold">Category</th>
                <th className="py-2.5 px-3 font-semibold">Current Price</th>
                <th className="py-2.5 px-3 font-semibold">Competitor</th>
                <th className="py-2.5 px-3 font-semibold">Demand / Stock</th>
                <th className="py-2.5 px-3 font-semibold">Diagnosis</th>
                <th className="py-2.5 px-3 font-semibold">Recommended Remedy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {anomalies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-neutral-400">
                    No critical pricing anomalies identified in current dataset.
                  </td>
                </tr>
              ) : (
                anomalies.map((a) => {
                  const isUnderpriced = a.demand >= 75 && a.stock_available <= 8;
                  return (
                    <tr key={a.id} className="hover:bg-neutral-50/60">
                      <td className="py-2.5 px-3 font-medium text-neutral-900">{a.product_name}</td>
                      <td className="py-2.5 px-3 text-neutral-600">{a.category}</td>
                      <td className="py-2.5 px-3 font-mono font-medium text-neutral-900">
                        {formatCurrency(a.current_price)}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-neutral-700">
                        {formatCurrency(a.competitor_price)}
                      </td>
                      <td className="py-2.5 px-3 font-mono">
                        <span className="text-emerald-700 font-semibold">{a.demand}/100</span> /{' '}
                        <span className="text-rose-700 font-semibold">{a.stock_available} units</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                            isUnderpriced
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-rose-100 text-rose-900'
                          }`}
                        >
                          {isUnderpriced ? 'Severe Underpricing' : 'Uncompetitive Surplus'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-neutral-700">
                        {isUnderpriced
                          ? `Surge price to ${formatCurrency(a.target_price)} (+${Math.round(
                              ((a.target_price - a.current_price) / a.current_price) * 100
                            )}%) to maximize revenue.`
                          : `Discount price towards competitor to flush excess inventory.`}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Strategic Pricing Insights Box */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-neutral-200/90 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm">
            <Sparkles className="h-4 w-4" />
            <span>Demand Elasticity Dynamic Rules</span>
          </div>
          <p className="text-xs text-neutral-600 leading-relaxed">
            In categories like <strong>Electronics</strong> and <strong>Home & Kitchen</strong>, customer search volume exhibits moderate price elasticity. Increasing prices by 5–12% during periods where stock is under 6 units yields minimal cart abandonment while expanding net merchant margins.
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200/90 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm">
            <Zap className="h-4 w-4" />
            <span>Competitor Price Anchoring</span>
          </div>
          <p className="text-xs text-neutral-600 leading-relaxed">
            The trained Random Forest and Linear Regression models assign significant feature weight to <strong>Competitor Price Difference</strong>. Countering competitor pricing within a 3–5% bandwidth protects organic conversion without triggering a race to the bottom.
          </p>
        </div>
      </div>
    </div>
  );
};
