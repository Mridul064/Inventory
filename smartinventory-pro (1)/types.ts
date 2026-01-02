
export type Department = string;

export type Unit = 'Pieces' | 'KG' | 'Gram' | 'Packet' | 'Meter' | 'Litre' | 'Set' | 'Roll';

export type Permission = 
  // Inventory Group
  | 'INV_VIEW' | 'INV_ADD' | 'INV_EDIT' | 'INV_DELETE' 
  | 'STOCK_IN' | 'STOCK_OUT' | 'STOCK_RECONCILE'
  | 'MIN_STOCK_EDIT' | 'CAT_MANAGE' | 'UNIT_MANAGE'
  // Indent Group
  | 'IND_VIEW' | 'IND_CREATE' | 'IND_APPROVE' | 'IND_REJECT' | 'IND_FULFILL'
  // Reporting Group
  | 'REPORTS_VIEW' | 'REPORTS_EXPORT' | 'REPORTS_PRINT' | 'PRICE_VIEW' | 'PRICE_EDIT' | 'AUDIT_LOGS'
  // AI Group
  | 'AI_INSIGHTS' | 'AI_DESC_GEN'
  // System Group
  | 'DEPT_MANAGE' | 'USER_MANAGE' | 'USER_PASS_RESET' | 'PURGE_DATA' | 'GLOBAL_ACCESS' | 'DASHBOARD_VIEW' | 'SETTINGS_ACCESS';

export interface User {
  id: string;
  username: string;
  password?: string;
  name: string;
  department: Department;
  role: 'admin' | 'user';
  permissions: Permission[];
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  department: Department;
  unit: Unit;
  price: number;
  quantity: number;
  minStock: number;
  description: string;
  updatedAt: string;
  // Dynamic fields
  batchNumber?: string;
  supplier?: string;
  location?: string;
  expiryDate?: string;
}

export interface InventoryFieldSetting {
  id: string;
  label: string;
  isEnabled: boolean;
  isRequired: boolean;
}

export interface InventoryFormConfig {
  fields: InventoryFieldSetting[];
}

export interface AppConfig {
  appName: string;
  logoUrl?: string;
}

export interface Indent {
  id: string;
  productId: string;
  productName: string;
  department: Department;
  quantity: number;
  unit: Unit;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'approved' | 'fulfilled' | 'cancelled';
  requestedBy: string;
  createdAt: string;
}

export enum NavigationTab {
  DASHBOARD = 'dashboard',
  INVENTORY = 'inventory',
  INDENTS = 'indents',
  ANALYTICS = 'analytics',
  ADMIN_PANEL = 'admin_panel',
  SETTINGS = 'settings'
}
