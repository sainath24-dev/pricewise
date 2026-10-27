/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../../store/appContext';

export type CleanPageId =
  | 'storefront'
  | 'data'
  | 'eda'
  | 'train'
  | 'models'
  | 'calculator'
  | 'insights'
  | 'history'
  | 'settings';

interface SidebarProps {
  activePage: CleanPageId;
  setActivePage: (page: CleanPageId) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  setActivePage,
  isOpen,
  setIsOpen,
}) => {
  const { dataset, activeModel, storeProducts } = useApp();

  const navGroups: {
    title: string;
    items: { id: CleanPageId; label: string; badge?: string }[];
  }[] = [
    {
      title: 'STOREFRONT',
      items: [
        { id: 'storefront', label: 'Live Storefront', badge: 'Active' },
      ],
    },
    {
      title: 'CATALOG & PRICING',
      items: [
        { id: 'data', label: 'Catalog & Inventory' },
        { id: 'eda', label: 'Market Analytics' },
        { id: 'calculator', label: 'Price Simulator' },
        { id: 'insights', label: 'Price Surveillance' },
      ],
    },
    {
      title: 'INTELLIGENCE ENGINE',
      items: [
        { id: 'train', label: 'Model Training' },
        { id: 'models', label: 'Accuracy & Leaderboard' },
      ],
    },
    {
      title: 'STORE CONFIGURATION',
      items: [
        { id: 'history', label: 'Audit Trail & Orders' },
        { id: 'settings', label: 'Pricing Guardrails' },
      ],
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[#e5e7eb] bg-white h-screen shrink-0 transition-transform duration-200 md:static md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${!isOpen ? 'hidden md:flex' : ''}`}
      >
        {/* Brand Header with Clean Store Logo */}
        <div className="border-b border-[#e5e7eb] px-5 py-4 shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0 overflow-hidden rounded-xl border border-[#2b2d35] bg-[#18191c] p-1.5 flex items-center justify-center w-10 h-10 shadow-xs">
              <img
                src="/logo-icon.png"
                alt="PriceWise Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-base text-[#0c0d0e] tracking-tight truncate">
                PriceWise
              </span>
              <span className="text-[11px] font-medium text-[#64748b] truncate">
                Store Dashboard
              </span>
            </div>
          </div>
        </div>

        {/* Mintlify-Inspired Vertical Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              <div className="px-3 pb-1.5 text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider">
                {group.title}
              </div>

              {group.items.map((item) => {
                const isActive = activePage === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActivePage(item.id);
                      setIsOpen(false);
                    }}
                    className={`group w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#f1f5f9] text-[#0f172a] font-semibold'
                        : 'text-[#475569] font-medium hover:bg-[#f8fafc] hover:text-[#0f172a]'
                    }`}
                  >
                    <span className="truncate">{item.label}</span>

                    {isActive ? (
                      <span className="h-2 w-2 rounded-full bg-[#00D4A4] shrink-0 shadow-[0_0_8px_rgba(0,212,164,0.6)]" />
                    ) : item.badge ? (
                      <span className="rounded-full bg-[#e2e8f0] px-2 py-0.5 text-[10px] font-semibold text-[#475569]">
                        {item.badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Stable Store Status Footer */}
        <div className="border-t border-[#e5e7eb] p-4 bg-[#f8fafc] shrink-0 text-xs space-y-2">
          <div className="flex justify-between items-center text-[#64748b]">
            <span className="font-medium">Active Engine:</span>
            <span className="font-semibold text-[#0f172a] bg-white border border-[#e2e8f0] px-2 py-0.5 rounded-full text-[11px]">
              {activeModel}
            </span>
          </div>
          <div className="flex justify-between items-center text-[#64748b]">
            <span className="font-medium">Products Live:</span>
            <span className="font-mono font-semibold text-[#0f172a]">
              {storeProducts.length} items
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
