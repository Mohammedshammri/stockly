import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { MovementBadge, StatusBadge } from '../components/common/Badge';
import { MovementType, StockStatus, Product } from '../types';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Filter,
  History,
  AlertTriangle,
  Package,
  Layers,
} from 'lucide-react';

export const InventoryPage: React.FC = () => {
  const {
    products,
    movements,
    setStockModalConfig,
    lowStockCount,
    outOfStockCount,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [movementFilter, setMovementFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'movements' | 'stockLevels'>('stockLevels');

  // Filtered movements
  const filteredMovements = useMemo(() => {
    return movements.filter((m) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        m.productName.toLowerCase().includes(q) ||
        m.sku.toLowerCase().includes(q) ||
        m.reason.toLowerCase().includes(q) ||
        m.performedBy.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (movementFilter !== 'all' && m.type !== movementFilter) {
        return false;
      }

      return true;
    });
  }, [movements, searchQuery, movementFilter]);

  // Stock items with urgency
  const urgentItems = useMemo(() => {
    return products.filter((p) => p.quantity <= p.minStockLevel);
  }, [products]);

  const getStockStatus = (p: Product): StockStatus => {
    if (p.quantity === 0) return 'out_of_stock';
    if (p.quantity <= p.minStockLevel) return 'low_stock';
    return 'in_stock';
  };

  return (
    <div className="space-y-6">
      {/* Top Controls & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Inventory Operations & Ledger</h3>
          <p className="text-xs text-slate-500">
            Log shipments intake, handle damage adjustments, and inspect real-time audit trails.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Stock In Button */}
          <button
            onClick={() => setStockModalConfig({ isOpen: true, type: 'stock_in' })}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs flex items-center gap-1.5 whitespace-nowrap"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Stock-In (Receive)</span>
          </button>

          {/* Stock Out Button */}
          <button
            onClick={() => setStockModalConfig({ isOpen: true, type: 'stock_out' })}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <ArrowUpRight className="w-4 h-4 text-amber-600" />
            <span>Stock-Out (Adjust)</span>
          </button>
        </div>
      </div>

      {/* Stock Health Quick Metric Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs text-slate-500 font-medium uppercase">Optimal Stock</span>
            <div className="text-xl font-bold text-slate-900 font-mono">
              {products.filter((p) => p.quantity > p.minStockLevel).length} items
            </div>
            <span className="text-[11px] text-emerald-700">Healthy buffer levels</span>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs text-slate-500 font-medium uppercase">Low Stock Alerts</span>
            <div className="text-xl font-bold text-amber-700 font-mono">
              {lowStockCount} items
            </div>
            <span className="text-[11px] text-amber-800">Below safety threshold</span>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-50 text-amber-700">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs text-slate-500 font-medium uppercase">Out of Stock</span>
            <div className="text-xl font-bold text-rose-600 font-mono">
              {outOfStockCount} items
            </div>
            <span className="text-[11px] text-rose-700">Zero inventory remaining</span>
          </div>
          <div className="p-2.5 rounded-lg bg-rose-50 text-rose-700">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Segmented View Switcher */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('stockLevels')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'stockLevels'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Stock Levels & Thresholds ({products.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'movements'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Movement Audit History ({movements.length})</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Current Stock Levels & Thresholds Table */}
      {activeTab === 'stockLevels' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Item & SKU</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3 text-center">Current Quantity</th>
                    <th className="py-3 px-3 text-center">Safety Reorder Point</th>
                    <th className="py-3 px-3">Stock Health Status</th>
                    <th className="py-3 px-3 text-right">Wholesale Value</th>
                    <th className="py-3 px-4 text-right">Quick Restock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((p) => {
                    const status = getStockStatus(p);
                    const isUrgent = p.quantity <= p.minStockLevel;

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-900 block">{p.name}</span>
                          <span className="font-mono text-[10px] text-slate-400">{p.sku}</span>
                        </td>
                        <td className="py-3 px-3 text-slate-600 whitespace-nowrap">{p.category}</td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-sm">
                          <span
                            className={
                              p.quantity === 0
                                ? 'text-rose-600'
                                : isUrgent
                                ? 'text-amber-700'
                                : 'text-slate-900'
                            }
                          >
                            {p.quantity} units
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-slate-500">
                          {p.minStockLevel} units
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <StatusBadge status={status} />
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-semibold text-slate-900">
                          ${(p.quantity * p.purchasePrice).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() =>
                              setStockModalConfig({
                                isOpen: true,
                                type: 'stock_in',
                                productId: p.id,
                              })
                            }
                            className={`px-2.5 py-1 text-[11px] font-semibold rounded-md border transition-colors inline-flex items-center gap-1 ${
                              isUrgent
                                ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                                : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                            }`}
                          >
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                            <span>Receive Stock</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Movement Audit History */}
      {activeTab === 'movements' && (
        <div className="space-y-4">
          {/* Movement search & filter */}
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search audit trail by item, SKU, reason, or staff..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500">Movement Type:</span>
              <select
                value={movementFilter}
                onChange={(e) => setMovementFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs focus:outline-hidden"
              >
                <option value="all">All Movements ({movements.length})</option>
                <option value="stock_in">Stock In (Receipts)</option>
                <option value="stock_out">Stock Out (Adjustments)</option>
                <option value="sale">Sales (POS Checkouts)</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-3">Product Name</th>
                    <th className="py-3 px-3">Movement</th>
                    <th className="py-3 px-3 text-center">Change</th>
                    <th className="py-3 px-3 text-center">Before → After</th>
                    <th className="py-3 px-3">Reason / Reference</th>
                    <th className="py-3 px-4 text-right">Staff</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMovements.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        <div className="max-w-xs mx-auto space-y-2">
                          <p className="font-semibold text-slate-800">No movement records found</p>
                          <p className="text-xs text-slate-500">
                            {movements.length === 0
                              ? 'No stock movements recorded yet. Receive stock or log a sale to begin.'
                              : 'Try adjusting your search query or movement type filter.'}
                          </p>
                          {movements.length > 0 && (
                            <button
                              onClick={() => {
                                setSearchQuery('');
                                setMovementFilter('all');
                              }}
                              className="mt-2 px-3 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors"
                            >
                              Clear Search
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredMovements.map((mov) => {
                      const isPositive = mov.quantityChange > 0;
                      const dateFormatted = new Date(mov.timestamp).toLocaleString('en-US', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      });

                      return (
                        <tr key={mov.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                            {dateFormatted}
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-semibold text-slate-900 block truncate max-w-[200px]">
                              {mov.productName}
                            </span>
                            <span className="font-mono text-[10px] text-slate-400">{mov.sku}</span>
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <MovementBadge type={mov.type} />
                          </td>
                          <td className="py-3 px-3 text-center font-mono font-bold text-sm whitespace-nowrap">
                            <span className={isPositive ? 'text-emerald-700' : 'text-rose-600'}>
                              {isPositive ? `+${mov.quantityChange}` : mov.quantityChange}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center font-mono text-slate-600 whitespace-nowrap">
                            {mov.previousQuantity} → <strong className="text-slate-900">{mov.newQuantity}</strong>
                          </td>
                          <td className="py-3 px-3 text-slate-600">
                            <span>{mov.reason}</span>
                            {mov.referenceId && (
                              <span className="font-mono text-[10px] text-slate-400 block">
                                Ref: {mov.referenceId}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right font-medium text-slate-700 whitespace-nowrap">
                            {mov.performedBy}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
