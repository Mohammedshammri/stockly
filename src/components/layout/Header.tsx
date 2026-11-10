import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { PageId } from './Sidebar';
import {
  Menu,
  Plus,
  ShoppingCart,
  Bell,
  RotateCcw,
  AlertTriangle,
  ChevronRight,
  Database,
} from 'lucide-react';

interface HeaderProps {
  currentPage: PageId;
  onSelectPage: (page: PageId) => void;
  onOpenMobile: () => void;
}

const PAGE_TITLES: Record<PageId, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Dashboard Overview',
    subtitle: 'Real-time retail inventory valuation, revenue metrics & recent activity',
  },
  products: {
    title: 'Product Catalog',
    subtitle: 'Manage items, wholesale costs, retail pricing, suppliers and thresholds',
  },
  inventory: {
    title: 'Inventory Operations',
    subtitle: 'Stock monitoring, shipments intake, stock write-offs and complete ledger history',
  },
  sales: {
    title: 'Sales & Transactions',
    subtitle: 'Point of sale checkout, invoice receipts, payments and gross margin logs',
  },
  analytics: {
    title: 'Analytics & Financial Reports',
    subtitle: 'Sales velocity, estimated profit margins, category share and performance matrices',
  },
  alerts: {
    title: 'Smart Stock Alerts',
    subtitle: 'Automated reorder triggers, out-of-stock notices and shelf expiration warnings',
  },
  pricing: {
    title: 'SaaS Subscription Plans',
    subtitle: 'Scalable pricing plans designed for independent retailers and multi-branch stores',
  },
  settings: {
    title: 'Store Settings & Data',
    subtitle: 'Store profile, tax rate, local persistence status and database synchronization',
  },
};

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onSelectPage,
  onOpenMobile,
}) => {
  const {
    alerts,
    setIsNewSaleModalOpen,
    setIsAddProductModalOpen,
    resetDemoData,
  } = useStore();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const pageInfo = PAGE_TITLES[currentPage];

  const handleReset = () => {
    if (window.confirm('Reset all demo data back to default sample products and sales?')) {
      resetDemoData();
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 md:hidden"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span>Stockly</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-800 capitalize">{currentPage}</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-tight hidden sm:block">
            {pageInfo.title}
          </h2>
        </div>
      </div>

      {/* Right: Quick Action Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Persistence Status Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-600 bg-slate-100 rounded-lg border border-slate-200">
          <Database className="w-3.5 h-3.5 text-emerald-600" />
          <span>Local Demo Persistence (Browser)</span>
        </div>

        {/* Reset Demo Data Button */}
        <button
          onClick={handleReset}
          title="Reset sample demo store data"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors text-xs font-medium hidden sm:flex items-center gap-1.5 border border-slate-200"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo</span>
        </button>

        {/* Alerts Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors relative"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {alerts.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <h4 className="text-xs font-semibold text-slate-900">
                    Smart Stock Alerts ({alerts.length})
                  </h4>
                </div>
                <button
                  onClick={() => {
                    setIsNotificationsOpen(false);
                    onSelectPage('alerts');
                  }}
                  className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold"
                >
                  View All
                </button>
              </div>

              <div className="py-2 space-y-2 max-h-64 overflow-y-auto">
                {alerts.length === 0 ? (
                  <p className="text-xs text-slate-500 py-3 text-center">
                    All stock levels are optimal. No active alerts.
                  </p>
                ) : (
                  alerts.slice(0, 4).map((alert) => (
                    <div
                      key={alert.id}
                      onClick={() => {
                        setIsNotificationsOpen(false);
                        onSelectPage('alerts');
                      }}
                      className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-100 transition-colors cursor-pointer text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900 truncate max-w-[70%]">
                          {alert.productName}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                            alert.severity === 'critical'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {alert.type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-slate-600 line-clamp-1">{alert.message}</p>
                    </div>
                  ))
                )}
              </div>

              {alerts.length > 0 && (
                <button
                  onClick={() => {
                    setIsNotificationsOpen(false);
                    onSelectPage('alerts');
                  }}
                  className="w-full mt-2 py-1.5 text-center text-xs text-emerald-700 hover:bg-emerald-50 rounded-lg font-semibold transition-colors border border-emerald-200"
                >
                  Manage All Alerts & Reorders
                </button>
              )}
            </div>
          )}
        </div>

        {/* Action: Add Product */}
        <button
          onClick={() => setIsAddProductModalOpen(true)}
          className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors hidden sm:flex items-center gap-1.5 whitespace-nowrap shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Product</span>
        </button>

        {/* Action: New Sale (Primary Action) */}
        <button
          onClick={() => setIsNewSaleModalOpen(true)}
          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs flex items-center gap-1.5 whitespace-nowrap shrink-0"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>New Sale</span>
        </button>
      </div>
    </header>
  );
};
