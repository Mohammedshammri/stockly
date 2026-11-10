import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { PaymentMethod, SaleTransaction } from '../types';
import {
  ShoppingCart,
  Search,
  Printer,
  FileText,
  DollarSign,
  TrendingUp,
  Receipt as ReceiptIcon,
  Filter,
} from 'lucide-react';

export const SalesPage: React.FC = () => {
  const {
    sales,
    totalSalesRevenue,
    totalGrossProfit,
    grossMarginPercent,
    setIsNewSaleModalOpen,
    setReceiptModalData,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | '7d' | '30d'>('all');

  // Filtered sales
  const filteredSales = useMemo(() => {
    const now = new Date();

    return sales.filter((s) => {
      // Search
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        s.customerName.toLowerCase().includes(q) ||
        s.receiptNumber.toLowerCase().includes(q) ||
        (s.customerEmail && s.customerEmail.toLowerCase().includes(q)) ||
        s.items.some((i) => i.productName.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      // Payment filter
      if (paymentFilter !== 'all' && s.paymentMethod !== paymentFilter) {
        return false;
      }

      // Time filter
      if (timeFilter !== 'all') {
        const saleDate = new Date(s.timestamp);
        const diffMs = now.getTime() - saleDate.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        if (timeFilter === 'today' && diffDays > 1) return false;
        if (timeFilter === '7d' && diffDays > 7) return false;
        if (timeFilter === '30d' && diffDays > 30) return false;
      }

      return true;
    });
  }, [sales, searchQuery, paymentFilter, timeFilter]);

  const filteredRevenue = useMemo(
    () => filteredSales.reduce((sum, s) => sum + s.totalAmount, 0),
    [filteredSales]
  );

  const filteredProfit = useMemo(
    () => filteredSales.reduce((sum, s) => sum + s.profit, 0),
    [filteredSales]
  );

  const averageOrderValue = useMemo(() => {
    return filteredSales.length > 0 ? filteredRevenue / filteredSales.length : 0;
  }, [filteredSales, filteredRevenue]);

  return (
    <div className="space-y-6">
      {/* Top Controls Bar with POS Launcher */}
      <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Point of Sale & Transactions</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Process new customer checkouts, print invoice receipts, and track realtime gross margins.
          </p>
        </div>

        <button
          onClick={() => setIsNewSaleModalOpen(true)}
          className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs flex items-center gap-2 self-start md:self-auto whitespace-nowrap"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Record New Sale (POS)</span>
        </button>
      </div>

      {/* KPI Financial Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block">
            Total Sales Count
          </span>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1">
            {filteredSales.length}
          </div>
          <span className="text-[11px] text-slate-400">Recorded transactions</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block">
            Sales Revenue
          </span>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1">
            ${filteredRevenue.toFixed(2)}
          </div>
          <span className="text-[11px] text-emerald-700 font-medium">Customer payments</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block">
            Net Gross Profit
          </span>
          <div className="text-2xl font-bold text-emerald-700 font-mono mt-1">
            +${filteredProfit.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-500">
            {filteredRevenue > 0 ? ((filteredProfit / filteredRevenue) * 100).toFixed(1) : '0'}% margin
          </span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block">
            Average Basket Size
          </span>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1">
            ${averageOrderValue.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-400">Per customer order</span>
        </div>
      </div>

      {/* Filters and Search Strip */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer, receipt number, or item purchased..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Time range */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Period:</span>
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value as any)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-hidden"
              >
                <option value="all">All Time</option>
                <option value="today">Today Only</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
            </div>

            {/* Payment Method filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Payment:</span>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-hidden"
              >
                <option value="all">All Methods</option>
                <option value="credit_card">Credit / Debit Card</option>
                <option value="cash">Cash</option>
                <option value="mobile_pay">Mobile Pay</option>
                <option value="bank_transfer">Bank Wire</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-4">Receipt #</th>
                <th className="py-3 px-3">Date & Time</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Items Purchased</th>
                <th className="py-3 px-3">Payment</th>
                <th className="py-3 px-3 text-right">Subtotal</th>
                <th className="py-3 px-3 text-right">Tax</th>
                <th className="py-3 px-3 text-right">Total Paid</th>
                <th className="py-3 px-3 text-right">Profit Margin</th>
                <th className="py-3 px-4 text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500">
                    <div className="max-w-xs mx-auto space-y-2">
                      <p className="font-semibold text-slate-800">No transactions found</p>
                      <p className="text-xs text-slate-500">
                        {sales.length === 0
                          ? 'No sales recorded yet. Start by checking out a customer.'
                          : 'Try clearing your search query or period filters.'}
                      </p>
                      {sales.length > 0 ? (
                        <button
                          onClick={() => {
                            setSearchQuery('');
                            setTimeFilter('all');
                            setPaymentFilter('all');
                          }}
                          className="mt-2 px-3 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors"
                        >
                          Clear Filters
                        </button>
                      ) : (
                        <button
                          onClick={() => setIsNewSaleModalOpen(true)}
                          className="mt-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors"
                        >
                          + Record First Sale
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => {
                  const saleDate = new Date(sale.timestamp).toLocaleString('en-US', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  });

                  return (
                    <tr
                      key={sale.id}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                      onClick={() => setReceiptModalData(sale)}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {sale.receiptNumber}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500 whitespace-nowrap">
                        {saleDate}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-900 block truncate max-w-[140px]">
                          {sale.customerName}
                        </span>
                        {sale.customerEmail && (
                          <span className="text-[10px] text-slate-400 truncate block max-w-[140px]">
                            {sale.customerEmail}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 max-w-[220px]">
                        <span className="font-medium text-slate-800 line-clamp-1">
                          {sale.items.map((i) => `${i.quantity}× ${i.productName}`).join(', ')}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {sale.items.reduce((acc, i) => acc + i.quantity, 0)} total units
                        </span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-slate-100 text-slate-700">
                          {sale.paymentMethod.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-500">
                        ${sale.subtotal.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-400 text-[11px]">
                        ${sale.tax.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 text-sm">
                        ${sale.totalAmount.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono">
                        <span className="font-bold text-emerald-700">
                          +${sale.profit.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {sale.subtotal > 0 ? ((sale.profit / sale.subtotal) * 100).toFixed(1) : '0'}%
                        </span>
                      </td>
                      <td
                        className="py-3 px-4 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => setReceiptModalData(sale)}
                          className="px-2.5 py-1 text-slate-700 hover:text-emerald-700 hover:bg-slate-100 rounded text-xs font-medium border border-slate-200 transition-colors inline-flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
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
  );
};
