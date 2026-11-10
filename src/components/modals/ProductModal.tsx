import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Product, ProductCategory } from '../../types';
import { CATEGORIES_LIST, SUPPLIER_LIST } from '../../data/demoData';
import { useStore } from '../../context/StoreContext';
import { Sparkles } from 'lucide-react';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
}) => {
  const { products, addProduct, updateProduct, showToast } = useStore();

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Electronics');
  const [purchasePrice, setPurchasePrice] = useState<number | ''>('');
  const [sellingPrice, setSellingPrice] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number | ''>(10);
  const [minStockLevel, setMinStockLevel] = useState<number | ''>(10);
  const [supplier, setSupplier] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setSku(productToEdit.sku);
      setCategory(productToEdit.category);
      setPurchasePrice(productToEdit.purchasePrice);
      setSellingPrice(productToEdit.sellingPrice);
      setQuantity(productToEdit.quantity);
      setMinStockLevel(productToEdit.minStockLevel);
      setSupplier(productToEdit.supplier);
      setExpirationDate(productToEdit.expirationDate || '');
      setDescription(productToEdit.description || '');
    } else {
      setName('');
      setSku('');
      setCategory('Electronics');
      setPurchasePrice('');
      setSellingPrice('');
      setQuantity(10);
      setMinStockLevel(10);
      setSupplier(SUPPLIER_LIST[0]);
      setExpirationDate('');
      setDescription('');
    }
    setErrors({});
  }, [productToEdit, isOpen]);

  // Live profit margin calculation
  const pPrice = typeof purchasePrice === 'number' ? purchasePrice : 0;
  const sPrice = typeof sellingPrice === 'number' ? sellingPrice : 0;
  const marginDollar = sPrice - pPrice;
  const marginPercent = sPrice > 0 ? ((marginDollar / sPrice) * 100).toFixed(1) : '0.0';

  const generateSku = () => {
    const catCode = category.slice(0, 3).toUpperCase();
    const randomNum = Math.floor(100 + Math.random() * 900);
    setSku(`STK-${catCode}-${randomNum}`);
  };

  const validate = () => {
    const err: Record<string, string> = {};
    if (!name.trim()) err.name = 'Product name is required';
    if (!sku.trim()) {
      err.sku = 'SKU identifier is required';
    } else {
      const isDuplicate = products.some(
        (p) => p.sku.toUpperCase() === sku.trim().toUpperCase() && p.id !== productToEdit?.id
      );
      if (isDuplicate) {
        err.sku = `SKU "${sku.trim().toUpperCase()}" is already assigned to another product`;
      }
    }
    if (typeof purchasePrice !== 'number' || isNaN(purchasePrice) || purchasePrice < 0) {
      err.purchasePrice = 'Enter a valid purchase cost (≥ 0)';
    }
    if (typeof sellingPrice !== 'number' || isNaN(sellingPrice) || sellingPrice <= 0) {
      err.sellingPrice = 'Enter a valid retail selling price (> 0)';
    }
    if (typeof quantity !== 'number' || isNaN(quantity) || quantity < 0) {
      err.quantity = 'Stock quantity cannot be negative';
    }
    if (typeof minStockLevel !== 'number' || isNaN(minStockLevel) || minStockLevel < 0) {
      err.minStockLevel = 'Minimum stock level must be ≥ 0';
    }
    if (!supplier.trim()) err.supplier = 'Supplier name is required';

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: name.trim(),
      sku: sku.trim().toUpperCase(),
      category,
      purchasePrice: Number(Number(purchasePrice).toFixed(2)),
      sellingPrice: Number(Number(sellingPrice).toFixed(2)),
      quantity: Math.floor(Number(quantity)),
      minStockLevel: Math.floor(Number(minStockLevel)),
      supplier: supplier.trim(),
      expirationDate: expirationDate || undefined,
      description: description.trim() || undefined,
    };

    if (productToEdit) {
      updateProduct(productToEdit.id, payload);
    } else {
      addProduct(payload);
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={productToEdit ? 'Edit Product' : 'Add New Product'}
      subtitle={
        productToEdit
          ? `Modify details for ${productToEdit.name}`
          : 'Create a new inventory item with pricing and safety stock thresholds'
      }
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Product Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Product Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="productName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Wireless Ergonomic Mouse"
            className={`w-full px-3 py-2 text-sm rounded-lg border ${
              errors.name ? 'border-rose-300 bg-rose-50/30' : 'border-slate-300'
            } focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500`}
          />
          {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name}</p>}
        </div>

        {/* SKU & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                SKU Identifier <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={generateSku}
                className="text-[11px] text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" /> Auto-Generate
              </button>
            </div>
            <input
              type="text"
              name="productSku"
              value={sku}
              onChange={(e) => setSku(e.target.value.toUpperCase())}
              placeholder="e.g. STK-MOU-201"
              className={`w-full px-3 py-2 text-sm font-mono rounded-lg border ${
                errors.sku ? 'border-rose-300 bg-rose-50/30' : 'border-slate-300'
              } focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500`}
            />
            {errors.sku && <p className="text-xs text-rose-600 mt-1">{errors.sku}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as ProductCategory)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              {CATEGORIES_LIST.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Purchase & Selling Prices with Live Margin Preview */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Purchase Price (Cost) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-sm text-slate-400">$</span>
                <input
                  type="number"
                  name="purchasePrice"
                  step="0.01"
                  min="0"
                  value={purchasePrice}
                  onChange={(e) =>
                    setPurchasePrice(e.target.value === '' ? '' : parseFloat(e.target.value))
                  }
                  placeholder="0.00"
                  className="w-full pl-7 pr-3 py-2 text-sm font-mono rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
              {errors.purchasePrice && (
                <p className="text-xs text-rose-600 mt-1">{errors.purchasePrice}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Selling Price (Retail) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-sm text-slate-400">$</span>
                <input
                  type="number"
                  name="sellingPrice"
                  step="0.01"
                  min="0"
                  value={sellingPrice}
                  onChange={(e) =>
                    setSellingPrice(e.target.value === '' ? '' : parseFloat(e.target.value))
                  }
                  placeholder="0.00"
                  className="w-full pl-7 pr-3 py-2 text-sm font-mono rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
              {errors.sellingPrice && (
                <p className="text-xs text-rose-600 mt-1">{errors.sellingPrice}</p>
              )}
            </div>
          </div>

          {/* Margin calculation box */}
          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/60 text-slate-600">
            <span>
              Estimated Profit Margin: <strong className="text-slate-900">${marginDollar.toFixed(2)} / unit</strong>
            </span>
            <span
              className={`font-semibold font-mono ${
                marginDollar > 0 ? 'text-emerald-700' : 'text-slate-500'
              }`}
            >
              {marginPercent}% Margin
            </span>
          </div>
        </div>

        {/* Quantities: Initial Quantity & Minimum Stock Level */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Initial Quantity <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              name="quantity"
              min="0"
              value={quantity}
              onChange={(e) =>
                setQuantity(e.target.value === '' ? '' : parseInt(e.target.value, 10))
              }
              placeholder="0"
              className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            {errors.quantity && <p className="text-xs text-rose-600 mt-1">{errors.quantity}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Minimum Stock Threshold <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              name="minStockLevel"
              min="1"
              value={minStockLevel}
              onChange={(e) =>
                setMinStockLevel(e.target.value === '' ? '' : parseInt(e.target.value, 10))
              }
              placeholder="10"
              className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            {errors.minStockLevel && (
              <p className="text-xs text-rose-600 mt-1">{errors.minStockLevel}</p>
            )}
          </div>
        </div>

        {/* Supplier & Expiration Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Supplier <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              list="supplier-options"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              placeholder="Select or enter supplier"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            <datalist id="supplier-options">
              {SUPPLIER_LIST.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
            {errors.supplier && <p className="text-xs text-rose-600 mt-1">{errors.supplier}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Expiration Date (Optional)
            </label>
            <input
              type="date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief item specifications, packaging notes, or batch code..."
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
          >
            {productToEdit ? 'Save Changes' : 'Add to Inventory'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
