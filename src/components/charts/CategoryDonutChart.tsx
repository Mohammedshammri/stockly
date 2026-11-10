import React, { useState, useMemo } from 'react';
import { Product } from '../../types';

interface CategoryDonutChartProps {
  products: Product[];
}

const CATEGORY_COLORS = [
  '#059669', // Emerald
  '#0284c7', // Sky
  '#6366f1', // Indigo
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#8b5cf6', // Violet
];

export const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({ products }) => {
  const [hoveredCat, setHoveredCat] = useState<string | null>(null);

  // Group inventory value and unit counts by category
  const categoryStats = useMemo(() => {
    const map = new Map<string, { category: string; value: number; units: number; count: number }>();

    products.forEach((p) => {
      const existing = map.get(p.category) || {
        category: p.category,
        value: 0,
        units: 0,
        count: 0,
      };
      existing.value += p.quantity * p.purchasePrice;
      existing.units += p.quantity;
      existing.count += 1;
      map.set(p.category, existing);
    });

    const list = Array.from(map.values()).sort((a, b) => b.value - a.value);
    const totalVal = list.reduce((sum, item) => sum + item.value, 0) || 1;

    return list.map((item, index) => ({
      ...item,
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      percentage: (item.value / totalVal) * 100,
    }));
  }, [products]);

  const totalInventoryValue = useMemo(
    () => categoryStats.reduce((sum, item) => sum + item.value, 0),
    [categoryStats]
  );

  // Calculate SVG arc paths
  const radius = 64;
  const strokeWidth = 24;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

  const slices = categoryStats.map((item) => {
    const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
    accumulatedPercent += item.percentage;

    return {
      ...item,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  const activeItem = categoryStats.find((c) => c.category === hoveredCat) || categoryStats[0];

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Inventory by Category</h3>
            <p className="text-xs text-slate-500">Valuation and stock share breakdown</p>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {categoryStats.length} Categories
          </span>
        </div>

        {/* Donut Graphic & Center stats */}
        <div className="flex flex-col sm:flex-row items-center justify-around gap-6 my-2">
          <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90 transform">
              {/* Background circle */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke="#f1f5f9"
                strokeWidth={strokeWidth}
              />
              {slices.map((slice) => {
                const isHovered = hoveredCat === slice.category;
                return (
                  <circle
                    key={slice.category}
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="none"
                    stroke={slice.color}
                    strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                    strokeDasharray={slice.strokeDasharray}
                    strokeDashoffset={slice.strokeDashoffset}
                    className="transition-all duration-200 cursor-pointer"
                    onMouseEnter={() => setHoveredCat(slice.category)}
                    onMouseLeave={() => setHoveredCat(null)}
                  />
                );
              })}
            </svg>

            {/* Inner Center Label */}
            <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none px-2">
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                {activeItem?.category ? activeItem.category.split(' ')[0] : 'Total'}
              </span>
              <span className="text-base font-bold text-slate-900 font-mono tabular-nums">
                ${(activeItem?.value || totalInventoryValue).toLocaleString('en-US', {
                  maximumFractionDigits: 0,
                })}
              </span>
              <span className="text-[10px] text-emerald-700 font-mono font-medium">
                {activeItem?.percentage.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Category List */}
          <div className="w-full sm:w-auto flex-1 space-y-2 text-xs">
            {categoryStats.map((cat) => {
              const isSelected = hoveredCat === cat.category;
              return (
                <div
                  key={cat.category}
                  onMouseEnter={() => setHoveredCat(cat.category)}
                  onMouseLeave={() => setHoveredCat(null)}
                  className={`flex items-center justify-between p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isSelected ? 'bg-slate-100 font-medium' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-xs shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-slate-800 truncate">{cat.category}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono tabular-nums shrink-0 ml-2">
                    <span className="text-slate-500">{cat.units} pcs</span>
                    <span className="text-slate-900 font-medium">
                      ${cat.value.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Total Cost Basis:</span>
        <span className="font-mono font-semibold text-slate-900">
          ${totalInventoryValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  );
};
