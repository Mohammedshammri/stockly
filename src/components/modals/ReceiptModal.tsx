import React from 'react';
import { Modal } from '../common/Modal';
import { useStore } from '../../context/StoreContext';
import { Printer, Download, CheckCircle2 } from 'lucide-react';

export const ReceiptModal: React.FC = () => {
  const { receiptModalData, setReceiptModalData, settings } = useStore();

  if (!receiptModalData) return null;

  const handleClose = () => {
    setReceiptModalData(null);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(receiptModalData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${receiptModalData.receiptNumber}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const saleDate = new Date(receiptModalData.timestamp).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <Modal
      isOpen={!!receiptModalData}
      onClose={handleClose}
      title="Sales Transaction Receipt"
      subtitle={`Receipt #${receiptModalData.receiptNumber}`}
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* Printable Receipt Box */}
        <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl space-y-4 font-sans text-xs">
          {/* Header */}
          <div className="text-center border-b border-slate-200 pb-4 space-y-1">
            <div className="inline-flex items-center gap-1.5 text-emerald-700 font-bold text-sm tracking-tight mb-0.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>STOCKLY POS RECEIPT</span>
            </div>
            <h3 className="font-bold text-base text-slate-900">{settings.storeName}</h3>
            <p className="text-slate-500">{settings.businessAddress}</p>
            <p className="text-slate-500">Tel: {settings.phone}</p>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-2 text-slate-600 border-b border-slate-200 pb-3">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Receipt No:</span>
              <strong className="text-slate-900 font-mono">{receiptModalData.receiptNumber}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Date & Time:</span>
              <span className="text-slate-900">{saleDate}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Customer:</span>
              <span className="text-slate-900 font-medium">{receiptModalData.customerName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Payment:</span>
              <span className="text-slate-900 capitalize">
                {receiptModalData.paymentMethod.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Line items table */}
          <div>
            <div className="grid grid-cols-12 font-semibold text-slate-500 border-b border-slate-200 pb-1 mb-2 text-[11px]">
              <span className="col-span-6">Item</span>
              <span className="col-span-2 text-center">Qty</span>
              <span className="col-span-2 text-right">Unit</span>
              <span className="col-span-2 text-right">Total</span>
            </div>

            <div className="space-y-1.5 divide-y divide-slate-100">
              {receiptModalData.items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 pt-1 text-slate-800">
                  <div className="col-span-6 truncate pr-2">
                    <p className="font-medium text-slate-900 truncate">{item.productName}</p>
                    <p className="text-[10px] font-mono text-slate-400">{item.sku}</p>
                  </div>
                  <div className="col-span-2 text-center font-mono">{item.quantity}</div>
                  <div className="col-span-2 text-right font-mono text-slate-600">
                    ${item.unitPrice.toFixed(2)}
                  </div>
                  <div className="col-span-2 text-right font-mono font-medium text-slate-900">
                    ${item.subtotal.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="border-t border-slate-200 pt-3 space-y-1.5">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-mono text-slate-900">${receiptModalData.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Tax ({settings.taxRate}%)</span>
              <span className="font-mono text-slate-900">${receiptModalData.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-900 pt-1.5 border-t border-slate-200">
              <span>Total Paid</span>
              <span className="font-mono text-emerald-800 text-base">
                ${receiptModalData.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Merchant internal audit info */}
          <div className="p-2.5 bg-emerald-50/60 rounded-lg border border-emerald-100 text-[11px] text-emerald-900 font-mono flex items-center justify-between">
            <span>Wholesale Cost: ${receiptModalData.totalCost.toFixed(2)}</span>
            <span className="font-bold">Gross Profit: +${receiptModalData.profit.toFixed(2)}</span>
          </div>

          <div className="text-center text-[10px] text-slate-400 pt-2">
            Thank you for shopping with {settings.storeName}!
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handleDownload}
            className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-slate-500" /> Export JSON
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" /> Print Receipt
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
