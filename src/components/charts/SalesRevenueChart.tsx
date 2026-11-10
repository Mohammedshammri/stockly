import React, { useState, useMemo } from 'react';
import { SaleTransaction } from '../../types';

interface SalesRevenueChartProps {
  sales: SaleTransaction[];
}

export const SalesRevenueChart: React.FC<SalesRevenueChartProps> = ({ sales }) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Group sales by day
  const chartData = useMemo(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const now = new Date();
    const result: { dateStr: string; label: string; revenue: number; profit: number; count: number }[] = [];

    const getLocalYMD = (date: Date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const targetDay = getLocalYMD(d);
      const shortLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      // Aggregate sales for this day
      const daySales = sales.filter((s) => {
        const sDate = new Date(s.timestamp);
        return getLocalYMD(sDate) === targetDay;
      });
      const revenue = daySales.reduce((sum, s) => sum + s.totalAmount, 0);
      const profit = daySales.reduce((sum, s) => sum + s.profit, 0);
      const count = daySales.length;

      result.push({
        dateStr: targetDay,
        label: shortLabel,
        revenue,
        profit,
        count,
      });
    }

    return result;
  }, [sales, timeRange]);

  const maxRevenue = useMemo(() => {
    const max = Math.max(...chartData.map((d) => d.revenue), 100);
    return Math.ceil(max / 50) * 50; // nice round ceiling
  }, [chartData]);

  const totalPeriodRevenue = useMemo(
    () => chartData.reduce((sum, d) => sum + d.revenue, 0),
    [chartData]
  );
  const totalPeriodProfit = useMemo(
    () => chartData.reduce((sum, d) => sum + d.profit, 0),
    [chartData]
  );

  // SVG coordinate calculations
  const width = 640;
  const height = 220;
  const padding = { top: 20, right: 20, bottom: 30, left: 45 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const points = chartData.map((d, i) => {
    const x = padding.left + (i / (chartData.length - 1 || 1)) * innerWidth;
    const y = padding.top + innerHeight - (d.revenue / (maxRevenue || 1)) * innerHeight;
    const yProfit = padding.top + innerHeight - (d.profit / (maxRevenue || 1)) * innerHeight;
    return { x, y, yProfit, ...d };
  });

  const linePath = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${padding.top + innerHeight} L ${points[0].x} ${padding.top + innerHeight} Z`
    : '';

  const profitLinePath = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.yProfit}` : `${acc} L ${p.x} ${p.yProfit}`;
  }, '');

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Revenue & Profit Trends</h3>
          <p className="text-xs text-slate-500">Daily sales performance and estimated gross margin</p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start sm:self-auto">
          {(['7d', '30d', '90d'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                timeRange === r
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {r === '7d' ? 'Last 7 Days' : r === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4 p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
        <div>
          <span className="text-slate-500 block">Period Revenue</span>
          <span className="text-base font-bold text-slate-900 font-mono tabular-nums">
            ${totalPeriodRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block">Period Profit</span>
          <span className="text-base font-bold text-emerald-700 font-mono tabular-nums">
            ${totalPeriodProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="hidden sm:block">
          <span className="text-slate-500 block">Period Margin</span>
          <span className="text-base font-bold text-slate-800 font-mono tabular-nums">
            {totalPeriodRevenue > 0 ? ((totalPeriodProfit / totalPeriodRevenue) * 100).toFixed(1) : '0.0'}%
          </span>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-48 sm:h-56 select-none overflow-visible"
        >
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = padding.top + innerHeight * (1 - ratio);
            const val = Math.round(maxRevenue * ratio);
            return (
              <g key={ratio}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[10px] fill-slate-400 font-mono tabular-nums"
                >
                  ${val}
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          {areaPath && <path d={areaPath} fill="url(#revenueGradient)" />}

          {/* Revenue line */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="#059669"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Profit dashed line */}
          {profitLinePath && (
            <path
              d={profitLinePath}
              fill="none"
              stroke="#0284c7"
              strokeWidth="1.5"
              strokeDasharray="4 2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data points & hover triggers */}
          {points.map((p, i) => {
            const isHovered = hoveredIndex === i;
            // Only show x labels on some points if many
            const showLabel =
              timeRange === '7d' ||
              (timeRange === '30d' && (i === 0 || i === 7 || i === 14 || i === 21 || i === points.length - 1)) ||
              (timeRange === '90d' && i % 15 === 0);

            return (
              <g key={i}>
                {showLabel && (
                  <text
                    x={p.x}
                    y={height - 8}
                    textAnchor="middle"
                    className="text-[10px] fill-slate-400 font-sans"
                  >
                    {p.label}
                  </text>
                )}

                {/* Vertical hover line */}
                {isHovered && (
                  <line
                    x1={p.x}
                    y1={padding.top}
                    x2={p.x}
                    y2={padding.top + innerHeight}
                    stroke="#94a3b8"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                )}

                {/* Point circle */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 5 : (p.revenue > 0 ? 3 : 1)}
                  fill={isHovered ? '#047857' : '#059669'}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />

                {/* Invisible hover hitbox */}
                <rect
                  x={p.x - 12}
                  y={padding.top}
                  width="24"
                  height={innerHeight}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredIndex !== null && points[hoveredIndex] && (
          <div
            className="absolute top-2 pointer-events-none bg-slate-900 text-white px-3 py-2 rounded-lg text-xs shadow-lg space-y-0.5 z-20"
            style={{
              left: `${Math.min(Math.max(15, (points[hoveredIndex].x / width) * 100), 80)}%`,
            }}
          >
            <div className="font-semibold border-b border-slate-700 pb-1 mb-1 text-slate-200">
              {points[hoveredIndex].label}
            </div>
            <div className="flex justify-between gap-3 text-slate-300">
              <span>Revenue:</span>
              <span className="font-mono font-bold text-emerald-400">
                ${points[hoveredIndex].revenue.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between gap-3 text-slate-300">
              <span>Est. Profit:</span>
              <span className="font-mono font-bold text-sky-400">
                ${points[hoveredIndex].profit.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between gap-3 text-slate-300">
              <span>Transactions:</span>
              <span className="font-mono">{points[hoveredIndex].count}</span>
            </div>
          </div>
        )}
      </div>

      {/* Chart Legend */}
      <div className="flex items-center justify-end gap-5 mt-2 text-xs text-slate-600">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-1 bg-emerald-600 rounded-full inline-block" />
          <span>Total Sales Revenue</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 border-t border-sky-600 border-dashed inline-block" />
          <span>Net Profit</span>
        </div>
      </div>
    </div>
  );
};
