import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { SeverityBadge } from '../components/common/Badge';
import { SmartAlert, AlertType } from '../types';
import {
  BellRing,
  AlertTriangle,
  Clock,
  ArrowDownLeft,
  Tag,
  Package,
  CheckCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const { alerts, products, setStockModalConfig, showToast } = useStore();
  const [filterType, setFilterType] = useState<string>('all');

  const filteredAlerts = useMemo(() => {
    if (filterType === 'all') return alerts;
    return alerts.filter((a) => a.type === filterType);
  }, [alerts, filterType]);

  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;
  const warningCount = alerts.filter((a) => a.severity === 'warning').length;

  const handleApplyDiscount = (alert: SmartAlert) => {
    showToast(`Created 20% promotional clearance banner for ${alert.productName}!`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header and Smart Engine Banner */}
      <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase bg-emerald-100 text-emerald-800">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              Automated Inventory Intelligence
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900">Smart Inventory Alerts & Recommendations</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Algorithmic monitoring of safety stock reorder thresholds, shelf expiration, and stockout prevention.
          </p>
        </div>

        {/* Severity counts */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold text-rose-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-600" />
            <span>{criticalCount} Critical</span>
          </div>
          <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-xs font-semibold text-amber-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-600" />
            <span>{warningCount} Warnings</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-xs text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 font-medium">Alert Type:</span>
          <div className="flex flex-wrap gap-1">
            {[
              { id: 'all', label: `All Alerts (${alerts.length})` },
              { id: 'out_of_stock', label: 'Out of Stock' },
              { id: 'low_stock', label: 'Low Stock' },
              { id: 'expiring_soon', label: 'Expiring Soon' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  filterType === tab.id
                    ? 'bg-slate-900 text-white font-medium shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <span className="text-slate-400 font-mono text-[11px]">
          Evaluated against {products.length} catalog products
        </span>
      </div>

      {/* Alerts Cards List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">All Stock Levels Optimal</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No products require reordering or shelf action under the selected filter.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const product = products.find((p) => p.id === alert.productId);

            return (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border transition-all ${
                  alert.severity === 'critical'
                    ? 'bg-rose-50/40 border-rose-200/80'
                    : 'bg-amber-50/40 border-amber-200/80'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  {/* Left: Product & Message */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <SeverityBadge severity={alert.severity} />
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {alert.type.replace('_', ' ')}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">
                        {alert.productName}
                      </h4>
                      <span className="font-mono text-xs text-slate-400">({alert.sku})</span>
                    </div>

                    <p className="text-xs text-slate-700 font-medium">{alert.message}</p>

                    {/* Recommendation Box */}
                    <div className="p-3 bg-white rounded-lg border border-slate-200/80 shadow-2xs space-y-1 mt-2 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-900 font-semibold">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Recommended Store Action:</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">{alert.recommendation}</p>

                      {product && (
                        <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1 border-t border-slate-100 font-mono">
                          <span>Current Stock: <strong>{product.quantity} pcs</strong></span>
                          <span>Reorder Threshold: <strong>{product.minStockLevel} pcs</strong></span>
                          <span>Supplier: <strong>{product.supplier}</strong></span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Action Buttons */}
                  <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 pt-2 sm:pt-0">
                    {alert.suggestedAction === 'reorder' && (
                      <button
                        onClick={() =>
                          setStockModalConfig({
                            isOpen: true,
                            type: 'stock_in',
                            productId: alert.productId,
                            defaultQuantity: alert.suggestedQuantity || (product ? Math.max(10, product.minStockLevel * 2 - product.quantity) : 10),
                          })
                        }
                        className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs flex items-center gap-1.5 whitespace-nowrap"
                      >
                        <ArrowDownLeft className="w-3.5 h-3.5" />
                        <span>
                          Restock ({alert.suggestedQuantity || product?.minStockLevel || 10} Units)
                        </span>
                      </button>
                    )}

                    {alert.suggestedAction === 'discount' && (
                      <button
                        onClick={() => handleApplyDiscount(alert)}
                        className="px-4 py-2 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
                      >
                        <Tag className="w-3.5 h-3.5" />
                        <span>Apply Clearance Promo</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
