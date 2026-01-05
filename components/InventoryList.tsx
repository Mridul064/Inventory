
import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { Product, Department, Unit, User, Permission, InventoryFormConfig, Transaction } from '../types';
import { CATEGORIES, DEPARTMENTS, UNITS } from '../constants';
import { 
  Edit2, 
  Trash2, 
  Sparkles, 
  Loader2,
  X,
  Package2,
  Tags,
  Building2,
  FileSpreadsheet,
  Printer,
  PlusCircle,
  MinusCircle,
  Scale,
  Hash,
  Truck,
  MapPin,
  Calendar,
  AlertCircle,
  ArrowDownCircle,
  ArrowUpCircle,
  Wallet
} from 'lucide-react';
import { geminiService } from '../services/geminiService';

interface InventoryListProps {
  products: Product[];
  transactions: Transaction[];
  activeDepartment: Department;
  onUpdate: (p: Product, tx?: any) => void;
  onAdd: (p: Product) => void;
  onDelete: (id: string) => void;
  user: User;
  formConfig: InventoryFormConfig;
}

const InventoryList: React.FC<InventoryListProps> = ({ products, transactions, activeDepartment, onUpdate, onAdd, onDelete, user, formConfig }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStockOpModalOpen, setIsStockOpModalOpen] = useState(false);
  const [stockOpType, setStockOpType] = useState<'add' | 'issue'>('add');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [stockOpAmount, setStockOpAmount] = useState(0);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const listTotals = useMemo(() => {
    return products.reduce((acc, p) => ({
      totalIn: acc.totalIn + (p.totalReceived || 0),
      totalOut: acc.totalOut + (p.totalIssued || 0),
      balance: acc.balance + (p.quantity || 0)
    }), { totalIn: 0, totalOut: 0, balance: 0 });
  }, [products]);

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    category: CATEGORIES[0],
    department: activeDepartment === 'All' ? DEPARTMENTS[0] : activeDepartment,
    unit: 'Pieces',
    sku: '',
    price: 0,
    quantity: 0,
    totalReceived: 0,
    totalIssued: 0,
    minStock: 0,
    description: '',
    batchNumber: '',
    supplier: '',
    location: '',
    expiryDate: ''
  });

  const hasPermission = (p: Permission) => user.permissions.includes(p);

  const handleStockOperation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    
    let newQuantity = selectedProduct.quantity;
    let newTotalReceived = selectedProduct.totalReceived || 0;
    let newTotalIssued = selectedProduct.totalIssued || 0;

    if (stockOpType === 'add') {
      newQuantity += stockOpAmount;
      newTotalReceived += stockOpAmount;
    } else {
      newQuantity = Math.max(0, newQuantity - stockOpAmount);
      newTotalIssued += stockOpAmount;
    }

    onUpdate({ 
      ...selectedProduct, 
      quantity: newQuantity, 
      totalReceived: newTotalReceived,
      totalIssued: newTotalIssued,
      updatedAt: new Date().toISOString() 
    }, {
      type: stockOpType === 'add' ? 'IN' : 'OUT',
      qty: stockOpAmount,
      rem: `Quick ${stockOpType} operation`
    });
    setIsStockOpModalOpen(false);
    setStockOpAmount(0);
  };

  const handleGenerateDescription = async () => {
    if (!formData.name) return;
    setLoadingAI(true);
    const desc = await geminiService.generateProductDescription(formData.name, formData.category || '', formData.department || 'Admin');
    setFormData(prev => ({ ...prev, description: desc }));
    setLoadingAI(false);
  };

  const exportToExcelMultiSheet = () => {
    const wb = XLSX.utils.book_new();
    const timestamp = new Date().toLocaleString();

    // Sheet 1: Master Inventory with Heading
    const masterData = products.map(p => ({
      'Item Name': p.name,
      'SKU': p.sku,
      'Category': p.category,
      'Department': p.department,
      'Price (₹)': p.price,
      'Qty In (Add)': p.totalReceived,
      'Qty Out (Issue)': p.totalIssued,
      'Available Balance': p.quantity,
      'Unit': p.unit,
      'Location': p.location || '-',
      'Status': p.quantity <= p.minStock ? 'LOW STOCK' : 'OK'
    }));
    
    const wsMaster = XLSX.utils.aoa_to_sheet([
      [`INVENTORY BALANCE REPORT - ${activeDepartment.toUpperCase()}`],
      [`Generated on: ${timestamp}`],
      []
    ]);
    XLSX.utils.sheet_add_json(wsMaster, masterData, { origin: "A4", skipHeader: false });
    XLSX.utils.book_append_sheet(wb, wsMaster, "Inventory Balance");

    // Sheet 2: Stock Entry History with Heading
    const additionData = transactions
      .filter(t => t.type === 'IN')
      .map(t => ({
        'Date': new Date(t.date).toLocaleString(),
        'Item': t.productName,
        'Qty Added': t.quantity,
        'Ref/Source': t.reference || '-',
        'Remarks': t.remarks || '-',
        'Posted By': t.user
      }));
    
    const wsAdditions = XLSX.utils.aoa_to_sheet([
      [`STOCK RECEIPT LOG (ADDITIONS) - ${activeDepartment.toUpperCase()}`],
      [`Generated on: ${timestamp}`],
      []
    ]);
    XLSX.utils.sheet_add_json(wsAdditions, additionData, { origin: "A4", skipHeader: false });
    XLSX.utils.book_append_sheet(wb, wsAdditions, "Stock Entry History");

    // Sheet 3: Stock Issue History with Heading
    const issueData = transactions
      .filter(t => t.type === 'OUT')
      .map(t => ({
        'Date': new Date(t.date).toLocaleString(),
        'Item': t.productName,
        'Qty Issued': t.quantity,
        'Target Dept': t.department,
        'Remarks': t.remarks || '-',
        'Issued By': t.user
      }));
    
    const wsIssues = XLSX.utils.aoa_to_sheet([
      [`STOCK ISSUANCE LOG (CONSUMPTION) - ${activeDepartment.toUpperCase()}`],
      [`Generated on: ${timestamp}`],
      []
    ]);
    XLSX.utils.sheet_add_json(wsIssues, issueData, { origin: "A4", skipHeader: false });
    XLSX.utils.book_append_sheet(wb, wsIssues, "Stock Issue History");

    // Generate File
    XLSX.writeFile(wb, `${activeDepartment}_Inventory_Ledger_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const renderInputField = (fieldId: string, icon: React.ReactNode, type: string = "text", placeholder: string = "") => {
    const fieldSetting = formConfig.fields.find(f => f.id === fieldId);
    if (!fieldSetting || !fieldSetting.isEnabled) return null;

    return (
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
          {icon} {fieldSetting.label} {fieldSetting.isRequired && <span className="text-rose-500">*</span>}
        </label>
        <input 
          type={type} required={fieldSetting.isRequired} placeholder={placeholder}
          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-black font-medium"
          value={(formData as any)[fieldId] || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, [fieldId]: e.target.value }))}
        />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 no-print">
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-white rounded-xl shadow-sm"><ArrowDownCircle className="w-6 h-6 text-emerald-600" /></div>
          <div><p className="text-[10px] font-black text-emerald-800/50 uppercase tracking-wider">Total Received (Add)</p><p className="text-2xl font-black text-emerald-700">{listTotals.totalIn}</p></div>
        </div>
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-white rounded-xl shadow-sm"><ArrowUpCircle className="w-6 h-6 text-rose-600" /></div>
          <div><p className="text-[10px] font-black text-rose-800/50 uppercase tracking-wider">Total Issued (Issue)</p><p className="text-2xl font-black text-rose-700">{listTotals.totalOut}</p></div>
        </div>
        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-white rounded-xl shadow-sm"><Wallet className="w-6 h-6 text-indigo-600" /></div>
          <div><p className="text-[10px] font-black text-indigo-800/50 uppercase tracking-wider">Available Balance</p><p className="text-2xl font-black text-indigo-700">{listTotals.balance}</p></div>
        </div>
      </div>

      <div className="flex justify-between items-center no-print">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 uppercase tracking-tight">
          <Building2 className="w-5 h-5 text-indigo-600" /> Stock Master View
        </h2>
        <div className="flex gap-2">
          {hasPermission('REPORTS_EXPORT') && (
            <button onClick={exportToExcelMultiSheet} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all">
              <FileSpreadsheet className="w-4 h-4" /> Export Excel (Headings)
            </button>
          )}
          {hasPermission('REPORTS_PRINT') && (
            <button onClick={() => window.print()} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[850px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Material / SKU</th>
              <th className="px-4 py-4 text-xs font-bold text-emerald-600 uppercase text-center bg-emerald-50/30">Qty In (Add)</th>
              <th className="px-4 py-4 text-xs font-bold text-rose-600 uppercase text-center bg-rose-50/30">Qty Out (Issue)</th>
              <th className="px-6 py-4 text-xs font-bold text-indigo-700 uppercase bg-indigo-50/30">Net Balance</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right no-print">Ops</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-20 text-center text-slate-400">Ledger empty.</td></tr>
            ) : products.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col"><span className="font-semibold text-slate-900">{product.name}</span><span className="text-[10px] text-slate-400 font-mono tracking-wider">{product.sku}</span></div>
                </td>
                <td className="px-4 py-4 text-center font-bold text-emerald-600">{product.totalReceived || 0}</td>
                <td className="px-4 py-4 text-center font-bold text-rose-500">{product.totalIssued || 0}</td>
                <td className="px-6 py-4 font-black text-indigo-700">
                  <div className="flex items-baseline gap-1"><span className="text-base">{product.quantity}</span><span className="text-[10px] font-medium text-slate-400 uppercase">{product.unit}</span></div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${product.quantity <= product.minStock ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {product.quantity <= product.minStock ? 'LOW' : 'OK'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right no-print">
                  <div className="flex items-center justify-end gap-1.5">
                    {hasPermission('STOCK_IN') && <button onClick={() => { setSelectedProduct(product); setStockOpType('add'); setIsStockOpModalOpen(true); }} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"><PlusCircle className="w-5 h-5" /></button>}
                    {hasPermission('STOCK_OUT') && <button onClick={() => { setSelectedProduct(product); setStockOpType('issue'); setIsStockOpModalOpen(true); }} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"><MinusCircle className="w-5 h-5" /></button>}
                    {hasPermission('INV_EDIT') && <button onClick={() => { setEditingProduct(product); setFormData(product); setIsModalOpen(true); }} className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg"><Edit2 className="w-5 h-5" /></button>}
                    {hasPermission('INV_DELETE') && <button onClick={() => onDelete(product.id)} className="p-2 text-slate-300 hover:text-rose-600 rounded-lg"><Trash2 className="w-5 h-5" /></button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          {products.length > 0 && (
            <tfoot className="bg-slate-900 text-white font-bold">
              <tr>
                <td className="px-6 py-4 text-xs uppercase tracking-widest text-slate-400">Grand Totals</td>
                <td className="px-4 py-4 text-center text-emerald-400">{listTotals.totalIn}</td>
                <td className="px-4 py-4 text-center text-rose-400">{listTotals.totalOut}</td>
                <td className="px-6 py-4 text-indigo-300">{listTotals.balance}</td>
                <td colSpan={2} className="no-print"></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <div className="flex justify-end pt-4 no-print">
         {hasPermission('INV_ADD') && (
           <button onClick={() => { setEditingProduct(null); setFormData({ name: '', category: CATEGORIES[0], department: activeDepartment === 'All' ? DEPARTMENTS[0] : activeDepartment, unit: 'Pieces', sku: '', price: 0, quantity: 0, totalReceived: 0, totalIssued: 0, minStock: 0, description: '', batchNumber: '', supplier: '', location: '', expiryDate: '' }); setIsModalOpen(true); }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold shadow-lg transition-all">Register New Item</button>
         )}
      </div>

      {isStockOpModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-8 space-y-6">
             <div className="text-center"><h3 className="text-xl font-bold text-slate-900">{stockOpType === 'add' ? 'Receipt' : 'Issue'}</h3><p className="text-sm text-slate-500">{selectedProduct.name}</p></div>
             <form onSubmit={handleStockOperation} className="space-y-4">
                <input autoFocus type="number" min="1" className="w-full px-6 py-4 text-center text-4xl font-black bg-slate-50 border border-slate-200 rounded-2xl outline-none" value={stockOpAmount} onChange={(e) => setStockOpAmount(parseInt(e.target.value) || 0)} />
                <div className="flex gap-2">
                  <button type="button" onClick={() => setIsStockOpModalOpen(false)} className="flex-1 py-3 text-slate-500 font-bold">Cancel</button>
                  <button type="submit" className={`flex-1 py-3 text-white font-bold rounded-xl shadow-lg ${stockOpType === 'add' ? 'bg-emerald-600 shadow-emerald-100' : 'bg-rose-600 shadow-rose-100'}`}>Submit</button>
                </div>
             </form>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-900">{editingProduct ? 'Update Item' : 'Register New Item'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full"><X /></button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (editingProduct) onUpdate({ ...editingProduct, ...formData as Product, updatedAt: new Date().toISOString() });
              else onAdd({ ...formData as Product, id: Math.random().toString(36).substr(2, 9), updatedAt: new Date().toISOString() });
              setIsModalOpen(false);
            }} className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {renderInputField('name', <Tags className="w-3 h-3" />, "text", "Material name")}
                {renderInputField('sku', <Hash className="w-3 h-3" />, "text", "SKU / Code")}
                {formConfig.fields.find(f => f.id === 'category')?.isEnabled && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Category</label>
                    <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={formData.category} onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}>
                      {CATEGORIES.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                )}
                {renderInputField('quantity', <Package2 className="w-3 h-3" />, "number", "Opening balance")}
                {formConfig.fields.find(f => f.id === 'unit')?.isEnabled && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Unit</label>
                    <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={formData.unit} onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value as Unit }))}>
                      {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                )}
                {renderInputField('price', <Scale className="w-3 h-3" />, "number", "Unit rate")}
                {renderInputField('minStock', <AlertCircle className="w-3 h-3" />, "number", "Safety level")}
                {renderInputField('batchNumber', <Hash className="w-3 h-3" />, "text", "Lot No")}
                {renderInputField('supplier', <Truck className="w-3 h-3" />, "text", "Vendor")}
                {renderInputField('location', <MapPin className="w-3 h-3" />, "text", "Rack Location")}
                {renderInputField('expiryDate', <Calendar className="w-3 h-3" />, "date")}
              </div>
              <div className="pt-4 sticky bottom-0 bg-white">
                <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl transition-all uppercase tracking-widest">Commit Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryList;
