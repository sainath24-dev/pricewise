/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useRef, useState } from 'react';
import {
  Bell,
  Check,
  ChevronDown,
  ExternalLink,
  Flame,
  Search,
  Sliders,
  ShoppingBag,
  Star,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react';
import { useApp } from '../../store/appContext';
import { StoreProduct } from '../../types';
import { PriceComparisonAndTrends } from '../storefront/PriceComparisonAndTrends';

export const StorefrontPage: React.FC = () => {
  const {
    storeProducts,
    updateStoreProductStock,
    updateStoreProductDemand,
    updateStoreProductCompetitors,
    addToCart,
    formatCurrency,
    activeModel,
    priceAlerts,
    setPriceAlert,
    removePriceAlert,
    triggeredAlertNotification,
    dismissAlertNotification,
    simulatePriceDropForAlert,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'discount'>('featured');
  const [inspectingProduct, setInspectingProduct] = useState<StoreProduct | null>(null);
  const [alertProduct, setAlertProduct] = useState<StoreProduct | null>(null);
  const [targetAlertPrice, setTargetAlertPrice] = useState<number>(0);
  const [selectedTrendProduct, setSelectedTrendProduct] = useState<StoreProduct>(
    storeProducts[0] || null
  );
  const [addedNotice, setAddedNotice] = useState<string | null>(null);
  const [editAmazon, setEditAmazon] = useState<number>(0);
  const [editFlipkart, setEditFlipkart] = useState<number>(0);

  const deepDiveRef = useRef<HTMLDivElement>(null);

  const categories = [
    'All',
    'Electronics',
    'Footwear',
    'Home & Kitchen',
    'Gaming',
    'Apparel',
    'Sports',
  ];

  // Search & Filter Logic
  const filteredProducts = useMemo(() => {
    let list = storeProducts.filter((p) => {
      const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
      const matchSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });

    if (sortBy === 'price-asc') {
      list = [...list].sort((a, b) => a.dynamicPrice - b.dynamicPrice);
    } else if (sortBy === 'price-desc') {
      list = [...list].sort((a, b) => b.dynamicPrice - a.dynamicPrice);
    } else if (sortBy === 'discount') {
      list = [...list].sort((a, b) => a.priceDeltaPercent - b.priceDeltaPercent);
    }

    return list;
  }, [storeProducts, selectedCategory, searchQuery, sortBy]);

  const handleAddToCart = (product: StoreProduct) => {
    addToCart(product, 1);
    setAddedNotice(`Added "${product.title}" to cart`);
    setTimeout(() => setAddedNotice(null), 2500);
  };

  const openInspection = (product: StoreProduct) => {
    setInspectingProduct(product);
    setEditAmazon(product.amazonPrice);
    setEditFlipkart(product.flipkartPrice);
  };

  const openPriceAlertModal = (product: StoreProduct) => {
    const existing = priceAlerts.find((a) => a.productId === product.id);
    const initialTarget = existing
      ? existing.targetPrice
      : Math.round(product.dynamicPrice * 0.9);
    setAlertProduct(product);
    setTargetAlertPrice(initialTarget);
  };

  const handleSaveAlert = () => {
    if (alertProduct && targetAlertPrice > 0) {
      setPriceAlert(alertProduct.id, targetAlertPrice);
      setAddedNotice(`Price alert set for ${alertProduct.title} at ${formatCurrency(targetAlertPrice)}`);
      setAlertProduct(null);
      setTimeout(() => setAddedNotice(null), 3000);
    }
  };

  const handleSimulateAlertTrigger = () => {
    if (alertProduct) {
      const prodId = alertProduct.id;
      setPriceAlert(prodId, targetAlertPrice);
      setAlertProduct(null);
      simulatePriceDropForAlert(prodId);
    }
  };

  const handleInspectTrends = (product: StoreProduct) => {
    setSelectedTrendProduct(product);
    if (deepDiveRef.current) {
      deepDiveRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const currentTrendProduct =
    storeProducts.find((p) => p.id === selectedTrendProduct?.id) ||
    selectedTrendProduct ||
    storeProducts[0];

  return (
    <div className="space-y-6 max-w-6xl pb-16">
      {/* Toast Notice */}
      {addedNotice && (
        <div className="fixed bottom-6 right-6 z-50 rounded-full bg-[#0c0d0e] px-5 py-3 text-xs font-semibold text-white shadow-xl flex items-center gap-2 animate-in slide-in-from-bottom-2">
          <Check className="h-4 w-4 text-[#00D4A4]" />
          <span>{addedNotice}</span>
        </div>
      )}

      {/* Triggered Price Alert Notification Banner */}
      {triggeredAlertNotification && (
        <div className="rounded-2xl border border-[#00D4A4] bg-[#00D4A4]/10 p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#00D4A4] text-[#0c0d0e] text-[10px] uppercase font-bold px-2.5 py-0.5">
                  Price Alert Triggered
                </span>
                <span className="font-mono text-xs text-[#64748b]">
                  Target: {formatCurrency(triggeredAlertNotification.alert.targetPrice)}
                </span>
              </div>
              <p className="text-sm font-bold text-[#0c0d0e]">
                &ldquo;{triggeredAlertNotification.alert.productTitle}&rdquo; has dropped to{' '}
                <span className="text-[#059669] font-mono font-bold">
                  {formatCurrency(triggeredAlertNotification.currentPrice)}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {(() => {
                const prod = storeProducts.find(
                  (p) => p.id === triggeredAlertNotification.alert.productId
                );
                return prod ? (
                  <button
                    onClick={() => {
                      handleAddToCart(prod);
                      dismissAlertNotification();
                    }}
                    className="btn-primary text-xs py-2 px-4"
                  >
                    Add to Cart Now
                  </button>
                ) : null;
              })()}
              <button
                onClick={dismissAlertNotification}
                className="rounded-full p-1.5 text-[#64748b] hover:bg-black/5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Storefront Hero Bar */}
      <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold tracking-tight text-[#0c0d0e]">
                Product Catalog
              </h2>
              <span className="rounded-full bg-[#f1f5f9] px-2.5 py-0.5 text-xs font-semibold text-[#475569]">
                {storeProducts.length} Live Items
              </span>
              {priceAlerts.length > 0 && (
                <span className="rounded-full bg-[#00D4A4]/20 text-[#059669] px-2.5 py-0.5 text-xs font-bold font-mono">
                  {priceAlerts.length} Active Alert{priceAlerts.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <p className="text-xs text-[#64748b] mt-1">
              Real-time prices continuously aligned against competitor benchmarks and warehouse inventory.
            </p>
          </div>

          {/* Search Input & Sort */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#94a3b8]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full sm:w-60 rounded-full border border-[#e5e7eb] bg-[#f8fafc] pl-9 pr-4 py-2 text-xs font-medium text-[#0c0d0e] focus:border-[#00D4A4] focus:bg-white focus:outline-hidden transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-[#94a3b8] hover:text-[#0c0d0e]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-full border border-[#e5e7eb] bg-white px-3 py-2 text-xs font-semibold text-[#475569] focus:outline-hidden cursor-pointer"
            >
              <option value="featured">Featured Deals</option>
              <option value="discount">Biggest Savings</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Category Pills Navigation */}
        <div className="mt-4 pt-4 border-t border-[#f1f5f9] flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#0c0d0e] text-white shadow-xs'
                    : 'bg-[#f8fafc] border border-[#e5e7eb] text-[#475569] hover:bg-[#f1f5f9] hover:text-[#0c0d0e]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="rounded-2xl border border-[#e5e7eb] bg-white p-12 text-center space-y-3">
          <p className="text-sm font-semibold text-[#0c0d0e]">No products found</p>
          <p className="text-xs text-[#64748b]">Try searching for another term or selecting "All" categories.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="btn-outlined text-xs mt-2"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => {
            const lowestRival = Math.min(product.amazonPrice, product.flipkartPrice);
            const beatsRival = product.dynamicPrice < lowestRival;
            const diffRival = lowestRival - product.dynamicPrice;
            const activeAlert = priceAlerts.find((a) => a.productId === product.id);

            return (
              <div
                key={product.id}
                className="group rounded-2xl border border-[#e5e7eb] bg-white p-3.5 flex flex-col justify-between hover:border-[#cbd5e1] hover:shadow-md transition-all duration-200"
              >
                <div>
                  {/* Image Container with Badges */}
                  <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl bg-neutral-100 mb-3 border border-[#f1f5f9]">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="h-full w-full object-cover group-hover:scale-103 transition duration-300"
                      loading="lazy"
                    />

                    {/* Top Left Badges */}
                    <div className="absolute left-2.5 top-2.5 flex flex-col gap-1 items-start">
                      {product.priceDeltaPercent < 0 ? (
                        <span className="rounded-full bg-[#00D4A4] text-[#0c0d0e] px-2.5 py-0.5 text-[10px] font-bold shadow-xs">
                          Save {Math.abs(Math.round(product.priceDeltaPercent))}%
                        </span>
                      ) : (
                        <span className="rounded-full bg-[#0c0d0e] text-white px-2.5 py-0.5 text-[10px] font-semibold shadow-xs">
                          Surge (+{Math.round(product.priceDeltaPercent)}%)
                        </span>
                      )}

                      {activeAlert && (
                        <span className="rounded-full bg-white text-[#0c0d0e] px-2 py-0.5 text-[9px] font-mono font-bold shadow-xs border border-[#e5e7eb]">
                          Alert: &le; {formatCurrency(activeAlert.targetPrice)}
                        </span>
                      )}
                    </div>

                    {/* Stock Badge */}
                    <div className="absolute right-2.5 bottom-2.5">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold ${
                          product.stock <= 5
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-white/95 text-[#0c0d0e] shadow-xs'
                        }`}
                      >
                        {product.stock <= 5 ? `Only ${product.stock} left` : `${product.stock} in stock`}
                      </span>
                    </div>
                  </div>

                  {/* Title & Metadata */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-[#64748b]">
                      <span className="font-medium">{product.category}</span>
                      <span className="flex items-center gap-1 font-semibold text-[#0c0d0e]">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        {product.rating} ({product.reviewsCount})
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-[#0c0d0e] line-clamp-1 leading-snug">
                      {product.title}
                    </h3>

                    <p className="text-[11px] text-[#64748b] line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  {/* Market Competitor Price Benchmark Box */}
                  <div className="mt-3 rounded-xl border border-[#e5e7eb] bg-[#f8fafc] p-2.5 space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between text-[#64748b]">
                      <span>Amazon:</span>
                      <span className="font-mono font-semibold text-[#0c0d0e]">
                        {formatCurrency(product.amazonPrice)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[#64748b]">
                      <span>Flipkart:</span>
                      <span className="font-mono font-semibold text-[#0c0d0e]">
                        {formatCurrency(product.flipkartPrice)}
                      </span>
                    </div>

                    <div className="pt-1.5 border-t border-[#e2e8f0] flex items-center justify-between text-[10px]">
                      <span className="text-[#64748b]">Market Position:</span>
                      {beatsRival ? (
                        <span className="text-[#059669] font-bold">
                          {formatCurrency(diffRival)} below rivals
                        </span>
                      ) : (
                        <span className="text-[#475569] font-medium">
                          Optimal Margin
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Selling Price & Action Buttons */}
                <div className="mt-4 pt-3 border-t border-[#f1f5f9] space-y-2.5">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-mono text-base font-bold text-[#0c0d0e]">
                          {formatCurrency(product.dynamicPrice)}
                        </span>
                        {product.dynamicPrice !== product.basePrice && (
                          <span className="font-mono text-xs text-[#94a3b8] line-through">
                            {formatCurrency(product.basePrice)}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#94a3b8]">
                        MRP: {formatCurrency(product.basePrice)}
                      </span>
                    </div>

                    <button
                      onClick={() => openInspection(product)}
                      className="rounded-full bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#0c0d0e] px-2.5 py-1 text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
                      title="Adjust demand & stock parameters to see live price changes"
                    >
                      <Sliders className="h-3 w-3" />
                      <span>Adjust</span>
                    </button>
                  </div>

                  {/* Primary Add to Cart Button */}
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="w-full rounded-full bg-[#0c0d0e] hover:bg-[#1e2025] text-white py-2 px-3 text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition active:scale-98 cursor-pointer"
                  >
                    <ShoppingBag className="h-3.5 w-3.5 text-[#00D4A4]" />
                    <span>Add to Cart</span>
                  </button>

                  {/* Secondary Utility Pills */}
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => openPriceAlertModal(product)}
                      className="rounded-full border border-[#e5e7eb] py-1 text-[10px] font-medium text-[#475569] hover:bg-[#f8fafc] text-center transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Bell className="h-3 w-3" />
                      <span>{activeAlert ? 'Edit Alert' : 'Price Alert'}</span>
                    </button>

                    <button
                      onClick={() => handleInspectTrends(product)}
                      className="rounded-full border border-[#e5e7eb] py-1 text-[10px] font-medium text-[#475569] hover:bg-[#f8fafc] text-center transition cursor-pointer"
                    >
                      Trends
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Deep-Dive Comparison View & Recharts Line Chart */}
      {currentTrendProduct && (
        <div ref={deepDiveRef} className="pt-6">
          <PriceComparisonAndTrends
            selectedProduct={currentTrendProduct}
            onSelectProduct={(p) => setSelectedTrendProduct(p)}
            allProducts={storeProducts}
            formatCurrency={formatCurrency}
            activeModel={activeModel}
          />
        </div>
      )}

      {/* Price Alert Modal */}
      {alertProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl border border-[#e5e7eb]">
            <div className="flex items-start justify-between border-b border-[#e5e7eb] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#0c0d0e]">Set Price Alert</h3>
                <p className="text-xs text-[#64748b] truncate max-w-xs">{alertProduct.title}</p>
              </div>
              <button
                onClick={() => setAlertProduct(null)}
                className="rounded-full p-1 text-[#64748b] hover:bg-[#f1f5f9]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="rounded-xl bg-[#0c0d0e] p-3.5 text-white">
                <div className="flex justify-between items-center text-xs text-[#94a3b8]">
                  <span>Current Selling Price</span>
                  <span>MRP: {formatCurrency(alertProduct.basePrice)}</span>
                </div>
                <div className="font-mono text-xl font-bold mt-1 text-[#00D4A4]">
                  {formatCurrency(alertProduct.dynamicPrice)}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#0c0d0e] block">
                  Notify me when price drops to (₹):
                </label>
                <input
                  type="number"
                  value={targetAlertPrice}
                  onChange={(e) => setTargetAlertPrice(Number(e.target.value))}
                  className="w-full rounded-xl border border-[#e5e7eb] px-3 py-2 text-sm font-mono font-bold text-[#0c0d0e] focus:border-[#00D4A4] focus:outline-hidden"
                />

                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[#64748b] text-[11px]">Quick Presets:</span>
                  {[0.05, 0.1, 0.15].map((pct) => {
                    const price = Math.round(alertProduct.dynamicPrice * (1 - pct));
                    return (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setTargetAlertPrice(price)}
                        className="rounded-full border border-[#e5e7eb] px-2.5 py-0.5 text-[10px] font-semibold text-[#475569] hover:bg-[#f1f5f9] cursor-pointer"
                      >
                        -{pct * 100}% ({formatCurrency(price)})
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#e5e7eb]">
                <button
                  onClick={handleSaveAlert}
                  className="btn-primary w-full py-2.5 text-xs text-center"
                >
                  Save Alert ({formatCurrency(targetAlertPrice)})
                </button>

                <button
                  onClick={handleSimulateAlertTrigger}
                  className="btn-outlined w-full py-2 text-xs text-center"
                  title="Simulates market clearance causing price to drop below target and triggers the alert notification immediately"
                >
                  Simulate Price Drop & Trigger Alert
                </button>

                {priceAlerts.some((a) => a.productId === alertProduct.id) && (
                  <button
                    onClick={() => {
                      removePriceAlert(alertProduct.id);
                      setAlertProduct(null);
                      setAddedNotice(`Removed alert for ${alertProduct.title}`);
                      setTimeout(() => setAddedNotice(null), 2500);
                    }}
                    className="w-full text-center text-xs text-rose-600 font-semibold py-1 hover:underline cursor-pointer"
                  >
                    Delete Alert
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Adjust Inputs Modal (Live Price Reaction Simulator) */}
      {inspectingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl border border-[#e5e7eb] max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[#e5e7eb] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#0c0d0e]">
                  Market Pricing Inspector
                </h3>
                <p className="text-xs text-[#64748b] truncate max-w-xs">{inspectingProduct.title}</p>
              </div>
              <button
                onClick={() => setInspectingProduct(null)}
                className="rounded-full p-1 text-[#64748b] hover:bg-[#f1f5f9]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {/* Dynamic Price Display */}
              <div className="rounded-xl bg-[#0c0d0e] p-4 text-white">
                <div className="flex justify-between items-center text-xs text-[#94a3b8]">
                  <span>Calculated Dynamic Price</span>
                  <span className="font-mono text-[#00D4A4] font-bold">
                    {inspectingProduct.priceDeltaPercent >= 0 ? '+' : ''}
                    {inspectingProduct.priceDeltaPercent}% adjustment
                  </span>
                </div>
                <div className="font-mono text-2xl font-bold mt-1 text-white">
                  {formatCurrency(inspectingProduct.dynamicPrice)}
                </div>
                <div className="mt-2 flex flex-wrap justify-between text-xs border-t border-neutral-800 pt-2 text-neutral-300 gap-y-1">
                  <span>Base MRP: {formatCurrency(inspectingProduct.basePrice)}</span>
                  <span>Amazon: {formatCurrency(inspectingProduct.amazonPrice)}</span>
                  <span>Flipkart: {formatCurrency(inspectingProduct.flipkartPrice)}</span>
                </div>
              </div>

              {/* Rationale explanation */}
              <div className="rounded-xl bg-[#f8fafc] p-3 border border-[#e5e7eb] text-xs">
                <span className="font-bold text-[#0c0d0e] block mb-1">Pricing Rationale:</span>
                <p className="text-[#64748b] leading-relaxed">
                  {inspectingProduct.dynamicBadge.reason}
                </p>
              </div>

              {/* Interactive Market Inputs */}
              <div className="rounded-xl border border-[#e5e7eb] p-3.5 space-y-3 bg-white">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0c0d0e]">
                    Simulate Market Shifts:
                  </span>
                  <span className="text-[10px] text-[#059669] font-medium bg-[#00D4A4]/15 px-2 py-0.5 rounded-full">
                    Live Updates
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-[#64748b] block mb-1">
                      Amazon Price (₹)
                    </label>
                    <input
                      type="number"
                      value={editAmazon}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setEditAmazon(val);
                        updateStoreProductCompetitors(inspectingProduct.id, val, editFlipkart);
                        setInspectingProduct((prev) =>
                          prev ? { ...prev, amazonPrice: val } : null
                        );
                      }}
                      className="w-full rounded-xl border border-[#e5e7eb] px-3 py-1.5 text-xs font-mono font-medium focus:border-[#00D4A4] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#64748b] block mb-1">
                      Flipkart Price (₹)
                    </label>
                    <input
                      type="number"
                      value={editFlipkart}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setEditFlipkart(val);
                        updateStoreProductCompetitors(inspectingProduct.id, editAmazon, val);
                        setInspectingProduct((prev) =>
                          prev ? { ...prev, flipkartPrice: val } : null
                        );
                      }}
                      className="w-full rounded-xl border border-[#e5e7eb] px-3 py-1.5 text-xs font-mono font-medium focus:border-[#00D4A4] focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Stock & Demand Sliders */}
                <div className="pt-2 border-t border-[#e5e7eb] space-y-3">
                  <div>
                    <div className="flex justify-between text-xs text-[#0c0d0e] mb-1">
                      <span className="font-medium">Warehouse Inventory:</span>
                      <span className="font-mono font-bold text-[#0c0d0e]">
                        {inspectingProduct.stock} units
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="70"
                      value={inspectingProduct.stock}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        updateStoreProductStock(inspectingProduct.id, val);
                        setInspectingProduct((prev) => (prev ? { ...prev, stock: val } : null));
                      }}
                      className="w-full accent-[#0c0d0e] cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-[#0c0d0e] mb-1">
                      <span className="font-medium">Shopper Demand Score (1-100):</span>
                      <span className="font-mono font-bold text-[#00D4A4]">
                        {inspectingProduct.demandIndex} / 100
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={inspectingProduct.demandIndex}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        updateStoreProductDemand(inspectingProduct.id, val);
                        setInspectingProduct((prev) => (prev ? { ...prev, demandIndex: val } : null));
                      }}
                      className="w-full accent-[#00D4A4] cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => setInspectingProduct(null)}
                className="btn-primary w-full py-2.5 text-xs text-center"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
