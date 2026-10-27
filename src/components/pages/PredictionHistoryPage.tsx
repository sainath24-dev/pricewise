/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Papa from 'papaparse';
import {
  ArrowDownRight,
  ArrowUpRight,
  Download,
  Filter,
  History,
  Search,
  Trash2,
} from 'lucide-react';
import { useApp } from '../../store/appContext';

export const PredictionHistoryPage: React.FC = () => {
  const { predictionsHistory, deletePrediction, clearHistory, formatCurrency } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModel, setSelectedModel] = useState<string>('All');
  const [confirmClear, setConfirmClear] = useState(false);

  const filteredHistory = predictionsHistory.filter((item) => {
    const matchesSearch =
      (item.input.product_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.input.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModel = selectedModel === 'All' || item.modelUsed === selectedModel;
    return matchesSearch && matchesModel;
  });

  const handleExportCSV = () => {
    if (predictionsHistory.length === 0) return;
    const flatRows = predictionsHistory.map((p) => ({
      id: p.id,
      timestamp: p.timestamp,
      product: p.input.product_name,
      category: p.input.category,
      current_price: p.currentPrice,
      raw_predicted: p.rawPredictedPrice,
      recommended_price: p.recommendedPrice,
      absolute_change: p.absoluteChange,
      percentage_change: p.percentageChange,
      demand: p.input.demand,
      stock: p.input.stock_available,
      competitor_price: p.input.competitor_price,
      season: p.input.season,
      model_used: p.modelUsed,
      model_r2: p.modelR2,
    }));

    const csv = Papa.unparse(flatRows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `pricewise_prediction_audit_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Actions */}
      <div className="rounded-xl border border-neutral-200/90 bg-white p-5 shadow-xs">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-neutral-900">
                Prediction Audit History (Page 8)
              </h2>
              <span className="rounded bg-neutral-100 px-2 py-0.5 font-mono text-xs text-neutral-600">
                {predictionsHistory.length} Recorded
              </span>
            </div>
            <p className="mt-1 text-xs text-neutral-500">
              Audit trail of generated price predictions, market features, and applied executive guardrails
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportCSV}
              disabled={predictionsHistory.length === 0}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-700 shadow-2xs hover:bg-neutral-50 disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5 text-neutral-500" />
              <span>Export Audit CSV</span>
            </button>
            <button
              onClick={() => setConfirmClear(true)}
              disabled={predictionsHistory.length === 0}
              className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 hover:bg-rose-100 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear History</span>
            </button>
          </div>
        </div>

        {/* Clear Confirmation modal */}
        {confirmClear && (
          <div className="mt-4 flex items-center justify-between rounded-lg border border-rose-300 bg-rose-50 p-3 text-xs text-rose-900">
            <span>Are you sure you want to permanently delete all prediction audit logs?</span>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmClear(false)}
                className="rounded border border-neutral-300 bg-white px-2.5 py-1 font-medium text-neutral-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearHistory();
                  setConfirmClear(false);
                }}
                className="rounded bg-rose-700 px-2.5 py-1 font-medium text-white hover:bg-rose-800"
              >
                Yes, Delete All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filter and Table */}
      <div className="rounded-xl border border-neutral-200/90 bg-white p-4 shadow-xs">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by product SKU or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50/50 pl-9 pr-3 py-1.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-600 focus:bg-white focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500">Model:</span>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-xs text-neutral-800 focus:outline-hidden"
            >
              <option value="All">All Algorithms</option>
              <option value="Random Forest">Random Forest</option>
              <option value="Decision Tree">Decision Tree</option>
              <option value="Linear Regression">Linear Regression</option>
            </select>
          </div>
        </div>

        {/* History Table */}
        <div className="overflow-x-auto rounded-lg border border-neutral-200/70">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-neutral-600">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Timestamp</th>
                <th className="py-2.5 px-3 font-semibold">Product Name</th>
                <th className="py-2.5 px-3 font-semibold">Base Price</th>
                <th className="py-2.5 px-3 font-semibold">Recommended</th>
                <th className="py-2.5 px-3 font-semibold">Delta %</th>
                <th className="py-2.5 px-3 font-semibold">Demand / Stock</th>
                <th className="py-2.5 px-3 font-semibold">Competitor</th>
                <th className="py-2.5 px-3 font-semibold">Algorithm</th>
                <th className="py-2.5 px-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-neutral-400">
                    No prediction history records logged yet. Calculate prices in the Predictor to build your audit log.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-50/60">
                    <td className="py-2.5 px-3 font-mono text-neutral-500 text-[11px] whitespace-nowrap">
                      {new Date(item.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-neutral-900 max-w-[180px] truncate">
                      {item.input.product_name}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-neutral-700">
                      {formatCurrency(item.currentPrice)}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-emerald-800">
                      {formatCurrency(item.recommendedPrice)}
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      <span
                        className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          item.percentageChange >= 0
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {item.percentageChange >= 0 ? '+' : ''}
                        {item.percentageChange}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-neutral-600">
                      {item.input.demand}/100 • {item.input.stock_available}u
                    </td>
                    <td className="py-2.5 px-3 font-mono text-neutral-600">
                      {formatCurrency(item.input.competitor_price)}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-700">
                        {item.modelUsed}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <button
                        onClick={() => deletePrediction(item.id)}
                        className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-rose-600"
                        title="Delete log"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
