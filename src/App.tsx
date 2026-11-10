/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StoreProvider } from './context/StoreContext';
import { Sidebar, PageId } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardPage } from './pages/DashboardPage';
import { ProductsPage } from './pages/ProductsPage';
import { InventoryPage } from './pages/InventoryPage';
import { SalesPage } from './pages/SalesPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AlertsPage } from './pages/AlertsPage';
import { PricingPage } from './pages/PricingPage';
import { SettingsPage } from './pages/SettingsPage';
import { NewSaleModal } from './components/modals/NewSaleModal';
import { StockMovementModal } from './components/modals/StockMovementModal';
import { ReceiptModal } from './components/modals/ReceiptModal';
import { ProductModal } from './components/modals/ProductModal';
import { ToastContainer } from './components/common/ToastContainer';
import { useStore } from './context/StoreContext';

function MainAppContent() {
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { isAddProductModalOpen, setIsAddProductModalOpen } = useStore();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onSelectPage={(page) => setCurrentPage(page)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header */}
        <Header
          currentPage={currentPage}
          onSelectPage={(page) => setCurrentPage(page)}
          onOpenMobile={() => setIsMobileSidebarOpen(true)}
        />

        {/* Viewport Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentPage === 'dashboard' && <DashboardPage onNavigate={setCurrentPage} />}
          {currentPage === 'products' && <ProductsPage />}
          {currentPage === 'inventory' && <InventoryPage />}
          {currentPage === 'sales' && <SalesPage />}
          {currentPage === 'analytics' && <AnalyticsPage />}
          {currentPage === 'alerts' && <AlertsPage />}
          {currentPage === 'pricing' && <PricingPage />}
          {currentPage === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Global Modals */}
      <NewSaleModal />
      <StockMovementModal />
      <ReceiptModal />
      <ProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
      />

      {/* Reactive Toasts */}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <MainAppContent />
    </StoreProvider>
  );
}
