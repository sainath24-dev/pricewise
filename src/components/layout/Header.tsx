/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { useApp } from '../../store/appContext';
import { CleanPageId } from './Sidebar';

interface HeaderProps {
  activePage: CleanPageId;
  setActivePage: (page: CleanPageId) => void;
  toggleSidebar: () => void;
  openCartModal: () => void;
}

const PAGE_TITLES: Record<CleanPageId, { title: string; subtitle: string }> = {
  storefront: {
    title: 'Live Storefront',
    subtitle: 'Real-time dynamic pricing adapted to customer demand, inventory, and competitor moves.',
  },
  data: {
    title: 'Catalog & Inventory',
    subtitle: 'Manage product SKUs, stock levels, historical baselines, and catalog health.',
  },
  eda: {
    title: 'Market Analytics',
    subtitle: 'Demand elasticity, competitor price divergence, and seasonal volume trends.',
  },
  train: {
    title: 'Pricing Engine Studio',
    subtitle: 'Configure hyperparameter weights and train algorithmic pricing models.',
  },
  models: {
    title: 'Accuracy & Leaderboard',
    subtitle: 'Benchmark MAE, RMSE, and R² scores across pricing models on held-out test splits.',
  },
  calculator: {
    title: 'Price Simulator',
    subtitle: 'Test hypothetical market demand, inventory scarcity, and rival price shifts.',
  },
  insights: {
    title: 'Price Surveillance',
    subtitle: 'Real-time pricing opportunities, competitor undercuts, and margin alerts.',
  },
  history: {
    title: 'Audit Trail & Orders',
    subtitle: 'Historical record of automated price updates and checkout transactions.',
  },
  settings: {
    title: 'Pricing Guardrails',
    subtitle: 'Configure executive surge ceilings, discount floors, and margin protection rules.',
  },
};

export const Header: React.FC<HeaderProps> = ({
  activePage,
  toggleSidebar,
  openCartModal,
}) => {
  const { cartCount, cartTotal, formatCurrency } = useApp();

  const currentMeta = PAGE_TITLES[activePage] || {
    title: 'Store Dashboard',
    subtitle: 'E-Commerce Dynamic Pricing Platform',
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-[#e5e7eb] bg-white px-4 sm:px-6">
      {/* Left: Mobile hamburger & Clean Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={toggleSidebar}
          className="rounded-full p-2 text-[#475569] hover:bg-[#f1f5f9] md:hidden cursor-pointer"
          aria-label="Open menu"
        >
          <img src="/logo-icon.png" alt="Logo" className="w-5 h-5 object-contain" />
        </button>

        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-bold text-[#0c0d0e] tracking-tight truncate">
            {currentMeta.title}
          </h1>
          <p className="hidden text-xs text-[#64748b] sm:block truncate">
            {currentMeta.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Only the styled Cart button & Live Total Pill */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={openCartModal}
          className="group flex items-center gap-2.5 rounded-full bg-[#0c0d0e] hover:bg-[#1e2025] px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          <ShoppingBag className="h-4 w-4 text-[#00D4A4]" />
          <span>Cart</span>
          {cartCount > 0 ? (
            <span className="flex items-center gap-1.5">
              <span className="rounded-full bg-[#00D4A4] px-2 py-0.5 font-mono text-[11px] font-bold text-[#0c0d0e]">
                {cartCount}
              </span>
              <span className="hidden sm:inline font-mono text-white/90 text-xs font-medium">
                {formatCurrency(cartTotal)}
              </span>
            </span>
          ) : (
            <span className="rounded-full bg-white/20 px-1.5 py-0.5 font-mono text-[10px] text-white/80">
              0
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
