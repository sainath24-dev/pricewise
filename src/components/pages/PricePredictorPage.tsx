/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Calculator,
  CheckCircle,
  HelpCircle,
  Info,
} from 'lucide-react';
import { useApp } from '../../store/appContext';
import { AlgorithmType, PredictionInput, PredictionResult } from '../../types';

export const PricePredictorPage: React.FC = () => {
  const {
    activeModel,
    predict,
    formatCurrency,
    dataReport,
  } = useApp();

  const [productName, setProductName] = useState('Wireless Noise-Cancelling Headphones');
  const [category, setCategory] = useState('Electronics');
  const [currentPrice, setCurrentPrice] = useState<number>(14999);
  const [competitorPrice, setCompetitorPrice] = useState<number>(15800);
  const [demand, setDemand] = useState<number>(85);
  const [stockAvailable, setStockAvailable] = useState<number>(4);
  const [season, setSeason] = useState<'Festival' | 'Peak' | 'Normal' | 'Clearance'>('Festival');
  const [selectedAlgo, setSelectedAlgo] = useState<AlgorithmType>(activeModel);

  const [result, setResult] = useState<PredictionResult | null>(null);

  const handleCalculate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const input: PredictionInput = {
      product_name: productName,
      category,
      current_price: currentPrice,
      historical_price: currentPrice,
      demand,
      stock_available: stockAvailable,
      competitor_price: competitorPrice,
      season,
      promotion_active: false,
    };

    const res = predict(input, selectedAlgo);
    setResult(res);
  };

  const loadScenario = (type: 'surge' | 'clearance' | 'compMatch') => {
    if (type === 'surge') {
      setProductName('Festival Gaming Console');
      setCategory('Electronics');
      setCurrentPrice(29999);
      setCompetitorPrice(31999);
      setDemand(90);
      setStockAvailable(3);
      setSeason('Festival');
    } else if (type === 'clearance') {
      setProductName('Cotton Casual Shirt');
      setCategory('Apparel');
      setCurrentPrice(1999);
      setCompetitorPrice(1899);
      setDemand(30);
      setStockAvailable(75);
      setSeason('Clearance');
    } else {
      setProductName('Running Shoes');
      setCategory('Footwear');
      setCurrentPrice(4999);
      setCompetitorPrice(4399);
      setDemand(55);
      setStockAvailable(25);
      setSeason('Normal');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Banner */}
      <div className="kraken-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#101114]">
              Interactive Price Calculator
            </h2>
            <p className="text-xs text-[#686b82] mt-0.5">
              Enter product parameters to evaluate real-time optimal prices recommended by the trained model.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-[#9497a9] font-medium">Test Presets:</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => loadScenario('surge')}
                className="btn-subtle text-xs"
              >
                High Demand & Low Stock
              </button>
              <button
                type="button"
                onClick={() => loadScenario('clearance')}
                className="rounded-[12px] border border-[#dedee5] bg-white px-3 py-1.5 text-xs text-[#101114] hover:bg-[#dedee5]/30 font-medium"
              >
                Clearance Surplus
              </button>
              <button
                type="button"
                onClick={() => loadScenario('compMatch')}
                className="rounded-[12px] border border-[#dedee5] bg-white px-3 py-1.5 text-xs text-[#101114] hover:bg-[#dedee5]/30 font-medium"
              >
                Competitor Undercut
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Form Input (7 cols) */}
        <div className="lg:col-span-7 kraken-card p-6 space-y-4">
          <form onSubmit={handleCalculate} className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#dedee5] pb-3">
              <span className="text-xs font-bold text-[#101114] uppercase tracking-wider">
                1. Product Parameters
              </span>
              <div className="flex items-center gap-1.5 text-xs text-[#686b82]">
                <span>Algorithm:</span>
                <select
                  value={selectedAlgo}
                  onChange={(e) => setSelectedAlgo(e.target.value as AlgorithmType)}
                  className="rounded-[8px] border border-[#dedee5] bg-white px-2 py-1 text-xs font-semibold text-[#00D4A4]"
                >
                  <option value="Random Forest">Random Forest (Recommended)</option>
                  <option value="Decision Tree">Decision Tree</option>
                  <option value="Linear Regression">Linear Regression</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#101114]">Product Name</label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="mt-1 w-full rounded-[10px] border border-[#dedee5] px-3 py-2 text-xs text-[#101114] focus:outline-hidden focus:border-[#00D4A4]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#101114]">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 w-full rounded-[10px] border border-[#dedee5] bg-white px-3 py-2 text-xs text-[#101114] focus:outline-hidden focus:border-[#00D4A4]"
                >
                  {dataReport.categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border-t border-[#dedee5] pt-3">
              <span className="text-xs font-bold text-[#101114] uppercase tracking-wider">
                2. Market Conditions
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#101114]">
                  Current List Price
                </label>
                <input
                  type="number"
                  min="1"
                  value={currentPrice}
                  onChange={(e) => setCurrentPrice(parseInt(e.target.value) || 0)}
                  className="mt-1 w-full rounded-[10px] border border-[#dedee5] px-3 py-2 text-xs font-mono font-medium text-[#101114] focus:outline-hidden focus:border-[#00D4A4]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#101114]">
                  Competitor Price
                </label>
                <input
                  type="number"
                  min="1"
                  value={competitorPrice}
                  onChange={(e) => setCompetitorPrice(parseInt(e.target.value) || 0)}
                  className="mt-1 w-full rounded-[10px] border border-[#dedee5] px-3 py-2 text-xs font-mono font-medium text-[#101114] focus:outline-hidden focus:border-[#00D4A4]"
                  required
                />
              </div>
            </div>

            {/* Demand Slider with Kraken Purple Accent */}
            <div className="rounded-[12px] border border-[#dedee5] bg-white p-3.5 space-y-1">
              <div className="flex justify-between text-xs text-[#101114]">
                <span className="font-semibold">Customer Demand Score:</span>
                <span className="font-mono font-bold text-[#00D4A4]">{demand} / 100</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={demand}
                onChange={(e) => setDemand(parseInt(e.target.value))}
                className="w-full accent-[#00D4A4] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-[#686b82]">
                <span>Low Demand (10)</span>
                <span>Normal (50)</span>
                <span>Peak Search (100)</span>
              </div>
            </div>

            {/* Stock Slider */}
            <div className="rounded-[12px] border border-[#dedee5] bg-white p-3.5 space-y-1">
              <div className="flex justify-between text-xs text-[#101114]">
                <span className="font-semibold">Warehouse Stock:</span>
                <span className={`font-mono font-bold ${stockAvailable <= 5 ? 'text-rose-700' : 'text-[#101114]'}`}>
                  {stockAvailable} units {stockAvailable <= 5 ? '(Critical Low Stock)' : ''}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={stockAvailable}
                onChange={(e) => setStockAvailable(parseInt(e.target.value))}
                className="w-full accent-[#00D4A4] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-[#686b82]">
                <span>1 unit (Nearly out)</span>
                <span>20 units</span>
                <span>100 units (Surplus)</span>
              </div>
            </div>

            {/* Season */}
            <div>
              <label className="text-xs font-semibold text-[#101114]">Season Context</label>
              <select
                value={season}
                onChange={(e) => setSeason(e.target.value as any)}
                className="mt-1 w-full rounded-[10px] border border-[#dedee5] bg-white px-3 py-2 text-xs text-[#101114] focus:outline-hidden focus:border-[#00D4A4]"
              >
                <option value="Festival">Festival Period (Diwali / Holiday Season)</option>
                <option value="Peak">Peak Shopping Wave</option>
                <option value="Normal">Normal Day</option>
                <option value="Clearance">Clearance Inventory Event</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Calculator className="h-4 w-4" />
              <span>Calculate Optimal Dynamic Price</span>
            </button>
          </form>
        </div>

        {/* Output Panel (5 cols) */}
        <div className="lg:col-span-5">
          {result ? (
            <div className="kraken-card p-6 space-y-5">
              <div className="border-b border-[#dedee5] pb-3 flex justify-between items-center">
                <span className="text-xs font-bold text-[#101114] uppercase tracking-wider">
                  Model Recommendation
                </span>
                <span className="badge-neutral font-mono">{result.modelUsed}</span>
              </div>

              {/* Big Price Display */}
              <div className="rounded-[12px] bg-[#101114] p-5 text-white shadow-[0_4px_20px_rgba(16,17,20,0.15)]">
                <span className="text-[11px] uppercase tracking-wider text-[#9497a9] font-semibold">
                  Recommended Selling Price
                </span>
                <div className="mt-1 flex items-baseline gap-3">
                  <span className="font-mono text-3xl font-bold tracking-tight">
                    {formatCurrency(result.recommendedPrice)}
                  </span>
                  <div
                    className={`flex items-center text-xs font-bold px-2 py-0.5 rounded-[6px] ${
                      result.percentageChange >= 0
                        ? 'bg-[rgba(20,158,97,0.2)] text-[#149e61]'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {result.percentageChange >= 0 ? (
                      <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
                    ) : (
                      <ArrowDownRight className="h-3.5 w-3.5 mr-0.5" />
                    )}
                    <span>
                      {result.percentageChange >= 0 ? '+' : ''}
                      {result.percentageChange}%
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-neutral-800 pt-3 text-xs">
                  <div>
                    <span className="text-[#9497a9]">Current Base:</span>
                    <p className="font-mono text-white font-medium">
                      {formatCurrency(result.currentPrice)}
                    </p>
                  </div>
                  <div>
                    <span className="text-[#9497a9]">Adjustment:</span>
                    <p className="font-mono text-white font-medium">
                      {result.absoluteChange >= 0 ? '+' : ''}
                      {formatCurrency(result.absoluteChange)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Plain English Factors */}
              <div>
                <h4 className="text-xs font-bold text-[#101114] mb-2 uppercase tracking-wider">
                  Pricing Drivers:
                </h4>
                <div className="space-y-2">
                  {result.keyFactors.map((f, i) => (
                    <div key={i} className="rounded-[10px] bg-white p-3 border border-[#dedee5] text-xs">
                      <div className="flex justify-between font-bold text-[#101114]">
                        <span>{f.factor}</span>
                        <span className={f.impact === 'positive' ? 'text-[#026b3f]' : 'text-rose-700'}>
                          {f.impact === 'positive' ? 'Surge effect' : 'Discount pressure'}
                        </span>
                      </div>
                      <p className="mt-1 text-[#686b82] text-[11px] leading-relaxed">
                        {f.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {result.appliedGuardrails.length > 0 && (
                <div className="rounded-[10px] bg-[rgba(0,212,164,0.08)] p-3 border border-[#00D4A4]/30 text-xs text-[#059669]">
                  <p className="font-bold">Executive Boundary Enforced:</p>
                  <ul className="mt-1 list-disc list-inside text-[11px] space-y-0.5">
                    {result.appliedGuardrails.map((g, idx) => (
                      <li key={idx}>{g}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="kraken-card p-12 text-center text-xs text-[#686b82] h-full flex flex-col items-center justify-center min-h-[360px]">
              <div className="h-12 w-12 rounded-[12px] bg-[rgba(0,212,164,0.12)] text-[#00D4A4] flex items-center justify-center mb-3">
                <Calculator className="h-6 w-6" />
              </div>
              <p className="font-bold text-[#101114] text-sm">Awaiting Calculation</p>
              <p className="mt-1 max-w-xs text-[#686b82]">
                Configure demand, inventory stock, and competitor moves, then click Calculate Optimal Dynamic Price.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
