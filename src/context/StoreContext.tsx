import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Product,
  SaleTransaction,
  SaleItem,
  InventoryMovement,
  StoreSettings,
  SmartAlert,
  SubscriptionTier,
  PaymentMethod,
} from '../types';
import { storageService } from '../services/storageService';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface StoreContextType {
  products: Product[];
  sales: SaleTransaction[];
  movements: InventoryMovement[];
  alerts: SmartAlert[];
  settings: StoreSettings;
  activePlan: SubscriptionTier;
  toasts: ToastMessage[];
  dismissToast: (id: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;

  // Global modal triggers
  isNewSaleModalOpen: boolean;
  setIsNewSaleModalOpen: (open: boolean) => void;
  isAddProductModalOpen: boolean;
  setIsAddProductModalOpen: (open: boolean) => void;
  stockModalConfig: { isOpen: boolean; type: 'stock_in' | 'stock_out'; productId?: string; defaultQuantity?: number };
  setStockModalConfig: React.Dispatch<React.SetStateAction<{ isOpen: boolean; type: 'stock_in' | 'stock_out'; productId?: string; defaultQuantity?: number }>>;
  receiptModalData: SaleTransaction | null;
  setReceiptModalData: (sale: SaleTransaction | null) => void;

  // Actions
  setActivePlan: (tier: SubscriptionTier) => void;
  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  addProduct: (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => boolean;
  recordStockIn: (productId: string, quantity: number, reason: string, unitCost?: number, performedBy?: string) => boolean;
  recordStockOut: (productId: string, quantity: number, reason: string, performedBy?: string) => boolean;
  recordSale: (saleData: {
    customerName: string;
    customerEmail?: string;
    paymentMethod: PaymentMethod;
    items: { productId: string; quantity: number }[];
    notes?: string;
  }) => SaleTransaction | null;
  resetDemoData: () => void;
  importData: (json: string) => boolean;
  exportData: () => string;

  // Calculated Metrics
  totalProducts: number;
  totalInventoryCost: number;
  totalInventoryRetail: number;
  totalSalesRevenue: number;
  totalGrossProfit: number;
  grossMarginPercent: number;
  lowStockCount: number;
  outOfStockCount: number;
  expiringCount: number;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => storageService.getProducts());
  const [sales, setSales] = useState<SaleTransaction[]>(() => storageService.getSales());
  const [movements, setMovements] = useState<InventoryMovement[]>(() => storageService.getMovements());
  const [settings, setSettings] = useState<StoreSettings>(() => storageService.getSettings());
  const [activePlan, setActivePlanState] = useState<SubscriptionTier>(() => storageService.getActivePlan());

  // Global modals
  const [isNewSaleModalOpen, setIsNewSaleModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [stockModalConfig, setStockModalConfig] = useState<{
    isOpen: boolean;
    type: 'stock_in' | 'stock_out';
    productId?: string;
    defaultQuantity?: number;
  }>({
    isOpen: false,
    type: 'stock_in',
  });
  const [receiptModalData, setReceiptModalData] = useState<SaleTransaction | null>(null);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Sync to localStorage
  useEffect(() => {
    storageService.saveProducts(products);
  }, [products]);

  useEffect(() => {
    storageService.saveSales(sales);
  }, [sales]);

  useEffect(() => {
    storageService.saveMovements(movements);
  }, [movements]);

  useEffect(() => {
    storageService.saveSettings(settings);
  }, [settings]);

  // Plan changer
  const setActivePlan = useCallback((tier: SubscriptionTier) => {
    setActivePlanState(tier);
    storageService.saveActivePlan(tier);
    showToast(`Switched plan to ${tier.charAt(0).toUpperCase() + tier.slice(1)}`, 'info');
  }, [showToast]);

  const updateSettings = useCallback((newSettings: Partial<StoreSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      return updated;
    });
    showToast('Store settings updated', 'success');
  }, [showToast]);

  // Add Product
  const addProduct = useCallback(
    (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product => {
      const now = new Date().toISOString();
      const newProduct: Product = {
        ...productData,
        id: `prod-${Date.now().toString(36)}`,
        createdAt: now,
        updatedAt: now,
      };

      setProducts((prev) => [newProduct, ...prev]);

      // If initial quantity > 0, log stock in movement
      if (newProduct.quantity > 0) {
        const initialMovement: InventoryMovement = {
          id: `mov-${Date.now().toString(36)}`,
          productId: newProduct.id,
          productName: newProduct.name,
          sku: newProduct.sku,
          type: 'stock_in',
          quantityChange: newProduct.quantity,
          previousQuantity: 0,
          newQuantity: newProduct.quantity,
          reason: 'Initial catalog inventory setup',
          unitCost: newProduct.purchasePrice,
          timestamp: now,
          performedBy: 'Store Admin',
        };
        setMovements((prev) => [initialMovement, ...prev]);
      }

      showToast(`Added product "${newProduct.name}"`, 'success');
      return newProduct;
    },
    [showToast]
  );

  // Update Product
  const updateProduct = useCallback(
    (id: string, updates: Partial<Product>) => {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p;
          return {
            ...p,
            ...updates,
            updatedAt: new Date().toISOString(),
          };
        })
      );
      showToast('Product updated successfully', 'success');
    },
    [showToast]
  );

  // Delete Product
  const deleteProduct = useCallback(
    (id: string): boolean => {
      const product = products.find((p) => p.id === id);
      if (!product) return false;

      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast(`Deleted product "${product.name}"`, 'info');
      return true;
    },
    [products, showToast]
  );

  // Record Stock In
  const recordStockIn = useCallback(
    (productId: string, quantity: number, reason: string, unitCost?: number, performedBy = 'Store Staff'): boolean => {
      const intQty = Math.floor(Number(quantity));
      if (isNaN(intQty) || intQty <= 0) {
        showToast('Please enter a valid stock-in quantity (≥ 1).', 'error');
        return false;
      }
      const product = products.find((p) => p.id === productId);
      if (!product) {
        showToast('Selected product not found.', 'error');
        return false;
      }

      const previousQuantity = product.quantity;
      const newQuantity = previousQuantity + intQty;
      const now = new Date().toISOString();
      const validCost = typeof unitCost === 'number' && !isNaN(unitCost) && unitCost >= 0
        ? Number(unitCost.toFixed(2))
        : product.purchasePrice;

      const movement: InventoryMovement = {
        id: `mov-${Date.now().toString(36)}`,
        productId,
        productName: product.name,
        sku: product.sku,
        type: 'stock_in',
        quantityChange: intQty,
        previousQuantity,
        newQuantity,
        reason: reason?.trim() || 'Restock received',
        unitCost: validCost,
        timestamp: now,
        performedBy: performedBy?.trim() || 'Store Staff',
      };

      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? {
                ...p,
                quantity: newQuantity,
                purchasePrice: validCost,
                updatedAt: now,
              }
            : p
        )
      );
      setMovements((prev) => [movement, ...prev]);

      showToast(`Added ${intQty} units to "${product.name}" (New stock: ${newQuantity})`, 'success');
      return true;
    },
    [products, showToast]
  );

  // Record Stock Out
  const recordStockOut = useCallback(
    (productId: string, quantity: number, reason: string, performedBy = 'Store Staff'): boolean => {
      const intQty = Math.floor(Number(quantity));
      if (isNaN(intQty) || intQty <= 0) {
        showToast('Please enter a valid stock-out quantity (≥ 1).', 'error');
        return false;
      }
      const product = products.find((p) => p.id === productId);
      if (!product) {
        showToast('Selected product not found.', 'error');
        return false;
      }
      if (product.quantity < intQty) {
        showToast(`Cannot remove ${intQty} units. Only ${product.quantity} available.`, 'error');
        return false;
      }

      const previousQuantity = product.quantity;
      const newQuantity = Math.max(0, previousQuantity - intQty);
      const now = new Date().toISOString();

      const movement: InventoryMovement = {
        id: `mov-${Date.now().toString(36)}`,
        productId,
        productName: product.name,
        sku: product.sku,
        type: 'stock_out',
        quantityChange: -intQty,
        previousQuantity,
        newQuantity,
        reason: reason?.trim() || 'Stock reduction',
        timestamp: now,
        performedBy: performedBy?.trim() || 'Store Staff',
      };

      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, quantity: newQuantity, updatedAt: now } : p))
      );
      setMovements((prev) => [movement, ...prev]);

      showToast(`Removed ${intQty} units from "${product.name}" (Remaining: ${newQuantity})`, 'info');
      return true;
    },
    [products, showToast]
  );

  // Record New Sale with total item consolidation to completely prevent negative inventory
  const recordSale = useCallback(
    (saleData: {
      customerName: string;
      customerEmail?: string;
      paymentMethod: PaymentMethod;
      items: { productId: string; quantity: number }[];
      notes?: string;
    }): SaleTransaction | null => {
      if (!saleData.items || saleData.items.length === 0) {
        showToast('Sale must contain at least one item.', 'error');
        return null;
      }

      // Consolidate requested quantities by product to handle duplicate cart rows
      const requestedQuantities = new Map<string, number>();
      for (const item of saleData.items) {
        const qty = Math.floor(Number(item.quantity));
        if (isNaN(qty) || qty <= 0) {
          showToast('Invalid item quantity specified in checkout.', 'error');
          return null;
        }
        requestedQuantities.set(
          item.productId,
          (requestedQuantities.get(item.productId) || 0) + qty
        );
      }

      // Check stock sufficiency for every requested product
      for (const [prodId, totalRequested] of requestedQuantities.entries()) {
        const prod = products.find((p) => p.id === prodId);
        if (!prod) {
          showToast(`A product in cart could not be located in catalog.`, 'error');
          return null;
        }
        if (prod.quantity < totalRequested) {
          showToast(
            `Insufficient stock: requested ${totalRequested} × "${prod.name}", but only ${prod.quantity} available.`,
            'error'
          );
          return null;
        }
      }

      const now = new Date().toISOString();
      let subtotal = 0;
      let totalCost = 0;
      const saleItems: SaleItem[] = [];

      for (const [prodId, totalQty] of requestedQuantities.entries()) {
        const prod = products.find((p) => p.id === prodId)!;
        const lineSubtotal = Number((prod.sellingPrice * totalQty).toFixed(2));
        const lineCost = Number((prod.purchasePrice * totalQty).toFixed(2));
        subtotal += lineSubtotal;
        totalCost += lineCost;

        saleItems.push({
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          quantity: totalQty,
          unitPrice: prod.sellingPrice,
          purchasePrice: prod.purchasePrice,
          subtotal: lineSubtotal,
        });
      }

      subtotal = Number(subtotal.toFixed(2));
      totalCost = Number(totalCost.toFixed(2));
      const taxRate = Math.max(0, Number(settings.taxRate) || 0);
      const tax = Number(((subtotal * taxRate) / 100).toFixed(2));
      const totalAmount = Number((subtotal + tax).toFixed(2));
      const profit = Number((subtotal - totalCost).toFixed(2)); // Net retail gross profit

      const saleId = `sale-${Date.now().toString(36)}`;
      const receiptNumber = `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const newSale: SaleTransaction = {
        id: saleId,
        receiptNumber,
        timestamp: now,
        customerName: saleData.customerName?.trim() || 'Walk-in Customer',
        customerEmail: saleData.customerEmail?.trim() || undefined,
        items: saleItems,
        subtotal,
        tax,
        totalAmount,
        totalCost,
        profit,
        paymentMethod: saleData.paymentMethod,
        notes: saleData.notes?.trim() || undefined,
      };

      // Deduct inventory with zero-negative guarantee and record audit movements
      const newMovements: InventoryMovement[] = [];
      const updatedProducts = products.map((p) => {
        const deductQty = requestedQuantities.get(p.id);
        if (deductQty) {
          const previousQuantity = p.quantity;
          const newQuantity = Math.max(0, previousQuantity - deductQty);

          newMovements.push({
            id: `mov-${Date.now().toString(36)}-${p.id.slice(-4)}`,
            productId: p.id,
            productName: p.name,
            sku: p.sku,
            type: 'sale',
            quantityChange: -deductQty,
            previousQuantity,
            newQuantity,
            reason: `Sold in receipt ${receiptNumber}`,
            referenceId: saleId,
            timestamp: now,
            performedBy: 'POS Checkout',
          });

          return {
            ...p,
            quantity: newQuantity,
            updatedAt: now,
          };
        }
        return p;
      });

      setProducts(updatedProducts);
      setSales((prev) => [newSale, ...prev]);
      setMovements((prev) => [...newMovements, ...prev]);

      showToast(`Sale #${receiptNumber} recorded! Total: $${totalAmount.toFixed(2)}`, 'success');
      setReceiptModalData(newSale);
      return newSale;
    },
    [products, settings.taxRate, showToast]
  );

  // Reset demo data
  const resetDemoData = useCallback(() => {
    const pristine = storageService.resetAllDemoData();
    setProducts(pristine.products);
    setSales(pristine.sales);
    setMovements(pristine.movements);
    setSettings(pristine.settings);
    setActivePlanState('professional');
    showToast('Reset to original sample Demo Store data', 'info');
  }, [showToast]);

  const exportData = useCallback(() => {
    return storageService.exportStoreData();
  }, []);

  const importData = useCallback(
    (json: string): boolean => {
      const ok = storageService.importStoreData(json);
      if (ok) {
        setProducts(storageService.getProducts());
        setSales(storageService.getSales());
        setMovements(storageService.getMovements());
        setSettings(storageService.getSettings());
        setActivePlanState(storageService.getActivePlan());
        showToast('Successfully imported data backup', 'success');
        return true;
      } else {
        showToast('Invalid data format. Import failed.', 'error');
        return false;
      }
    },
    [showToast]
  );

  // Dynamic Smart Alerts
  const alerts = useMemo(() => storageService.computeSmartAlerts(products), [products]);

  // Aggregate Metrics
  const totalProducts = products.length;

  const totalInventoryCost = useMemo(
    () => products.reduce((sum, p) => sum + p.quantity * p.purchasePrice, 0),
    [products]
  );

  const totalInventoryRetail = useMemo(
    () => products.reduce((sum, p) => sum + p.quantity * p.sellingPrice, 0),
    [products]
  );

  const totalSalesRevenue = useMemo(
    () => sales.reduce((sum, s) => sum + s.totalAmount, 0),
    [sales]
  );

  const totalGrossProfit = useMemo(
    () => sales.reduce((sum, s) => sum + s.profit, 0),
    [sales]
  );

  const grossMarginPercent = useMemo(() => {
    const totalSub = sales.reduce((sum, s) => sum + s.subtotal, 0);
    if (totalSub <= 0) return 0;
    return (totalGrossProfit / totalSub) * 100;
  }, [sales, totalGrossProfit]);

  const lowStockCount = useMemo(
    () => products.filter((p) => p.quantity > 0 && p.quantity <= p.minStockLevel).length,
    [products]
  );

  const outOfStockCount = useMemo(
    () => products.filter((p) => p.quantity === 0).length,
    [products]
  );

  const expiringCount = useMemo(() => {
    const now = new Date();
    return products.filter((p) => {
      if (!p.expirationDate) return false;
      const diffDays = (new Date(p.expirationDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays <= 30 && diffDays >= 0;
    }).length;
  }, [products]);

  const value = {
    products,
    sales,
    movements,
    alerts,
    settings,
    activePlan,
    toasts,
    dismissToast,
    showToast,
    isNewSaleModalOpen,
    setIsNewSaleModalOpen,
    isAddProductModalOpen,
    setIsAddProductModalOpen,
    stockModalConfig,
    setStockModalConfig,
    receiptModalData,
    setReceiptModalData,
    setActivePlan,
    updateSettings,
    addProduct,
    updateProduct,
    deleteProduct,
    recordStockIn,
    recordStockOut,
    recordSale,
    resetDemoData,
    importData,
    exportData,
    totalProducts,
    totalInventoryCost,
    totalInventoryRetail,
    totalSalesRevenue,
    totalGrossProfit,
    grossMarginPercent,
    lowStockCount,
    outOfStockCount,
    expiringCount,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
