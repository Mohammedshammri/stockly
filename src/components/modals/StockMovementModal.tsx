import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useStore } from '../../context/StoreContext';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';

export const StockMovementModal: React.FC = () => {
  const { stockModalConfig, setStockModalConfig, products, recordStockIn, recordStockOut } = useStore();
  const { isOpen, type, productId, defaultQuantity } = stockModalConfig;

  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<number | ''>(5);
  const [reason, setReason] = useState<string>('');
  const [unitCost, setUnitCost] = useState<number | ''>('');
  const [operator, setOperator] = useState<string>('Inventory Manager');
  const [error, setError] = useState<string>('');

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  useEffect(() => {
    if (isOpen) {
      const initialId = productId || (products.length > 0 ? products[0].id : '');
      setSelectedProductId(initialId);
      const prod = products.find((p) => p.id === initialId);

      if (type === 'stock_in') {
        setReason(`Restock shipment PO-${Math.floor(1000 + Math.random() * 9000)}`);
        setUnitCost(prod ? prod.purchasePrice : '');
      } else {
        setReason('Damaged in transit / Showroom write-off');
        setUnitCost('');
      }
      setQuantity(defaultQuantity && defaultQuantity > 0 ? defaultQuantity : 5);
      setError('');
    }
  }, [isOpen, productId, type, defaultQuantity]);

  if (!isOpen) return null;

  const handleClose = () => {
    setStockModalConfig((prev) => ({ ...prev, isOpen: false }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) {
      setError('Please select a product');
      return;
    }
    if (typeof quantity !== 'number' || quantity <= 0) {
      setError('Please enter a valid quantity greater than 0');
      return;
    }

    if (type === 'stock_out' && selectedProduct && quantity > selectedProduct.quantity) {
      setError(`Cannot deduct ${quantity} units. Available stock is only ${selectedProduct.quantity}.`);
      return;
    }

    if (type === 'stock_in') {
      recordStockIn(
        selectedProductId,
        quantity,
        reason || 'Stock intake',
        typeof unitCost === 'number' ? unitCost : undefined,
        operator
      );
    } else {
      recordStockOut(
        selectedProductId,
        quantity,
        reason || 'Stock adjustment',
        operator
      );
    }

    handleClose();
  };

  const isStockIn = type === 'stock_in';

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isStockIn ? 'Stock-In Operation (Receive Goods)' : 'Stock-Out Operation (Reduce Inventory)'}
      subtitle={
        isStockIn
          ? 'Record new units received into the warehouse or store'
          : 'Log inventory reduction due to damage, shrinkage, sample, or return'
      }
      maxWidth="lg"
    >
      {products.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-500 space-y-3">
          <p className="font-semibold text-slate-800">No products available in catalog</p>
          <p className="text-slate-500">Please add products to your catalog before recording stock movements.</p>
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
          >
            Close
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target Product <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => {
                setSelectedProductId(e.target.value);
                const prod = products.find((p) => p.id === e.target.value);
                if (prod && isStockIn) setUnitCost(prod.purchasePrice);
              }}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku}) — Current Stock: {p.quantity} pcs
                </option>
              ))}
            </select>
          </div>

        {/* Current status preview banner */}
        {selectedProduct && (
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500 block">Current Available:</span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                {selectedProduct.quantity} units
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block">New Projected Stock:</span>
              <span
                className={`font-mono font-bold text-sm ${
                  isStockIn
                    ? 'text-emerald-700'
                    : (selectedProduct.quantity - (typeof quantity === 'number' ? quantity : 0) < 0
                        ? 'text-rose-600'
                        : 'text-slate-900')
                }`}
              >
                {isStockIn
                  ? selectedProduct.quantity + (typeof quantity === 'number' ? quantity : 0)
                  : Math.max(0, selectedProduct.quantity - (typeof quantity === 'number' ? quantity : 0))}{' '}
                units
              </span>
            </div>
          </div>
        )}

        {/* Quantity */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Quantity to {isStockIn ? 'Add' : 'Deduct'} <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              min="1"
              max={!isStockIn && selectedProduct ? selectedProduct.quantity : undefined}
              value={quantity}
              onChange={(e) =>
                setQuantity(e.target.value === '' ? '' : parseInt(e.target.value, 10))
              }
              placeholder="e.g. 10"
              className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Unit Cost (Stock In) or Reason options (Stock Out) */}
        {isStockIn ? (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Supplier Unit Cost ($)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-sm text-slate-400">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={unitCost}
                onChange={(e) =>
                  setUnitCost(e.target.value === '' ? '' : parseFloat(e.target.value))
                }
                placeholder="0.00"
                className="w-full pl-7 pr-3 py-2 text-sm font-mono rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>
        ) : null}

        {/* Reason / Reference */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Reason / Document Reference <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={isStockIn ? 'e.g. Purchase order PO-8839' : 'e.g. Damaged display model'}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        {/* Performed by */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Operator / Staff Member
          </label>
          <input
            type="text"
            value={operator}
            onChange={(e) => setOperator(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        {error && (
          <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {error}
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`px-5 py-2 text-sm font-semibold text-white rounded-lg transition-colors shadow-xs flex items-center gap-1.5 ${
              isStockIn ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-amber-600 hover:bg-amber-700'
            }`}
          >
            {isStockIn ? (
              <>
                <ArrowDownLeft className="w-4 h-4" /> Confirm Stock-In
              </>
            ) : (
              <>
                <ArrowUpRight className="w-4 h-4" /> Confirm Stock-Out
              </>
            )}
          </button>
        </div>
      </form>
      )}
    </Modal>
  );
};
