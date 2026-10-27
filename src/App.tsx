/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Header } from './components/layout/Header';
import { CleanPageId, Sidebar } from './components/layout/Sidebar';
import { CartModal } from './components/pages/CartModal';
import { DatasetExplorerPage } from './components/pages/DatasetExplorerPage';
import { EDAPage } from './components/pages/EDAPage';
import { ModelEvaluationPage } from './components/pages/ModelEvaluationPage';
import { PredictionHistoryPage } from './components/pages/PredictionHistoryPage';
import { PricePredictorPage } from './components/pages/PricePredictorPage';
import { PricingInsightsPage } from './components/pages/PricingInsightsPage';
import { SettingsPage } from './components/pages/SettingsPage';
import { StorefrontPage } from './components/pages/StorefrontPage';
import { TrainModelsPage } from './components/pages/TrainModelsPage';
import { AppProvider } from './store/appContext';

function AppContent() {
  const [activePage, setActivePage] = useState<CleanPageId>('storefront');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  // Check URL parameters for fast routing
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pageParam = params.get('page') as CleanPageId | null;
    if (
      pageParam &&
      [
        'storefront',
        'data',
        'eda',
        'train',
        'models',
        'calculator',
        'insights',
        'history',
        'settings',
      ].includes(pageParam)
    ) {
      setActivePage(pageParam);
    }
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#fafafa] text-[#0f172a] font-sans antialiased">
      {/* Stable Sidebar - fixed full viewport height */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Main Container - Header sticky at top, only main body scrolls */}
      <div className="flex flex-1 flex-col h-screen min-w-0 overflow-hidden">
        <Header
          activePage={activePage}
          setActivePage={setActivePage}
          toggleSidebar={() => setSidebarOpen((prev) => !prev)}
          openCartModal={() => setCartOpen(true)}
        />

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#fafafa]">
          <div className="mx-auto max-w-6xl">
            {activePage === 'storefront' && <StorefrontPage />}
            {activePage === 'data' && <DatasetExplorerPage />}
            {activePage === 'eda' && <EDAPage />}
            {activePage === 'train' && <TrainModelsPage />}
            {activePage === 'models' && <ModelEvaluationPage />}
            {activePage === 'calculator' && <PricePredictorPage />}
            {activePage === 'insights' && <PricingInsightsPage />}
            {activePage === 'history' && <PredictionHistoryPage />}
            {activePage === 'settings' && <SettingsPage />}
          </div>
        </main>
      </div>

      {/* Modern E-Commerce Cart & Payment Gateway Modal */}
      <CartModal isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
