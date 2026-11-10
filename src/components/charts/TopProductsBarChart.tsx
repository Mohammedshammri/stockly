import React, { useMemo } from 'react';
import { SaleTransaction } from '../../types';

interface TopProductsBarChartProps {
  sales: SaleTransaction[];
}

export const TopProductsBarChart: React.FC<TopProductsBarChartProps> = ({ sales }) => {
  const topProducts = useMemo(() => {
    const map = new Map<string, { id: string; name: string; sku: string; unitsSold: number; revenue: number; profit: number }>();

    sales.forEach((s) => {
      s.items.forEach((item) => {
        const existing = map.get(item.productId) || {
          id: item.productId,
          name: item.productName,
          sku: item.sku,
          unitsSold: 0,
          revenue: 0,
          profit: 0,
        };
        existing.unitsSold += item.quantity;
        existing.revenue += item.subtotal;
        existing.profit += (item.unitPrice - item.purchasePrice) * item.quantity;
        map.set(item.productId, existing);
      });
    });

    return Array.from(map.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [sales]);

  const maxRevenue = useMemo(() => {
    return Math.max(...topProducts.map((p) => p.revenue), 1);
  }, [topProducts]);

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Top Performing Products</h3>
          <p className="text-xs text-slate-500">Ranked by total sales revenue generated</p>
        </div>
        <span className="text-xs text-slate-500">Top 5</span>
      </div>

      <div className="space-y-4">
        {topProducts.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">No sales transactions recorded yet.</div>
        ) : (
          topProducts.map((prod, index) => {
            const percentage = (prod.revenue / maxRevenue) * 100;
            return (
              <div key={prod.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate max-w-[65%]">
                    <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 font-mono font-semibold flex items-center justify-center text-[11px] shrink-0">
                      {index + 1}
                    </span>
                    <span className="font-medium text-slate-800 truncate" title={prod.name}>
                      {prod.name}
                    </span>
                    <span className="text-slate-400 font-mono text-[10px] hidden sm:inline">
                      {prod.sku}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 font-mono tabular-nums shrink-0">
                    <span className="text-slate-500">{prod.unitsSold} sold</span>
                    <span className="font-semibold text-slate-900">
                      ${prod.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(percentage, 4)}%` }}
                  />
                </div>

                <div className="flex justify-end text-[10px] text-slate-400 font-mono">
                  <span>Gross Profit: +${prod.profit.toFixed(2)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
