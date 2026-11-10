import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { SalesRevenueChart } from '../components/charts/SalesRevenueChart';
import { CategoryDonutChart } from '../components/charts/CategoryDonutChart';
import { TopProductsBarChart } from '../components/charts/TopProductsBarChart';
import { CATEGORIES_LIST } from '../data/demoData';
import {
  Download,
  Calendar,
  Filter,
  DollarSign,
  TrendingUp,
  Percent,
  Package,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const {
    products,
    sales,
    totalSalesRevenue,
    totalGrossProfit,
    grossMarginPercent,
    totalInventoryCost,
    totalInventoryRetail,
    showToast,
  } = useStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [reportPeriod, setReportPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  // Filter sales according to period & category
  const filteredSales = useMemo(() => {
    const now = new Date();
    return sales.filter((s) => {
      // Period
      if (reportPeriod !== 'all') {
        const days = reportPeriod === '7d' ? 7 : reportPeriod === '30d' ? 30 : 90;
        const diffMs = now.getTime() - new Date(s.timestamp).getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        if (diffDays > days) return false;
      }

      // Category
      if (selectedCategory !== 'all') {
        const hasCat = s.items.some((i) => {
          const p = products.find((prod) => prod.id === i.productId);
          return p && p.category === selectedCategory;
        });
        if (!hasCat) return false;
      }

      return true;
    });
  }, [sales, reportPeriod, selectedCategory, products]);

  const periodRevenue = useMemo(
    () => filteredSales.reduce((sum, s) => sum + s.totalAmount, 0),
    [filteredSales]
  );
  const periodProfit = useMemo(
    () => filteredSales.reduce((sum, s) => sum + s.profit, 0),
    [filteredSales]
  );
  const periodMargin = periodRevenue > 0 ? (periodProfit / periodRevenue) * 100 : 0;

  // Category breakdown table
  const categoryBreakdown = useMemo(() => {
    const map = new Map<
      string,
      { category: string; revenue: number; unitsSold: number; profit: number; stockValue: number }
    >();

    CATEGORIES_LIST.forEach((cat) => {
      map.set(cat, { category: cat, revenue: 0, unitsSold: 0, profit: 0, stockValue: 0 });
    });

    // Stock value
    products.forEach((p) => {
      const entry = map.get(p.category);
      if (entry) {
        entry.stockValue += p.quantity * p.purchasePrice;
      }
    });

    // Sales in filtered set
    filteredSales.forEach((s) => {
      s.items.forEach((item) => {
        const p = products.find((prod) => prod.id === item.productId);
        if (p) {
          const entry = map.get(p.category);
          if (entry) {
            entry.revenue += item.subtotal;
            entry.unitsSold += item.quantity;
            entry.profit += (item.unitPrice - item.purchasePrice) * item.quantity;
          }
        }
      });
    });

    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
  }, [filteredSales, products]);

  // Export report as CSV
  const handleExportCSV = () => {
    if (filteredSales.length === 0) {
      showToast('No sales transactions in the selected period to export.', 'info');
      return;
    }

    const headers = [
      'Transaction ID',
      'Receipt Number',
      'Date',
      'Customer',
      'Items Count',
      'Payment Method',
      'Subtotal',
      'Tax',
      'Total Amount',
      'Gross Profit',
    ];

    const rows = filteredSales.map((s) => [
      s.id,
      s.receiptNumber,
      s.timestamp,
      `"${s.customerName.replace(/"/g, '""')}"`,
      s.items.reduce((acc, i) => acc + i.quantity, 0),
      s.paymentMethod,
      s.subtotal.toFixed(2),
      s.tax.toFixed(2),
      s.totalAmount.toFixed(2),
      s.profit.toFixed(2),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Stockly_Sales_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast('Exported CSV Sales Report successfully', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Export Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Analytics & Financial Intelligence</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluate profitability, revenue by category, and inventory turnover efficiency.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Period selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500">Period:</span>
            <select
              value={reportPeriod}
              onChange={(e) => setReportPeriod(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-hidden font-medium"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>

          {/* Category selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-hidden"
            >
              <option value="all">All Categories</option>
              {CATEGORIES_LIST.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Financial KPI Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Period Revenue
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-2">
            ${periodRevenue.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-500">From {filteredSales.length} transactions</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Gross Profit
            </span>
            <div className="p-2 bg-sky-50 text-sky-700 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-700 font-mono mt-2">
            +${periodProfit.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-500">Realized trading margin</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Profit Margin %
            </span>
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-indigo-900 font-mono mt-2">
            {periodMargin.toFixed(1)}%
          </div>
          <span className="text-[11px] text-slate-500">Gross margin efficiency</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Total Stock Capital
            </span>
            <div className="p-2 bg-amber-50 text-amber-700 rounded-lg">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-2">
            ${totalInventoryCost.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-500">
            Retail potential: ${totalInventoryRetail.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesRevenueChart sales={sales} />
        </div>
        <div>
          <CategoryDonutChart products={products} />
        </div>
      </div>

      {/* Category Performance Breakdown Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-slate-900">Category Performance Summary</h4>
            <p className="text-xs text-slate-500">Sales velocity and inventory investment across categories</p>
          </div>
          <span className="text-xs text-slate-500">{CATEGORIES_LIST.length} categories</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-4">Product Category</th>
                <th className="py-3 px-3 text-right">Units Sold</th>
                <th className="py-3 px-3 text-right">Sales Revenue</th>
                <th className="py-3 px-3 text-right">Gross Profit</th>
                <th className="py-3 px-3 text-right">Margin %</th>
                <th className="py-3 px-4 text-right">Warehoused Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categoryBreakdown.map((cat) => {
                const margin = cat.revenue > 0 ? (cat.profit / cat.revenue) * 100 : 0;
                return (
                  <tr key={cat.category} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">{cat.category}</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-600">
                      {cat.unitsSold} pcs
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      ${cat.revenue.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-semibold text-emerald-700">
                      +${cat.profit.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-700">
                      {margin.toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">
                      ${cat.stockValue.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
