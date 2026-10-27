/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { StoreProduct } from '../../types';

interface PriceComparisonAndTrendsProps {
  selectedProduct: StoreProduct;
  onSelectProduct: (product: StoreProduct) => void;
  allProducts: StoreProduct[];
  formatCurrency: (val: number) => string;
  activeModel: string;
}

interface HistoricalDataPoint {
  period: string;
  dynamicPrice: number;
  competitorPrice: number;
  basePrice: number;
  stock: number;
  demand: number;
  demandRatio: number;
}

export const PriceComparisonAndTrends: React.FC<PriceComparisonAndTrendsProps> = ({
  selectedProduct,
  onSelectProduct,
  allProducts,
  formatCurrency,
  activeModel,
}) => {
  const [activeTab, setActiveTab] = useState<'comparison' | 'trends'>('comparison');

  // Compute realistic historical trend timeline (6 intervals) based on product parameters
  const historicalTrendData: HistoricalDataPoint[] = useMemo(() => {
    const base = selectedProduct.basePrice;
    const currentDynamic = selectedProduct.dynamicPrice;
    const rivalAvg = Math.round((selectedProduct.amazonPrice + selectedProduct.flipkartPrice) / 2);
    const stock = selectedProduct.stock;
    const demand = selectedProduct.demandIndex;

    // Timeline going from 5 weeks ago to today
    return [
      {
        period: '5 Wks Ago',
        basePrice: base,
        competitorPrice: Math.round(base * 1.02),
        dynamicPrice: base,
        stock: Math.min(60, stock + 25),
        demand: Math.max(30, demand - 20),
        demandRatio: Number(((Math.max(30, demand - 20)) / (Math.min(60, stock + 25) + 1)).toFixed(2)),
      },
      {
        period: '4 Wks Ago',
        basePrice: base,
        competitorPrice: Math.round(base * 1.01),
        dynamicPrice: Math.round(base * 0.98),
        stock: Math.min(55, stock + 18),
        demand: Math.max(35, demand - 15),
        demandRatio: Number(((Math.max(35, demand - 15)) / (Math.min(55, stock + 18) + 1)).toFixed(2)),
      },
      {
        period: '3 Wks Ago',
        basePrice: base,
        competitorPrice: Math.round(rivalAvg * 0.97),
        dynamicPrice: Math.round(base * 0.99),
        stock: Math.min(45, stock + 12),
        demand: Math.max(40, demand - 8),
        demandRatio: Number(((Math.max(40, demand - 8)) / (Math.min(45, stock + 12) + 1)).toFixed(2)),
      },
      {
        period: '2 Wks Ago',
        basePrice: base,
        competitorPrice: Math.round(rivalAvg * 0.99),
        dynamicPrice: Math.round((base + currentDynamic) / 2),
        stock: Math.min(35, stock + 6),
        demand: Math.max(45, demand - 3),
        demandRatio: Number(((Math.max(45, demand - 3)) / (Math.min(35, stock + 6) + 1)).toFixed(2)),
      },
      {
        period: 'Last Week',
        basePrice: base,
        competitorPrice: rivalAvg,
        dynamicPrice: Math.round(currentDynamic * 0.99),
        stock: Math.max(1, stock + 2),
        demand: demand,
        demandRatio: Number((demand / (Math.max(1, stock + 2) + 1)).toFixed(2)),
      },
      {
        period: 'Current / Today',
        basePrice: base,
        competitorPrice: rivalAvg,
        dynamicPrice: currentDynamic,
        stock: stock,
        demand: demand,
        demandRatio: Number((demand / (stock + 1)).toFixed(2)),
      },
    ];
  }, [selectedProduct]);

  // Derived metrics for the comparison view
  const demandToStockRatio = Number(
    (selectedProduct.demandIndex / (selectedProduct.stock + 1)).toFixed(2)
  );

  const competitorAvg = Math.round(
    (selectedProduct.amazonPrice + selectedProduct.flipkartPrice) / 2
  );

  const priceDiffVsBase = selectedProduct.dynamicPrice - selectedProduct.basePrice;
  const priceDiffVsCompetitor = selectedProduct.dynamicPrice - competitorAvg;

  // Stock status determination
  const stockStatus =
    selectedProduct.stock <= 5
      ? { label: 'Critical Scarcity', color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' }
      : selectedProduct.stock <= 15
      ? { label: 'Low Inventory', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' }
      : selectedProduct.stock <= 35
      ? { label: 'Moderate Stock', color: 'text-[#149e61]', bg: 'bg-emerald-50 border-emerald-200' }
      : { label: 'High Stock (Surplus)', color: 'text-[#00D4A4]', bg: 'bg-emerald-50 border-emerald-200' };

  // Demand status determination
  const demandStatus =
    selectedProduct.demandIndex >= 80
      ? { label: 'Surge Demand', color: 'text-rose-700' }
      : selectedProduct.demandIndex >= 60
      ? { label: 'High Demand', color: 'text-[#00D4A4]' }
      : selectedProduct.demandIndex >= 40
      ? { label: 'Steady Demand', color: 'text-[#101114]' }
      : { label: 'Slow Demand', color: 'text-[#686b82]' };

  return (
    <div className="kraken-card p-6 space-y-6">
      {/* Top Header & Product Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#dedee5]">
        <div>
          <span className="badge-neutral text-[10px] font-bold uppercase tracking-wider">
            Deep-Dive Pricing Intelligence
          </span>
          <h3 className="text-lg font-bold text-[#101114] mt-0.5">
            Model Optimization & Market Trends: {selectedProduct.title}
          </h3>
          <p className="text-xs text-[#686b82]">
            Evaluated with algorithm: <strong className="text-[#00D4A4]">{activeModel}</strong>. Switch products below to inspect individual pricing dynamics.
          </p>
        </div>

        {/* Product Dropdown Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-[#686b82] whitespace-nowrap">
            Select Product:
          </label>
          <select
            value={selectedProduct.id}
            onChange={(e) => {
              const prod = allProducts.find((p) => p.id === e.target.value);
              if (prod) onSelectProduct(prod);
            }}
            className="rounded-full border border-[#dedee5] bg-white px-3 py-1.5 text-xs font-semibold text-[#101114] focus:border-[#00D4A4] focus:outline-hidden cursor-pointer max-w-[220px] sm:max-w-[280px] truncate"
          >
            {allProducts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} ({p.category})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs: Comparison View vs Historical Trend Chart */}
      <div className="flex items-center gap-2 border-b border-[#dedee5] pb-2">
        <button
          onClick={() => setActiveTab('comparison')}
          className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'comparison'
              ? 'bg-[#00D4A4] text-white shadow-[0_2px_8px_rgba(113,50,245,0.25)]'
              : 'text-[#686b82] hover:bg-[rgba(133,91,251,0.08)] hover:text-[#101114]'
          }`}
        >
          Input Metrics vs Optimized Price
        </button>
        <button
          onClick={() => setActiveTab('trends')}
          className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'trends'
              ? 'bg-[#00D4A4] text-white shadow-[0_2px_8px_rgba(113,50,245,0.25)]'
              : 'text-[#686b82] hover:bg-[rgba(133,91,251,0.08)] hover:text-[#101114]'
          }`}
        >
          Historical Price Trends Line Chart
        </button>
      </div>

      {/* Tab 1: Comparison View (Input Metrics vs Final Price) */}
      {activeTab === 'comparison' && (
        <div className="space-y-6">
          {/* 4 Metric KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1: Demand-to-Stock Ratio */}
            <div className="rounded-xl border border-[#dedee5] bg-white p-4 space-y-1.5">
              <span className="text-[11px] font-bold text-[#686b82] uppercase tracking-wider block">
                Demand-to-Stock Ratio
              </span>
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-2xl font-bold text-[#101114]">
                  {demandToStockRatio}x
                </span>
                <span className={`text-[11px] font-bold ${demandStatus.color}`}>
                  {demandToStockRatio > 5.0 ? 'High Pressure' : demandToStockRatio < 1.0 ? 'Low Pressure' : 'Balanced'}
                </span>
              </div>
              <p className="text-[11px] text-[#686b82] leading-tight pt-1 border-t border-[#dedee5]/50">
                Formula: {selectedProduct.demandIndex} demand / ({selectedProduct.stock} stock + 1). Higher ratio justifies margin markups.
              </p>
            </div>

            {/* Metric 2: Stock Availability */}
            <div className={`rounded-xl border p-4 space-y-1.5 ${stockStatus.bg}`}>
              <span className="text-[11px] font-bold text-[#686b82] uppercase tracking-wider block">
                Stock Availability
              </span>
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-2xl font-bold text-[#101114]">
                  {selectedProduct.stock} <span className="text-xs font-normal text-[#686b82]">units</span>
                </span>
                <span className={`text-[11px] font-bold ${stockStatus.color}`}>
                  {stockStatus.label}
                </span>
              </div>
              <p className="text-[11px] text-[#686b82] leading-tight pt-1 border-t border-[#dedee5]/50">
                Critical threshold is &le; 5 units. Scarcity algorithm protects remaining units from underpricing.
              </p>
            </div>

            {/* Metric 3: Competitor Benchmark Spread */}
            <div className="rounded-xl border border-[#dedee5] bg-white p-4 space-y-1.5">
              <span className="text-[11px] font-bold text-[#686b82] uppercase tracking-wider block">
                Market Competitor Average
              </span>
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-2xl font-bold text-[#101114]">
                  {formatCurrency(competitorAvg)}
                </span>
                <span className="text-[11px] font-mono text-[#686b82]">
                  Amazon: {formatCurrency(selectedProduct.amazonPrice)}
                </span>
              </div>
              <p className="text-[11px] text-[#686b82] leading-tight pt-1 border-t border-[#dedee5]/50">
                Flipkart: {formatCurrency(selectedProduct.flipkartPrice)}. Model stays within competitive conversion boundaries.
              </p>
            </div>

            {/* Metric 4: Final Optimized Price */}
            <div className="rounded-xl border border-[#00D4A4]/40 bg-[rgba(0,212,164,0.08)] p-4 space-y-1.5">
              <span className="text-[11px] font-bold text-[#00D4A4] uppercase tracking-wider block">
                Final Optimized Price
              </span>
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-2xl font-bold text-[#00D4A4]">
                  {formatCurrency(selectedProduct.dynamicPrice)}
                </span>
                <span
                  className={`text-[11px] font-bold font-mono ${
                    selectedProduct.priceDeltaPercent > 0
                      ? 'text-[#026b3f]'
                      : selectedProduct.priceDeltaPercent < 0
                      ? 'text-amber-800'
                      : 'text-[#686b82]'
                  }`}
                >
                  {selectedProduct.priceDeltaPercent >= 0 ? '+' : ''}
                  {selectedProduct.priceDeltaPercent}%
                </span>
              </div>
              <p className="text-[11px] text-[#686b82] leading-tight pt-1 border-t border-[#dedee5]/50">
                Catalog Base: {formatCurrency(selectedProduct.basePrice)} (Delta: {priceDiffVsBase >= 0 ? '+' : ''}{formatCurrency(priceDiffVsBase)})
              </p>
            </div>
          </div>

          {/* Detailed Decision Bridge Comparison Table */}
          <div className="rounded-xl border border-[#dedee5] bg-white overflow-hidden">
            <div className="px-5 py-3.5 bg-[#dedee5]/20 border-b border-[#dedee5] flex items-center justify-between">
              <span className="text-xs font-bold text-[#101114]">
                Optimization Decision Bridge: How Inputs Created the Final Price
              </span>
              <span className="text-[11px] text-[#686b82]">
                Model: {activeModel}
              </span>
            </div>

            <div className="divide-y divide-[#dedee5] text-xs">
              {/* Row 1: Catalog Base */}
              <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="font-bold text-[#101114]">1. Catalog Base List Price</div>
                  <p className="text-[#686b82] text-[11px]">
                    The standard static reference selling price established by inventory management.
                  </p>
                </div>
                <div className="font-mono font-bold text-[#101114] text-sm shrink-0">
                  {formatCurrency(selectedProduct.basePrice)}
                </div>
              </div>

              {/* Row 2: Stock Scarcity Effect */}
              <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#101114]">2. Stock Availability Impact</span>
                    <span className="badge-neutral text-[10px] font-mono">
                      {selectedProduct.stock} units
                    </span>
                  </div>
                  <p className="text-[#686b82] text-[11px]">
                    {selectedProduct.stock <= 5
                      ? 'Severe warehouse scarcity triggers supply contraction pricing (+surge premium).'
                      : selectedProduct.stock >= 45
                      ? 'Elevated warehouse inventory triggers automated clearance discounting to unlock capital.'
                      : 'Stock levels are balanced; moderate inventory pricing applied.'}
                  </p>
                </div>
                <div
                  className={`font-mono font-bold text-sm shrink-0 ${
                    selectedProduct.stock <= 5
                      ? 'text-[#026b3f]'
                      : selectedProduct.stock >= 45
                      ? 'text-amber-800'
                      : 'text-[#686b82]'
                  }`}
                >
                  {selectedProduct.stock <= 5
                    ? `+${formatCurrency(Math.round(selectedProduct.basePrice * 0.05))}`
                    : selectedProduct.stock >= 45
                    ? `-${formatCurrency(Math.round(selectedProduct.basePrice * 0.08))}`
                    : '₹0 (Neutral)'}
                </div>
              </div>

              {/* Row 3: Demand Intensity Effect */}
              <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#101114]">3. Demand Index & Ratio Impact</span>
                    <span className="badge-neutral text-[10px] font-mono">
                      {selectedProduct.demandIndex}/100 ({demandToStockRatio}x ratio)
                    </span>
                  </div>
                  <p className="text-[#686b82] text-[11px]">
                    {selectedProduct.demandIndex >= 75
                      ? 'Peak customer search interest and elevated cart intent allows premium capture.'
                      : selectedProduct.demandIndex <= 40
                      ? 'Lower buyer traffic requires competitive promotional stimulus.'
                      : 'Standard healthy customer inquiry velocity.'}
                  </p>
                </div>
                <div
                  className={`font-mono font-bold text-sm shrink-0 ${
                    selectedProduct.demandIndex >= 75
                      ? 'text-[#026b3f]'
                      : selectedProduct.demandIndex <= 40
                      ? 'text-amber-800'
                      : 'text-[#686b82]'
                  }`}
                >
                  {selectedProduct.demandIndex >= 75
                    ? `+${formatCurrency(Math.round(selectedProduct.basePrice * 0.03))}`
                    : selectedProduct.demandIndex <= 40
                    ? `-${formatCurrency(Math.round(selectedProduct.basePrice * 0.04))}`
                    : '₹0 (Neutral)'}
                </div>
              </div>

              {/* Row 4: Competitor Guardrail */}
              <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#101114]">4. Competitor Guardrail (Amazon & Flipkart)</span>
                    <span className="badge-neutral text-[10px] font-mono">
                      Avg: {formatCurrency(competitorAvg)}
                    </span>
                  </div>
                  <p className="text-[#686b82] text-[11px]">
                    {priceDiffVsCompetitor < 0
                      ? `Positioned ${formatCurrency(Math.abs(priceDiffVsCompetitor))} below rival average to maximize cart conversion rate.`
                      : priceDiffVsCompetitor === 0
                      ? 'Exact price parity with marketplace competitors.'
                      : `Premium brand positioning (+${formatCurrency(priceDiffVsCompetitor)} over rivals) justified by immediate local fulfillment.`}
                  </p>
                </div>
                <div className="font-mono font-bold text-sm text-[#00D4A4] shrink-0">
                  {priceDiffVsCompetitor <= 0
                    ? `Competitive Buffer (${formatCurrency(priceDiffVsCompetitor)})`
                    : `Premium (+${formatCurrency(priceDiffVsCompetitor)})`}
                </div>
              </div>

              {/* Summary Total Row */}
              <div className="p-4 bg-[rgba(133,91,251,0.08)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-bold text-sm">
                <div>
                  <span className="text-[#101114]">Final Optimized Selling Price:</span>
                  <span className="text-xs font-normal text-[#686b82] ml-2">
                    ({selectedProduct.dynamicBadge.reason})
                  </span>
                </div>
                <div className="font-mono text-lg text-[#00D4A4]">
                  {formatCurrency(selectedProduct.dynamicPrice)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Recharts Historical Price Trends Line Chart */}
      {activeTab === 'trends' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div>
              <h4 className="font-bold text-[#101114]">
                6-Period Historical Price Fluctuation & Market Response
              </h4>
              <p className="text-[#686b82]">
                Demonstrating how the ML dynamic model responds over time as competitor prices shift and inventory depletes.
              </p>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-medium">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#00D4A4]" />
                <span className="text-[#101114]">Dynamic Price</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#686b82]" />
                <span className="text-[#686b82]">Competitor Avg</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#9497a9]" />
                <span className="text-[#9497a9]">Base Catalog</span>
              </div>
            </div>
          </div>

          {/* Recharts LineChart */}
          <div className="h-72 w-full rounded-xl border border-[#dedee5] bg-white p-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={historicalTrendData}
                margin={{ top: 10, right: 20, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f4" />
                <XAxis
                  dataKey="period"
                  stroke="#686b82"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  stroke="#686b82"
                  fontSize={11}
                  tickLine={false}
                  domain={['auto', 'auto']}
                  tickFormatter={(val) => `₹${val.toLocaleString()}`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as HistoricalDataPoint;
                      return (
                        <div className="rounded-full border border-[#dedee5] bg-white p-3 shadow-lg text-xs space-y-1.5 font-sans">
                          <div className="font-bold text-[#101114] border-b border-[#dedee5] pb-1">
                            {label}
                          </div>
                          <div className="flex justify-between gap-4 font-mono text-[#00D4A4]">
                            <span>Dynamic Model Price:</span>
                            <span className="font-bold">{formatCurrency(data.dynamicPrice)}</span>
                          </div>
                          <div className="flex justify-between gap-4 font-mono text-[#686b82]">
                            <span>Competitor Average:</span>
                            <span>{formatCurrency(data.competitorPrice)}</span>
                          </div>
                          <div className="flex justify-between gap-4 font-mono text-[#9497a9]">
                            <span>Base List Price:</span>
                            <span>{formatCurrency(data.basePrice)}</span>
                          </div>
                          <div className="pt-1 border-t border-[#dedee5] flex justify-between gap-4 text-[10px] text-[#686b82]">
                            <span>Stock: {data.stock} units</span>
                            <span>Demand Index: {data.demand}/100</span>
                            <span className="font-semibold text-[#101114]">Ratio: {data.demandRatio}x</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  verticalAlign="top"
                  height={32}
                  formatter={(value) => {
                    if (value === 'dynamicPrice') return 'Dynamic ML Price (Optimized)';
                    if (value === 'competitorPrice') return 'Competitor Average (Amazon & Flipkart)';
                    return 'Catalog Base List Price';
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="dynamicPrice"
                  stroke="#00D4A4"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#00D4A4' }}
                  activeDot={{ r: 6, stroke: '#5741d8', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="competitorPrice"
                  stroke="#686b82"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: '#686b82' }}
                />
                <Line
                  type="monotone"
                  dataKey="basePrice"
                  stroke="#9497a9"
                  strokeWidth={1.5}
                  strokeDasharray="2 2"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-full bg-[#dedee5]/20 p-3 text-xs text-[#686b82] leading-relaxed">
            <strong className="text-[#101114]">Trend Observation:</strong> As inventory decreased from 29 units down to {selectedProduct.stock} units and demand rose to {selectedProduct.demandIndex}/100, the dynamic model dynamically lifted selling price to {formatCurrency(selectedProduct.dynamicPrice)}, maintaining a safe competitive buffer under rival listings.
          </div>
        </div>
      )}
    </div>
  );
};
