import React from 'react';
import { useStore } from '../context/StoreContext';
import { MetricCard } from '../components/common/MetricCard';
import { StatusBadge } from '../components/common/Badge';
import { SalesRevenueChart } from '../components/charts/SalesRevenueChart';
import { CategoryDonutChart } from '../components/charts/CategoryDonutChart';
import { TopProductsBarChart } from '../components/charts/TopProductsBarChart';
import { PageId } from '../components/layout/Sidebar';
import {
  Package,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  ShoppingCart,
  Receipt,
  Plus,
  ArrowDownLeft,
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (page: PageId) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const {
    products,
    sales,
    alerts,
    totalProducts,
    totalInventoryCost,
    totalInventoryRetail,
    totalSalesRevenue,
    totalGrossProfit,
    grossMarginPercent,
    lowStockCount,
    outOfStockCount,
    setIsNewSaleModalOpen,
    setIsAddProductModalOpen,
    setStockModalConfig,
    setReceiptModalData,
  } = useStore();

  const recentSales = sales.slice(0, 5);
  const urgentAlerts = alerts.filter((a) => a.severity === 'critical' || a.severity === 'warning').slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Quick Action Banner */}
      <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Live Store Analytics
            </span>
            <span className="text-xs text-slate-400">All data synced & reactive</span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Inventory & Sales Command Center
          </h2>
          <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
            Monitor stock thresholds, record POS checkout transactions, and analyze profit margins in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsNewSaleModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Record New Sale</span>
          </button>
          <button
            onClick={() => setStockModalConfig({ isOpen: true, type: 'stock_in' })}
            className="px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg transition-colors border border-slate-700 flex items-center gap-1.5"
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>Stock In</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Products */}
        <MetricCard
          title="Total Products"
          value={totalProducts}
          subtitle={`${products.reduce((acc, p) => acc + p.quantity, 0)} units total in store`}
          icon={<Package className="w-5 h-5" />}
          iconBgColor="bg-slate-100 text-slate-800"
        />

        {/* Total Inventory Value */}
        <MetricCard
          title="Inventory Valuation"
          value={`$${totalInventoryCost.toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}`}
          subtitle={`Retail Value: $${totalInventoryRetail.toLocaleString('en-US', {
            maximumFractionDigits: 0,
          })}`}
          icon={<DollarSign className="w-5 h-5" />}
          iconBgColor="bg-emerald-50 text-emerald-700"
          highlight={true}
        />

        {/* Total Sales */}
        <MetricCard
          title="Total Revenue"
          value={`$${totalSalesRevenue.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          subtitle={`${sales.length} customer sales`}
          trend={{ value: '14.8%', isPositive: true, label: 'vs last month' }}
          icon={<Receipt className="w-5 h-5" />}
          iconBgColor="bg-sky-50 text-sky-700"
        />

        {/* Net Profit */}
        <MetricCard
          title="Gross Profit"
          value={`$${totalGrossProfit.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          subtitle={`${grossMarginPercent.toFixed(1)}% gross margin`}
          trend={{ value: '9.2%', isPositive: true, label: 'margin rate' }}
          icon={<TrendingUp className="w-5 h-5" />}
          iconBgColor="bg-indigo-50 text-indigo-700"
        />

        {/* Low Stock Warnings */}
        <div
          onClick={() => onNavigate('alerts')}
          className="cursor-pointer"
        >
          <MetricCard
            title="Stock Warnings"
            value={lowStockCount + outOfStockCount}
            subtitle={`${outOfStockCount} out of stock · ${lowStockCount} low`}
            icon={<AlertTriangle className="w-5 h-5" />}
            iconBgColor={
              outOfStockCount > 0 ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
            }
          />
        </div>
      </div>

      {/* Urgent Alerts Strip if any */}
      {urgentAlerts.length > 0 && (
        <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h3 className="text-xs font-semibold text-amber-900">
                Action Required: {alerts.length} Stock Alerts Identified
              </h3>
            </div>
            <button
              onClick={() => onNavigate('alerts')}
              className="text-xs font-semibold text-amber-800 hover:text-amber-950 flex items-center gap-1"
            >
              <span>View All Alerts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            {urgentAlerts.map((alert) => (
              <div
                key={alert.id}
                className="p-3 bg-white rounded-lg border border-amber-200/60 shadow-2xs flex items-center justify-between text-xs"
              >
                <div className="truncate pr-2">
                  <span className="font-semibold text-slate-900 block truncate">
                    {alert.productName}
                  </span>
                  <span className="text-[11px] text-slate-500">{alert.message}</span>
                </div>
                <button
                  onClick={() =>
                    setStockModalConfig({
                      isOpen: true,
                      type: 'stock_in',
                      productId: alert.productId,
                      defaultQuantity: alert.suggestedQuantity || 10,
                    })
                  }
                  className="px-2.5 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors whitespace-nowrap shrink-0"
                >
                  Restock
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesRevenueChart sales={sales} />
        </div>
        <div>
          <CategoryDonutChart products={products} />
        </div>
      </div>

      {/* Bottom Row: Top Products & Recent Sales Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top-selling products ranking */}
        <TopProductsBarChart sales={sales} />

        {/* Recent Sales Ledger */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Recent Sales Activity</h3>
                <p className="text-xs text-slate-500">Latest Point-of-Sale checkouts</p>
              </div>
              <button
                onClick={() => onNavigate('sales')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <span>Full Ledger</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {recentSales.map((sale) => (
                <div
                  key={sale.id}
                  className="py-3 flex items-center justify-between text-xs hover:bg-slate-50/50 px-2 rounded-lg transition-colors"
                >
                  <div className="space-y-0.5 truncate pr-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 truncate">
                        {sale.customerName}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {sale.receiptNumber}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
                      {sale.items.map((i) => `${i.quantity}× ${i.productName}`).join(', ')}
                    </p>
                  </div>

                  <div className="text-right shrink-0 flex items-center gap-3">
                    <div>
                      <div className="font-mono font-bold text-slate-900 text-sm">
                        ${sale.totalAmount.toFixed(2)}
                      </div>
                      <div className="text-[10px] font-mono text-emerald-700 font-medium">
                        +${sale.profit.toFixed(2)} profit
                      </div>
                    </div>
                    <button
                      onClick={() => setReceiptModalData(sale)}
                      className="px-2 py-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded border border-slate-200"
                    >
                      Receipt
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Average Order Value:</span>
            <span className="font-mono font-semibold text-slate-900">
              ${sales.length > 0 ? (totalSalesRevenue / sales.length).toFixed(2) : '0.00'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
