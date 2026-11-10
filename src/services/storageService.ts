import {
  Product,
  SaleTransaction,
  InventoryMovement,
  StoreSettings,
  SmartAlert,
  SubscriptionTier,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_SALES,
  INITIAL_MOVEMENTS,
  INITIAL_SETTINGS,
} from '../data/demoData';

const KEYS = {
  PRODUCTS: 'stockly_products_v1',
  SALES: 'stockly_sales_v1',
  MOVEMENTS: 'stockly_movements_v1',
  SETTINGS: 'stockly_settings_v1',
  PLAN: 'stockly_active_plan_v1',
};

export const storageService = {
  // Load products or seed default
  getProducts(): Product[] {
    try {
      const stored = localStorage.getItem(KEYS.PRODUCTS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not read products from localStorage, loading initial data', e);
    }
    this.saveProducts(INITIAL_PRODUCTS);
    return INITIAL_PRODUCTS;
  },

  saveProducts(products: Product[]): void {
    try {
      localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.error('Failed to save products to localStorage', e);
    }
  },

  // Load sales or seed default
  getSales(): SaleTransaction[] {
    try {
      const stored = localStorage.getItem(KEYS.SALES);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not read sales from localStorage, loading initial data', e);
    }
    this.saveSales(INITIAL_SALES);
    return INITIAL_SALES;
  },

  saveSales(sales: SaleTransaction[]): void {
    try {
      localStorage.setItem(KEYS.SALES, JSON.stringify(sales));
    } catch (e) {
      console.error('Failed to save sales to localStorage', e);
    }
  },

  // Load movements or seed default
  getMovements(): InventoryMovement[] {
    try {
      const stored = localStorage.getItem(KEYS.MOVEMENTS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not read movements from localStorage, loading initial data', e);
    }
    this.saveMovements(INITIAL_MOVEMENTS);
    return INITIAL_MOVEMENTS;
  },

  saveMovements(movements: InventoryMovement[]): void {
    try {
      localStorage.setItem(KEYS.MOVEMENTS, JSON.stringify(movements));
    } catch (e) {
      console.error('Failed to save movements to localStorage', e);
    }
  },

  // Settings
  getSettings(): StoreSettings {
    try {
      const stored = localStorage.getItem(KEYS.SETTINGS);
      if (stored) {
        return { ...INITIAL_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('Could not read settings from localStorage, loading initial data', e);
    }
    this.saveSettings(INITIAL_SETTINGS);
    return INITIAL_SETTINGS;
  },

  saveSettings(settings: StoreSettings): void {
    try {
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings to localStorage', e);
    }
  },

  // Active Plan
  getActivePlan(): SubscriptionTier {
    try {
      const stored = localStorage.getItem(KEYS.PLAN);
      if (stored && (stored === 'starter' || stored === 'professional' || stored === 'business')) {
        return stored as SubscriptionTier;
      }
    } catch {
      // ignore
    }
    return 'professional'; // Default featured plan
  },

  saveActivePlan(tier: SubscriptionTier): void {
    try {
      localStorage.setItem(KEYS.PLAN, tier);
    } catch (e) {
      console.error('Failed to save plan to localStorage', e);
    }
  },

  // Reset to original clean demo state
  resetAllDemoData(): { products: Product[]; sales: SaleTransaction[]; movements: InventoryMovement[]; settings: StoreSettings } {
    localStorage.removeItem(KEYS.PRODUCTS);
    localStorage.removeItem(KEYS.SALES);
    localStorage.removeItem(KEYS.MOVEMENTS);
    localStorage.removeItem(KEYS.SETTINGS);
    localStorage.removeItem(KEYS.PLAN);

    this.saveProducts(INITIAL_PRODUCTS);
    this.saveSales(INITIAL_SALES);
    this.saveMovements(INITIAL_MOVEMENTS);
    this.saveSettings(INITIAL_SETTINGS);
    this.saveActivePlan('professional');

    return {
      products: INITIAL_PRODUCTS,
      sales: INITIAL_SALES,
      movements: INITIAL_MOVEMENTS,
      settings: INITIAL_SETTINGS,
    };
  },

  // Compute smart alerts dynamically from current inventory
  computeSmartAlerts(products: Product[]): SmartAlert[] {
    const alerts: SmartAlert[] = [];
    const now = new Date();

    products.forEach((p) => {
      // 1. Out of stock
      if (p.quantity === 0) {
        alerts.push({
          id: `alert-out-${p.id}`,
          productId: p.id,
          productName: p.name,
          sku: p.sku,
          type: 'out_of_stock',
          severity: 'critical',
          currentQuantity: 0,
          minStockLevel: p.minStockLevel,
          message: `Zero inventory remaining for ${p.name}.`,
          recommendation: `Immediate reorder required. Suggested batch size: ${p.minStockLevel * 2 || 20} units.`,
          suggestedAction: 'reorder',
          suggestedQuantity: p.minStockLevel * 2 || 20,
        });
      }
      // 2. Low stock
      else if (p.quantity <= p.minStockLevel) {
        alerts.push({
          id: `alert-low-${p.id}`,
          productId: p.id,
          productName: p.name,
          sku: p.sku,
          type: 'low_stock',
          severity: 'warning',
          currentQuantity: p.quantity,
          minStockLevel: p.minStockLevel,
          message: `Stock level (${p.quantity} units) is at or below the safety threshold of ${p.minStockLevel}.`,
          recommendation: `Place restock order with ${p.supplier} before lead-time depletion. Recommended quantity: ${Math.max(10, p.minStockLevel * 2 - p.quantity)} units.`,
          suggestedAction: 'reorder',
          suggestedQuantity: Math.max(10, p.minStockLevel * 2 - p.quantity),
        });
      }

      // 3. Expiration detection
      if (p.expirationDate) {
        const expDate = new Date(p.expirationDate);
        const diffMs = expDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays <= 30 && diffDays >= 0) {
          alerts.push({
            id: `alert-exp-${p.id}`,
            productId: p.id,
            productName: p.name,
            sku: p.sku,
            type: 'expiring_soon',
            severity: diffDays <= 14 ? 'critical' : 'warning',
            currentQuantity: p.quantity,
            minStockLevel: p.minStockLevel,
            expirationDate: p.expirationDate,
            message: `Batch expires in ${diffDays} day${diffDays === 1 ? '' : 's'} (${p.expirationDate}).`,
            recommendation: `Launch a flash promo or 20% clearance discount to rotate the ${p.quantity} units before expiration.`,
            suggestedAction: 'discount',
          });
        }
      }
    });

    return alerts;
  },

  // Export full JSON dump
  exportStoreData(): string {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      storeSettings: this.getSettings(),
      activePlan: this.getActivePlan(),
      products: this.getProducts(),
      sales: this.getSales(),
      movements: this.getMovements(),
    };
    return JSON.stringify(data, null, 2);
  },

  // Import JSON dump
  importStoreData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.products) && Array.isArray(data.sales)) {
        if (data.products) this.saveProducts(data.products);
        if (data.sales) this.saveSales(data.sales);
        if (data.movements) this.saveMovements(data.movements);
        if (data.storeSettings) this.saveSettings(data.storeSettings);
        if (data.activePlan) this.saveActivePlan(data.activePlan);
        return true;
      }
    } catch (e) {
      console.error('Failed to import data', e);
    }
    return false;
  },
};
