import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, ProductCategory, StockStatus } from '../types';
import { CATEGORIES_LIST } from '../data/demoData';
import { StatusBadge } from '../components/common/Badge';
import { ProductModal } from '../components/modals/ProductModal';
import { Modal } from '../components/common/Modal';
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Edit2,
  Trash2,
  ArrowDownLeft,
  Calendar,
  Building2,
  AlertCircle,
  Eye,
  DollarSign,
} from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const {
    products,
    deleteProduct,
    isAddProductModalOpen,
    setIsAddProductModalOpen,
    setStockModalConfig,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'quantity' | 'sellingPrice' | 'margin' | 'value'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modals state
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [productToView, setProductToView] = useState<Product | null>(null);

  // Filter & Sort
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Search
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          p.name.toLowerCase().includes(query) ||
          p.sku.toLowerCase().includes(query) ||
          p.supplier.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query);

        if (!matchesSearch) return false;

        // Category filter
        if (selectedCategory !== 'all' && p.category !== selectedCategory) {
          return false;
        }

        // Stock status filter
        if (stockFilter === 'in_stock') {
          return p.quantity > p.minStockLevel;
        } else if (stockFilter === 'low_stock') {
          return p.quantity > 0 && p.quantity <= p.minStockLevel;
        } else if (stockFilter === 'out_of_stock') {
          return p.quantity === 0;
        }

        return true;
      })
      .sort((a, b) => {
        let valA: string | number = 0;
        let valB: string | number = 0;

        if (sortBy === 'name') {
          valA = a.name.toLowerCase();
          valB = b.name.toLowerCase();
        } else if (sortBy === 'quantity') {
          valA = a.quantity;
          valB = b.quantity;
        } else if (sortBy === 'sellingPrice') {
          valA = a.sellingPrice;
          valB = b.sellingPrice;
        } else if (sortBy === 'margin') {
          valA = (a.sellingPrice - a.purchasePrice) / (a.sellingPrice || 1);
          valB = (b.sellingPrice - b.purchasePrice) / (b.sellingPrice || 1);
        } else if (sortBy === 'value') {
          valA = a.quantity * a.purchasePrice;
          valB = b.quantity * b.purchasePrice;
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [products, searchQuery, selectedCategory, stockFilter, sortBy, sortOrder]);

  const totalFilteredValue = useMemo(
    () => filteredProducts.reduce((sum, p) => sum + p.quantity * p.purchasePrice, 0),
    [filteredProducts]
  );

  const getStockStatus = (p: Product): StockStatus => {
    if (p.quantity === 0) return 'out_of_stock';
    if (p.quantity <= p.minStockLevel) return 'low_stock';
    return 'in_stock';
  };

  const handleDeleteConfirm = () => {
    if (productToDelete) {
      deleteProduct(productToDelete.id);
      setProductToDelete(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Controls Bar: Search, Category, Stock Level & Add Button */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by name, SKU, category, or supplier..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Add Product Button */}
          <button
            onClick={() => {
              setProductToEdit(null);
              setIsAddProductModalOpen(true);
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs flex items-center gap-1.5 self-start md:self-auto whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-2.5 py-1 text-xs rounded-md border border-slate-300 bg-white focus:outline-hidden"
              >
                <option value="all">All Categories ({products.length})</option>
                {CATEGORIES_LIST.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Stock Level Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Stock:</span>
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="px-2.5 py-1 text-xs rounded-md border border-slate-300 bg-white focus:outline-hidden"
              >
                <option value="all">All Statuses</option>
                <option value="in_stock">In Stock Only</option>
                <option value="low_stock">Low Stock (≤ Safety)</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
          </div>

          {/* Sort By Selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" /> Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1 text-xs rounded-md border border-slate-300 bg-white focus:outline-hidden font-medium"
            >
              <option value="name">Product Name</option>
              <option value="quantity">Stock Quantity</option>
              <option value="sellingPrice">Selling Price</option>
              <option value="margin">Profit Margin %</option>
              <option value="value">Inventory Value ($)</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-1 border border-slate-300 rounded text-slate-600 hover:bg-slate-50"
              title={`Sorting: ${sortOrder.toUpperCase()}`}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Summary Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong>{filteredProducts.length}</strong> of {products.length} products
        </span>
        <span className="font-mono">
          Filtered Stock Valuation: <strong>${totalFilteredValue.toFixed(2)}</strong>
        </span>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Product & SKU</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3 text-right">Cost</th>
                <th className="py-3 px-3 text-right">Retail</th>
                <th className="py-3 px-3 text-right">Margin</th>
                <th className="py-3 px-3 text-center">Stock / Min</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Supplier</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <div className="max-w-xs mx-auto space-y-2">
                      <p className="font-semibold text-slate-800">No matching products found</p>
                      <p className="text-xs text-slate-500">
                        {products.length === 0
                          ? 'Your catalog is empty. Add your first retail product to begin.'
                          : 'Try adjusting your search keywords, category filter, or stock level.'}
                      </p>
                      {products.length > 0 ? (
                        <button
                          onClick={() => {
                            setSearchQuery('');
                            setSelectedCategory('all');
                            setStockFilter('all');
                          }}
                          className="mt-2 px-3 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors"
                        >
                          Clear Active Filters
                        </button>
                      ) : (
                        <button
                          onClick={() => setIsAddProductModalOpen(true)}
                          className="mt-2 px-3 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors"
                        >
                          + Add First Product
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const status = getStockStatus(p);
                  const marginDollars = p.sellingPrice - p.purchasePrice;
                  const marginPct = p.sellingPrice > 0 ? (marginDollars / p.sellingPrice) * 100 : 0;

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                      onClick={() => setProductToView(p)}
                    >
                      {/* Product Name & SKU */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {p.name}
                        </div>
                        <div className="font-mono text-[10px] text-slate-400 flex items-center gap-2">
                          <span>{p.sku}</span>
                          {p.expirationDate && (
                            <span className="text-amber-700 inline-flex items-center gap-0.5">
                              · Exp: {p.expirationDate}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                        {p.category}
                      </td>

                      {/* Cost */}
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-500">
                        ${p.purchasePrice.toFixed(2)}
                      </td>

                      {/* Retail Price */}
                      <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-slate-900">
                        ${p.sellingPrice.toFixed(2)}
                      </td>

                      {/* Margin */}
                      <td className="py-3 px-3 text-right font-mono tabular-nums">
                        <span className="text-emerald-700 font-medium">
                          {marginPct.toFixed(1)}%
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          +${marginDollars.toFixed(2)}
                        </span>
                      </td>

                      {/* Stock / Min */}
                      <td className="py-3 px-3 text-center font-mono tabular-nums">
                        <span
                          className={`font-bold ${
                            p.quantity === 0
                              ? 'text-rose-600'
                              : p.quantity <= p.minStockLevel
                              ? 'text-amber-700'
                              : 'text-slate-900'
                          }`}
                        >
                          {p.quantity}
                        </span>
                        <span className="text-slate-400 text-[10px]"> / {p.minStockLevel}</span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <StatusBadge status={status} />
                      </td>

                      {/* Supplier */}
                      <td className="py-3 px-3 text-slate-600 truncate max-w-[140px]" title={p.supplier}>
                        {p.supplier}
                      </td>

                      {/* Actions */}
                      <td
                        className="py-3 px-4 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1">
                          {/* Stock-in quick button */}
                          <button
                            onClick={() =>
                              setStockModalConfig({
                                isOpen: true,
                                type: 'stock_in',
                                productId: p.id,
                                defaultQuantity: Math.max(10, p.minStockLevel * 2 - p.quantity),
                              })
                            }
                            className="p-1.5 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 rounded transition-colors"
                            title="Quick Stock-In"
                          >
                            <ArrowDownLeft className="w-4 h-4" />
                          </button>

                          {/* Edit button */}
                          <button
                            onClick={() => setProductToEdit(p)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete button */}
                          <button
                            onClick={() => setProductToDelete(p)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Product Modal */}
      {productToEdit && (
        <ProductModal
          isOpen={!!productToEdit}
          onClose={() => setProductToEdit(null)}
          productToEdit={productToEdit}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        title="Confirm Product Deletion"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Are you sure you want to delete this product?</p>
              <p className="mt-1 text-rose-700">
                "{productToDelete?.name}" ({productToDelete?.sku}) with {productToDelete?.quantity} units will be removed.
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            This action removes the catalog entry. Historical sales records will remain preserved for accounting accuracy.
          </p>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => setProductToDelete(null)}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs"
            >
              Delete Product
            </button>
          </div>
        </div>
      </Modal>

      {/* Product Detail Modal */}
      {productToView && (
        <Modal
          isOpen={!!productToView}
          onClose={() => setProductToView(null)}
          title={productToView.name}
          subtitle={`SKU: ${productToView.sku} · ${productToView.category}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            {/* Health & Status */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-slate-500 block">Inventory Status</span>
                <StatusBadge
                  status={getStockStatus(productToView)}
                  quantity={productToView.quantity}
                />
              </div>
              <div className="text-right">
                <span className="text-slate-500 block">Total Asset Value</span>
                <span className="font-mono font-bold text-sm text-slate-900">
                  ${(productToView.quantity * productToView.purchasePrice).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Pricing Matrix */}
            <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <div>
                <span className="text-slate-400 block">Cost Price</span>
                <span className="font-mono font-semibold text-slate-800 text-sm">
                  ${productToView.purchasePrice.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Retail Price</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  ${productToView.sellingPrice.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Unit Margin</span>
                <span className="font-mono font-bold text-emerald-700 text-sm">
                  +${(productToView.sellingPrice - productToView.purchasePrice).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-2 border-t border-slate-100 pt-3 text-slate-600">
              <div className="flex justify-between">
                <span>Primary Supplier:</span>
                <strong className="text-slate-900">{productToView.supplier}</strong>
              </div>
              <div className="flex justify-between">
                <span>Safety Reorder Threshold:</span>
                <span className="font-mono text-slate-900">{productToView.minStockLevel} units</span>
              </div>
              {productToView.expirationDate && (
                <div className="flex justify-between">
                  <span>Expiration Date:</span>
                  <span className="font-mono text-amber-700 font-semibold">{productToView.expirationDate}</span>
                </div>
              )}
              {productToView.description && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="font-semibold text-slate-700 block mb-1">Description:</span>
                  <p className="text-slate-600 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200">
                    {productToView.description}
                  </p>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setStockModalConfig({
                    isOpen: true,
                    type: 'stock_in',
                    productId: productToView.id,
                  });
                  setProductToView(null);
                }}
                className="px-3.5 py-1.5 font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <ArrowDownLeft className="w-3.5 h-3.5" /> Quick Restock
              </button>
              <button
                onClick={() => {
                  setProductToEdit(productToView);
                  setProductToView(null);
                }}
                className="px-3.5 py-1.5 font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
              >
                Edit Product
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
