/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CheckCircle2, RotateCcw, Save, Settings, ShieldCheck, Trash2 } from 'lucide-react';
import { useApp } from '../../store/appContext';
import { AlgorithmType, Currency } from '../../types';

export const SettingsPage: React.FC = () => {
  const {
    settings,
    updateSettings,
    resetToDemoDataset,
    clearHistory,
    predictionsHistory,
  } = useApp();

  const [formSettings, setFormSettings] = useState(settings);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formSettings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleResetData = () => {
    resetToDemoDataset();
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="rounded-xl border border-neutral-200/90 bg-white p-5 shadow-xs">
        <h2 className="text-base font-semibold text-neutral-900">
          Executive Settings & Pricing Guardrails (Page 10)
        </h2>
        <p className="mt-1 text-xs text-neutral-500">
          Configure business rules, maximum surge caps, minimum discount floors, and system preferences
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Safety Guardrails Card */}
        <div className="rounded-xl border border-neutral-200/90 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
            <ShieldCheck className="h-4 w-4 text-emerald-700" />
            <h3 className="text-sm font-semibold text-neutral-900">
              Pricing Safety Bounds & Executive Guardrails
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
            <div>
              <label className="font-medium text-neutral-700">
                Maximum Permitted Surge Cap (%)
              </label>
              <p className="text-[11px] text-neutral-500 mb-1">
                Upper limit on price increases above current price to protect customer sentiment
              </p>
              <input
                type="number"
                min="5"
                max="100"
                value={formSettings.maxSurgePercent}
                onChange={(e) =>
                  setFormSettings({
                    ...formSettings,
                    maxSurgePercent: parseInt(e.target.value) || 30,
                  })
                }
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 font-mono text-neutral-900 focus:border-emerald-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="font-medium text-neutral-700">
                Maximum Permitted Discount Floor (%)
              </label>
              <p className="text-[11px] text-neutral-500 mb-1">
                Lower limit on algorithmic price drops to prevent brand equity degradation
              </p>
              <input
                type="number"
                min="5"
                max="60"
                value={formSettings.maxDiscountPercent}
                onChange={(e) =>
                  setFormSettings({
                    ...formSettings,
                    maxDiscountPercent: parseInt(e.target.value) || 35,
                  })
                }
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 font-mono text-neutral-900 focus:border-emerald-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="font-medium text-neutral-700">
                Minimum Margin Floor Ratio (vs Historical)
              </label>
              <p className="text-[11px] text-neutral-500 mb-1">
                Absolute minimum price ratio (e.g., 0.65 = 65% of historical cost basis)
              </p>
              <input
                type="number"
                min="0.4"
                max="0.9"
                step="0.05"
                value={formSettings.minMarginFloorRatio}
                onChange={(e) =>
                  setFormSettings({
                    ...formSettings,
                    minMarginFloorRatio: parseFloat(e.target.value) || 0.65,
                  })
                }
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 font-mono text-neutral-900 focus:border-emerald-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="font-medium text-neutral-700">
                Low Stock Scarcity Threshold (Units)
              </label>
              <p className="text-[11px] text-neutral-500 mb-1">
                Inventory count below which scarcity surge pricing is prioritized
              </p>
              <input
                type="number"
                min="1"
                max="20"
                value={formSettings.lowStockThreshold}
                onChange={(e) =>
                  setFormSettings({
                    ...formSettings,
                    lowStockThreshold: parseInt(e.target.value) || 5,
                  })
                }
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 font-mono text-neutral-900 focus:border-emerald-600 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Currency & Model Preference */}
        <div className="rounded-xl border border-neutral-200/90 bg-white p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-semibold text-neutral-900 border-b border-neutral-100 pb-3">
            System Display & Modeling Preferences
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
            <div>
              <label className="font-medium text-neutral-700">Display Currency</label>
              <select
                value={formSettings.currency}
                onChange={(e) =>
                  setFormSettings({ ...formSettings, currency: e.target.value as Currency })
                }
                className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-neutral-900 focus:border-emerald-600 focus:outline-hidden"
              >
                <option value="INR">Indian Rupee (₹ INR)</option>
                <option value="USD">US Dollar ($ USD)</option>
                <option value="EUR">Euro (€ EUR)</option>
              </select>
            </div>

            <div>
              <label className="font-medium text-neutral-700">Default Supervised Model</label>
              <select
                value={formSettings.defaultModel}
                onChange={(e) =>
                  setFormSettings({
                    ...formSettings,
                    defaultModel: e.target.value as AlgorithmType,
                  })
                }
                className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-neutral-900 focus:border-emerald-600 focus:outline-hidden"
              >
                <option value="Random Forest">Random Forest Regressor</option>
                <option value="Decision Tree">Decision Tree Regressor</option>
                <option value="Linear Regression">Linear Regression</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg bg-emerald-700 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-800 transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>Save Configuration</span>
          </button>
          {saveSuccess && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              <span>Settings successfully saved and persisted!</span>
            </span>
          )}
        </div>
      </form>

      {/* Danger Zone / Reset Actions */}
      <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-5 shadow-xs space-y-3">
        <h3 className="text-sm font-semibold text-rose-950">Data State & Storage Actions</h3>
        <p className="text-xs text-rose-800">
          Manage local demo datasets and audit history.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleResetData}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 shadow-2xs"
          >
            <RotateCcw className="h-3.5 w-3.5 text-neutral-500" />
            <span>Reset Demo Dataset</span>
          </button>
          {resetSuccess && (
            <span className="text-xs text-emerald-700 font-medium">Dataset reset!</span>
          )}

          <button
            onClick={clearHistory}
            disabled={predictionsHistory.length === 0}
            className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-medium text-rose-700 hover:bg-rose-50 shadow-2xs disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Purge Prediction History ({predictionsHistory.length})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
