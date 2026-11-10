import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive: boolean;
    label?: string;
  };
  icon: React.ReactNode;
  iconBgColor?: string;
  highlight?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  iconBgColor = 'bg-emerald-50 text-emerald-700',
  highlight = false,
}) => {
  return (
    <div
      className={`p-5 rounded-xl border transition-all duration-150 ${
        highlight
          ? 'bg-gradient-to-br from-white to-emerald-50/40 border-emerald-200 shadow-sm'
          : 'bg-white border-slate-200 shadow-xs hover:border-slate-300'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{title}</p>
          <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
            {value}
          </div>
        </div>
        <div className={`p-2.5 rounded-lg shrink-0 ${iconBgColor}`}>
          {icon}
        </div>
      </div>

      {(trend || subtitle) && (
        <div className="mt-3 flex items-center justify-between text-xs pt-2.5 border-t border-slate-100">
          {trend && (
            <div className="flex items-center gap-1.5">
              <span
                className={`font-semibold font-mono ${
                  trend.isPositive ? 'text-emerald-700' : 'text-rose-600'
                }`}
              >
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </span>
              {trend.label && <span className="text-slate-500">{trend.label}</span>}
            </div>
          )}
          {subtitle && <span className="text-slate-500 truncate">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};
