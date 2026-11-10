export type ProductCategory =
  | 'Electronics'
  | 'Apparel'
  | 'Home & Kitchen'
  | 'Groceries & Gourmet'
  | 'Health & Personal Care'
  | 'Office Supplies';

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: ProductCategory;
  purchasePrice: number; // Cost price to store
  sellingPrice: number;  // Retail price to customer
  quantity: number;      // Current available stock
  minStockLevel: number; // Low stock threshold
  supplier: string;
  expirationDate?: string; // Optional YYYY-MM-DD
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export type MovementType = 'stock_in' | 'stock_out' | 'sale' | 'adjustment' | 'return';

export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  type: MovementType;
  quantityChange: number; // Positive for in, negative for out
  previousQuantity: number;
  newQuantity: number;
  reason: string;
  unitCost?: number;
  referenceId?: string; // e.g. sale ID or PO number
  timestamp: string;
  performedBy: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  purchasePrice: number; // For exact profit calculation
  subtotal: number;
}

export type PaymentMethod = 'credit_card' | 'cash' | 'mobile_pay' | 'bank_transfer';

export interface SaleTransaction {
  id: string;
  receiptNumber: string;
  timestamp: string;
  customerName: string;
  customerEmail?: string;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  totalAmount: number;
  totalCost: number;
  profit: number;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export type AlertType = 'out_of_stock' | 'low_stock' | 'expiring_soon' | 'overstock';
export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface SmartAlert {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  type: AlertType;
  severity: AlertSeverity;
  currentQuantity: number;
  minStockLevel: number;
  expirationDate?: string;
  message: string;
  recommendation: string;
  suggestedAction: 'reorder' | 'discount' | 'review';
  suggestedQuantity?: number;
}

export interface StoreSettings {
  storeName: string;
  currency: string;
  currencySymbol: string;
  taxRate: number; // Percentage e.g. 8.5
  defaultLowStockThreshold: number;
  enableAlerts: boolean;
  businessAddress: string;
  phone: string;
  email: string;
}

export type SubscriptionTier = 'starter' | 'professional' | 'business';

export interface PricingPlan {
  id: SubscriptionTier;
  name: string;
  priceMonthly: number;
  priceAnnual: number;
  description: string;
  highlighted?: boolean;
  productLimit: string;
  features: string[];
}
