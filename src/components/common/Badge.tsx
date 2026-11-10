import React from 'react';
import { StockStatus, MovementType, AlertSeverity } from '../../types';

interface StatusBadgeProps {
  status: StockStatus;
  quantity?: number;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, quantity }) => {
  switch (status) {
    case 'in_stock':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-800 bg-emerald-50 rounded-md border border-emerald-200/60">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" aria-hidden="true" />
          <span>In Stock {quantity !== undefined && `(${quantity})`}</span>
        </span>
      );
    case 'low_stock':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-amber-800 bg-amber-50 rounded-md border border-amber-200/60">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600" aria-hidden="true" />
          <span>Low Stock {quantity !== undefined && `(${quantity})`}</span>
        </span>
      );
    case 'out_of_stock':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-rose-800 bg-rose-50 rounded-md border border-rose-200/60">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600" aria-hidden="true" />
          <span>Out of Stock</span>
        </span>
      );
    default:
      return null;
  }
};

interface MovementBadgeProps {
  type: MovementType;
}

export const MovementBadge: React.FC<MovementBadgeProps> = ({ type }) => {
  switch (type) {
    case 'stock_in':
      return (
        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-emerald-800 bg-emerald-50 rounded border border-emerald-200">
          Stock In
        </span>
      );
    case 'stock_out':
      return (
        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-amber-800 bg-amber-50 rounded border border-amber-200">
          Stock Out
        </span>
      );
    case 'sale':
      return (
        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-blue-800 bg-blue-50 rounded border border-blue-200">
          Sale
        </span>
      );
    case 'adjustment':
      return (
        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-slate-800 bg-slate-100 rounded border border-slate-200">
          Adjustment
        </span>
      );
    case 'return':
      return (
        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-purple-800 bg-purple-50 rounded border border-purple-200">
          Return
        </span>
      );
    default:
      return null;
  }
};

interface SeverityBadgeProps {
  severity: AlertSeverity;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity }) => {
  switch (severity) {
    case 'critical':
      return (
        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-rose-800 bg-rose-50 rounded border border-rose-200">
          Critical
        </span>
      );
    case 'warning':
      return (
        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-amber-800 bg-amber-50 rounded border border-amber-200">
          Warning
        </span>
      );
    case 'info':
      return (
        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-slate-700 bg-slate-100 rounded border border-slate-200">
          Notice
        </span>
      );
    default:
      return null;
  }
};
