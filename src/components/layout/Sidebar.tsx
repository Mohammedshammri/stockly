import React from 'react';
import { useStore } from '../../context/StoreContext';
import {
  LayoutDashboard,
  Package,
  Layers,
  Receipt,
  BarChart3,
  BellRing,
  CreditCard,
  Settings,
  Boxes,
  Store,
  X,
  Sparkles,
} from 'lucide-react';

export type PageId =
  | 'dashboard'
  | 'products'
  | 'inventory'
  | 'sales'
  | 'analytics'
  | 'alerts'
  | 'pricing'
  | 'settings';

interface SidebarProps {
  currentPage: PageId;
  onSelectPage: (page: PageId) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { alerts, activePlan, settings } = useStore();

  const navItems: { id: PageId; label: string; icon: React.ReactNode; badge?: number | string }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'products',
      label: 'Products',
      icon: <Package className="w-4 h-4" />,
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: <Layers className="w-4 h-4" />,
    },
    {
      id: 'sales',
      label: 'Sales',
      icon: <Receipt className="w-4 h-4" />,
    },
    {
      id: 'analytics',
      label: 'Analytics & Reports',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: 'alerts',
      label: 'Smart Alerts',
      icon: <BellRing className="w-4 h-4" />,
      badge: alerts.length > 0 ? alerts.length : undefined,
    },
    {
      id: 'pricing',
      label: 'Pricing Plans',
      icon: <CreditCard className="w-4 h-4" />,
      badge: activePlan === 'professional' ? 'Pro' : activePlan === 'business' ? 'Biz' : 'Starter',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  const handleNavClick = (id: PageId) => {
    onSelectPage(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand & Store Lockup */}
        <div>
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <Boxes className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none">
                  Stockly
                </h1>
                <span className="text-[11px] text-slate-500 font-medium">Smart Retail SaaS</span>
              </div>
            </div>

            <button
              onClick={onCloseMobile}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 md:hidden"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Environment Label */}
          <div className="mx-4 mt-3 mb-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200/70 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-1.5 truncate">
              <Store className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="font-semibold text-slate-800 truncate">{settings.storeName}</span>
            </div>
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-emerald-800 bg-emerald-100/60 px-1.5 py-0.5 rounded">
              Demo
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 py-2 space-y-1">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`${
                        isActive ? 'text-emerald-700' : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                        item.id === 'alerts'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Subscription & Profile Widget */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-medium">Current Plan</span>
              <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/60">
                {activePlan}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-tight">
              {activePlan === 'professional'
                ? 'Up to 1,000 products & smart stock alerts enabled.'
                : activePlan === 'business'
                ? 'Unlimited products & priority support.'
                : 'Basic store inventory & sales logging.'}
            </p>
            <button
              onClick={() => handleNavClick('pricing')}
              className="w-full mt-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-center transition-colors text-[11px] flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3 h-3" /> Upgrade / Change Plan
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span className="font-mono text-[11px] truncate">mayameeshoo@gmail.com</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" title="System Online" />
          </div>
        </div>
      </aside>
    </>
  );
};
