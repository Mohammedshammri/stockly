import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useStore } from '../../context/StoreContext';
import { PaymentMethod } from '../../types';
import { Plus, Trash2, ShoppingCart, AlertCircle } from 'lucide-react';

interface CartLine {
  productId: string;
  quantity: number;
}

export const NewSaleModal: React.FC = () => {
  const {
    isNewSaleModalOpen,
    setIsNewSaleModalOpen,
    products,
    recordSale,
    settings,
  } = useStore();

  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerEmail, setCustomerEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit_card');
  const [cart, setCart] = useState<CartLine[]>([
    { productId: products.find((p) => p.quantity > 0)?.id || '', quantity: 1 },
  ]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!isNewSaleModalOpen) return null;

  const handleClose = () => {
    setIsNewSaleModalOpen(false);
    setError('');
  };

  const handleAddLine = () => {
    const available = products.find((p) => p.quantity > 0 && !cart.some((c) => c.productId === p.id));
    if (available) {
      setCart((prev) => [...prev, { productId: available.id, quantity: 1 }]);
    } else {
      const anyAvailable = products.find((p) => p.quantity > 0);
      if (anyAvailable) {
        setCart((prev) => [...prev, { productId: anyAvailable.id, quantity: 1 }]);
      }
    }
  };

  const handleRemoveLine = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const handleProductChange = (index: number, newProductId: string) => {
    setCart((prev) =>
      prev.map((line, i) => (i === index ? { ...line, productId: newProductId, quantity: 1 } : line))
    );
  };

  const handleQuantityChange = (index: number, newQty: number) => {
    setCart((prev) =>
      prev.map((line, i) => (i === index ? { ...line, quantity: Math.max(1, newQty) } : line))
    );
  };

  // Calculations with cumulative stock check across cart lines
  let subtotal = 0;
  let totalCost = 0;
  let hasStockError = false;
  let stockErrorMessage = '';

  // Aggregate cart item quantities per product to prevent over-allocation
  const cartProductTotals = new Map<string, number>();
  for (const line of cart) {
    if (line.productId) {
      cartProductTotals.set(
        line.productId,
        (cartProductTotals.get(line.productId) || 0) + (line.quantity || 0)
      );
    }
  }

  const detailedItems = cart.map((line) => {
    const prod = products.find((p) => p.id === line.productId);
    if (!prod) return null;

    const totalRequested = cartProductTotals.get(line.productId) || line.quantity;
    const isOverLimit = totalRequested > prod.quantity;
    if (isOverLimit && !hasStockError) {
      hasStockError = true;
      stockErrorMessage = `Total requested (${totalRequested} pcs) for "${prod.name}" exceeds available stock (${prod.quantity} pcs).`;
    }

    const lineTotal = Number((prod.sellingPrice * line.quantity).toFixed(2));
    const lineCost = Number((prod.purchasePrice * line.quantity).toFixed(2));
    subtotal += lineTotal;
    totalCost += lineCost;

    return {
      product: prod,
      quantity: line.quantity,
      lineTotal,
      lineCost,
      isOverLimit,
    };
  });

  subtotal = Number(subtotal.toFixed(2));
  totalCost = Number(totalCost.toFixed(2));
  const taxRate = Math.max(0, Number(settings.taxRate) || 0);
  const tax = Number(((subtotal * taxRate) / 100).toFixed(2));
  const total = Number((subtotal + tax).toFixed(2));
  const estimatedProfit = Number((subtotal - totalCost).toFixed(2));

  const hasInStockProducts = products.some((p) => p.quantity > 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasInStockProducts) {
      setError('Cannot complete sale: no inventory available in catalog.');
      return;
    }
    if (cart.length === 0) {
      setError('Please add at least one product to the sale.');
      return;
    }

    if (hasStockError) {
      setError(stockErrorMessage);
      return;
    }

    const sale = recordSale({
      customerName: customerName.trim() || 'Walk-in Customer',
      customerEmail: customerEmail.trim() || undefined,
      paymentMethod,
      items: cart.map((c) => ({ productId: c.productId, quantity: c.quantity })),
      notes: notes.trim() || undefined,
    });

    if (sale) {
      setIsNewSaleModalOpen(false);
      // Reset form
      setCart([{ productId: products.find((p) => p.quantity > 0)?.id || '', quantity: 1 }]);
      setCustomerName('Walk-in Customer');
      setCustomerEmail('');
      setNotes('');
      setError('');
    }
  };

  return (
    <Modal
      isOpen={isNewSaleModalOpen}
      onClose={handleClose}
      title="Point of Sale — Record New Sale"
      subtitle="Select products, enter quantities, and generate customer invoice receipt"
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Customer Information */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Name</label>
            <input
              type="text"
              name="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email (for receipt)
            </label>
            <input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="customer@example.com"
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
            <select
              name="paymentMethod"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              <option value="credit_card">Credit / Debit Card</option>
              <option value="cash">Cash</option>
              <option value="mobile_pay">Mobile Pay (Apple / Google)</option>
              <option value="bank_transfer">Bank Wire Transfer</option>
            </select>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Purchased Items
            </h4>
            <button
              type="button"
              onClick={handleAddLine}
              className="text-xs font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Another Item
            </button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {cart.map((line, index) => {
              const prod = products.find((p) => p.id === line.productId);
              const maxStock = prod ? prod.quantity : 0;
              const isOver = maxStock < line.quantity;

              return (
                <div
                  key={index}
                  className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                    isOver ? 'bg-rose-50/50 border-rose-200' : 'bg-white border-slate-200'
                  }`}
                >
                  {/* Product selector */}
                  <div className="flex-1 min-w-[200px]">
                    <select
                      name="cartProduct"
                      value={line.productId}
                      onChange={(e) => handleProductChange(index, e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                    >
                      {products.map((p) => (
                        <option
                          key={p.id}
                          value={p.id}
                          disabled={p.quantity <= 0}
                        >
                          {p.name} ({p.sku}) — Stock: {p.quantity} {p.quantity <= 0 ? '(OUT OF STOCK)' : ''}
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                      <span>Available: <strong className="font-mono text-slate-800">{maxStock} pcs</strong></span>
                      <span>·</span>
                      <span>Price: <strong className="font-mono text-slate-800">${prod?.sellingPrice.toFixed(2)}</strong></span>
                    </div>
                  </div>

                  {/* Quantity Stepper with Stock Guard */}
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Qty:</span>
                    <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(index, line.quantity - 1)}
                        className="px-2 py-1 text-slate-600 hover:bg-slate-100 transition-colors"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        name="cartQuantity"
                        min="1"
                        max={maxStock}
                        value={line.quantity}
                        onChange={(e) =>
                          handleQuantityChange(index, parseInt(e.target.value, 10) || 1)
                        }
                        className="w-12 text-center text-xs font-mono font-bold py-1 focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(index, line.quantity + 1)}
                        className="px-2 py-1 text-slate-600 hover:bg-slate-100 transition-colors"
                      >
                        +
                      </button>
                    </div>

                    {/* Line Total */}
                    <div className="w-20 text-right font-mono font-bold text-slate-900 text-sm">
                      ${((prod?.sellingPrice || 0) * line.quantity).toFixed(2)}
                    </div>

                    {/* Delete Line */}
                    <button
                      type="button"
                      onClick={() => handleRemoveLine(index)}
                      disabled={cart.length === 1}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition-colors disabled:opacity-30"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Warning if stock exceeded */}
        {hasStockError && (
          <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{stockErrorMessage}</span>
          </div>
        )}

        {/* Order Summary & Financial Breakdown */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal:</span>
            <span className="font-mono font-medium text-slate-900">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Estimated Sales Tax ({settings.taxRate}%):</span>
            <span className="font-mono font-medium text-slate-900">${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
            <span>Total Payable:</span>
            <span className="font-mono text-base text-emerald-800">${total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[11px] text-emerald-700 pt-1 font-mono">
            <span>Net Gross Profit (Revenue - Wholesale Cost):</span>
            <span>+${estimatedProfit.toFixed(2)}</span>
          </div>
        </div>

        {/* Optional Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Transaction Notes (Optional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. In-store customer requested printed gift receipt"
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        {error && (
          <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {error}
          </div>
        )}

        {/* Form buttons */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={hasStockError || subtotal <= 0}
            className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:pointer-events-none rounded-lg transition-colors shadow-xs flex items-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" /> Complete Sale & Print Receipt
          </button>
        </div>
      </form>
    </Modal>
  );
};
