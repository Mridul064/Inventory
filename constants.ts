
import { Product, Department, Unit, Permission, InventoryFormConfig, AppConfig } from './types';

export const DEPARTMENTS: Department[] = [
  'Admin', 'HR', 'Accounts', 'Store', 'Logistics', 'Mechanical', 'Electrical', 'ETP', 'Boiler'
];

export const UNITS: Unit[] = [
  'Pieces', 'KG', 'Gram', 'Packet', 'Meter', 'Litre', 'Set', 'Roll'
];

export const INITIAL_PRODUCTS: Product[] = [];

export const CATEGORIES = [
  'Peripherals', 'Monitors', 'Laptops', 'Audio', 'Accessories', 'Office', 
  'Spare Parts', 'Chemicals', 'Tools', 'PPE', 'Stationery'
];

export const DEFAULT_APP_CONFIG: AppConfig = {
  appName: 'InventoryPro',
  logoUrl: ''
};

export const DEFAULT_FORM_CONFIG: InventoryFormConfig = {
  fields: [
    { id: 'name', label: 'Item Name', isEnabled: true, isRequired: true },
    { id: 'sku', label: 'SKU / Part No', isEnabled: true, isRequired: true },
    { id: 'category', label: 'Category', isEnabled: true, isRequired: true },
    { id: 'quantity', label: 'Initial Stock', isEnabled: true, isRequired: true },
    { id: 'unit', label: 'Unit (UOM)', isEnabled: true, isRequired: true },
    { id: 'price', label: 'Unit Price (₹)', isEnabled: true, isRequired: false },
    { id: 'minStock', label: 'Min Stock Level', isEnabled: true, isRequired: false },
    { id: 'batchNumber', label: 'Batch / Lot No', isEnabled: true, isRequired: false },
    { id: 'supplier', label: 'Vendor / Supplier', isEnabled: false, isRequired: false },
    { id: 'location', label: 'Rack / Location', isEnabled: false, isRequired: false },
    { id: 'expiryDate', label: 'Expiry Date', isEnabled: false, isRequired: false },
    { id: 'description', label: 'Remarks / Desc', isEnabled: true, isRequired: false },
  ]
};

export const PERMISSION_LIST: { id: Permission; label: string; group: 'Inventory' | 'Indents' | 'Reporting' | 'AI' | 'System' }[] = [
  { id: 'INV_VIEW', label: 'View Stock Ledger', group: 'Inventory' },
  { id: 'INV_ADD', label: 'Register New Assets', group: 'Inventory' },
  { id: 'INV_EDIT', label: 'Edit Asset Details', group: 'Inventory' },
  { id: 'INV_DELETE', label: 'Delete Asset Records', group: 'Inventory' },
  { id: 'STOCK_IN', label: 'Post Receipt (Add)', group: 'Inventory' },
  { id: 'STOCK_OUT', label: 'Post Issue (Out)', group: 'Inventory' },
  { id: 'STOCK_RECONCILE', label: 'Manual Correction', group: 'Inventory' },
  { id: 'MIN_STOCK_EDIT', label: 'Edit Min Stock Levels', group: 'Inventory' },
  { id: 'CAT_MANAGE', label: 'Manage Categories', group: 'Inventory' },
  { id: 'UNIT_MANAGE', label: 'Manage Units', group: 'Inventory' },
  { id: 'IND_VIEW', label: 'View Requisitions', group: 'Indents' },
  { id: 'IND_CREATE', label: 'Create Requisitions', group: 'Indents' },
  { id: 'IND_APPROVE', label: 'Approve Requisitions', group: 'Indents' },
  { id: 'IND_REJECT', label: 'Reject Requisitions', group: 'Indents' },
  { id: 'IND_FULFILL', label: 'Close/Fulfill Indents', group: 'Indents' },
  { id: 'REPORTS_VIEW', label: 'Access Analytics', group: 'Reporting' },
  { id: 'REPORTS_EXPORT', label: 'Export Data (CSV)', group: 'Reporting' },
  { id: 'REPORTS_PRINT', label: 'Print Stock Lists', group: 'Reporting' },
  { id: 'PRICE_VIEW', label: 'View Asset Pricing', group: 'Reporting' },
  { id: 'PRICE_EDIT', label: 'Modify Asset Price', group: 'Reporting' },
  { id: 'AUDIT_LOGS', label: 'View Activity Logs', group: 'Reporting' },
  { id: 'AI_INSIGHTS', label: 'Gemini Analysis Access', group: 'AI' },
  { id: 'AI_DESC_GEN', label: 'AI Description Generator', group: 'AI' },
  { id: 'DEPT_MANAGE', label: 'Manage Departments', group: 'System' },
  { id: 'USER_MANAGE', label: 'Manage User Accounts', group: 'System' },
  { id: 'USER_PASS_RESET', label: 'Reset User Passwords', group: 'System' },
  { id: 'PURGE_DATA', label: 'Purge System Data', group: 'System' },
  { id: 'GLOBAL_ACCESS', label: 'Global (All Dept) Access', group: 'System' },
  { id: 'DASHBOARD_VIEW', label: 'View Main Dashboard', group: 'System' },
  { id: 'SETTINGS_ACCESS', label: 'Access System Settings', group: 'System' }
];

export const ADMIN_PERMISSIONS: Permission[] = PERMISSION_LIST.map(p => p.id);
