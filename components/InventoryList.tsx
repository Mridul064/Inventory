
import React, { useState } from 'react';
import { Product, Department, Unit, User, Permission, InventoryFormConfig } from '../types';
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
  Download,
  Printer,
  PlusCircle,
  MinusCircle,
  History,
  Scale,
  Hash,
  Truck,
  MapPin,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { geminiService } from '../services/geminiService';

interface InventoryListProps {
  products: Product[];
  activeDepartment: Department;
  onUpdate: (p: Product) => void;
  onAdd: (p: Product) => void;
  onDelete: (id: string) => void;
  user: User;
  formConfig: InventoryFormConfig;
}

const InventoryList: React.FC<InventoryListProps> = ({ products, activeDepartment, onUpdate, onAdd, onDelete, user, formConfig }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStockOpModalOpen, setIsStockOpModalOpen] = useState(false);
  const [stockOpType, setStockOpType] = useState<'add' | 'issue'>('add');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [stockOpAmount, setStockOpAmount] = useState(0);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    category: CATEGORIES[0],
    department: activeDepartment === 'All' ? DEPARTMENTS[0] : activeDepartment,
    unit: 'Pieces',
    sku: '',
    price: 0,
    quantity: 0,
    minStock: 0,
    description: '',
    batchNumber: '',
    supplier: '',
    location: '',
    expiryDate: ''
  });

  const hasPermission = (p: Permission) => user.permissions.includes(p);

  const isFieldEnabled = (fieldId: string) => {
    return formConfig.fields.find(f => f.id === fieldId)?.isEnabled ?? false;
  };

  const isFieldRequired = (fieldId: string) => {
    return formConfig.fields.find(f => f.id === fieldId)?.isRequired ?? false;
  };

  const handleStockOperation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    const newQuantity = stockOpType === 'add' 
      ? selectedProduct.quantity + stockOpAmount
      : Math.max(0, selectedProduct.quantity - stockOpAmount);
    onUpdate({ ...selectedProduct, quantity: newQuantity, updatedAt: new Date().toISOString() });
    setIsStockOpModalOpen(false);
    setStockOpAmount(0);
  };

  const handleGenerateDescription = async () => {
    if (!formData.name) return;
    setLoadingAI(true);
    const desc = await geminiService.generateProductDescription(
      formData.name, formData.category || '', formData.department || 'Admin'
    );
    setFormData(prev => ({ ...prev, description: desc }));
    setLoadingAI(false);
  };

  const exportToCSV = () => {
    const headers = ['Name', 'SKU', 'Batch', 'Category', 'Dept', 'Price', 'Qty'];
    const rows = products.map(p => [p.name, p.sku, p.batchNumber || '-', p.category, p.department, p.price, p.quantity]);
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Inventory_${activeDepartment}.csv`);
    link.click();
  };

  const renderInputField = (fieldId: string, icon: React.ReactNode, type: string = "text", placeholder: string = "") => {
    if (!isFieldEnabled(fieldId)) return null;

    const fieldSetting = formConfig.fields.find(f => f.id === fieldId);
    if (!fieldSetting) return null;

    return (
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
          {icon}
          {fieldSetting.label}
          {fieldSetting.isRequired && <span className="text-rose-500">*</span>}
        </label>
        <input 
          type={type}
          required={fieldSetting.isRequired}
          placeholder={placeholder}
          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          value={(formData as any)[fieldId] || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, [fieldId]: e.target.value }))}
        />
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center no-print">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 uppercase tracking-tight">
          <Building2 className="w-5 h-5 text-indigo-600" />
          {activeDepartment} Inventory Ledger
        </h2>
        <div className="flex gap-2">
          {hasPermission('REPORTS_EXPORT') && (
            <button onClick={exportToCSV} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 shadow-sm transition-colors">
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
          )}
          {hasPermission('REPORTS_PRINT') && (
            <button onClick={() => window.print()} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 shadow-sm transition-colors">
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Material / SKU</th>
              {isFieldEnabled('batchNumber') && <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Batch</th>}
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Stock Balance</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Alert Level</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right no-print">Ops</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-20 text-center text-slate-400">Empty Ledger. Start by adding items.</td></tr>
            ) : products.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-900">{product.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono tracking-wider">{product.sku}</span>
                  </div>
                </td>
                {isFieldEnabled('batchNumber') && (
                  <td className="px-6 py-4">
                    <span className="text-xs font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{product.batchNumber || 'N/A'}</span>
                  </td>
                )}
                <td className="px-6 py-4">
                  <div className="flex items-baseline gap-1">
                    <span className={`text-lg font-bold ${product.quantity <= product.minStock ? 'text-rose-600' : 'text-indigo-600'}`}>{product.quantity}</span>
                    <span className="text-xs font-medium text-slate-400">{product.unit}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${product.quantity <= product.minStock ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {product.quantity <= product.minStock ? `LOW < ${product.minStock}` : 'HEALTHY'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right no-print">
                  <div className="flex items-center justify-end gap-1.5">
                    {hasPermission('STOCK_IN') && (
                      <button onClick={() => { setSelectedProduct(product); setStockOpType('add'); setIsStockOpModalOpen(true); }} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"><PlusCircle className="w-5 h-5" /></button>
                    )}
                    {hasPermission('STOCK_OUT') && (
                      <button onClick={() => { setSelectedProduct(product); setStockOpType('issue'); setIsStockOpModalOpen(true); }} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-all"><MinusCircle className="w-5 h-5" /></button>
                    )}
                    {hasPermission('INV_EDIT') && (
                      <button onClick={() => { setEditingProduct(product); setFormData(product); setIsModalOpen(true); }} className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg"><Edit2 className="w-5 h-5" /></button>
                    )}
                    {hasPermission('INV_DELETE') && (
                      <button onClick={() => onDelete(product.id)} className="p-2 text-slate-300 hover:text-rose-600 rounded-lg"><Trash2 className="w-5 h-5" /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end pt-4 no-print">
         {hasPermission('INV_ADD') && (
           <button onClick={() => { setEditingProduct(null); setFormData({ name: '', category: CATEGORIES[0], department: activeDepartment === 'All' ? DEPARTMENTS[0] : activeDepartment, unit: 'Pieces', sku: '', price: 0, quantity: 1, minStock: 0, description: '', batchNumber: '', supplier: '', location: '', expiryDate: '' }); setIsModalOpen(true); }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold shadow-lg transition-all">
             New Asset Entry
           </button>
         )}
      </div>

      {/* Stock Transaction Modal */}
      {isStockOpModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-8 space-y-6">
             <div className="text-center">
                <h3 className="text-xl font-bold text-slate-900">{stockOpType === 'add' ? 'Material Receipt' : 'Stock Issuance'}</h3>
                <p className="text-sm text-slate-500">{selectedProduct.name}</p>
             </div>
             <form onSubmit={handleStockOperation} className="space-y-4">
                <input autoFocus type="number" min="1" className="w-full px-6 py-4 text-center text-4xl font-black bg-slate-50 border border-slate-200 rounded-2xl outline-none" value={stockOpAmount} onChange={(e) => setStockOpAmount(parseInt(e.target.value) || 0)} />
                <div className="flex gap-2">
                  <button type="button" onClick={() => setIsStockOpModalOpen(false)} className="flex-1 py-3 text-slate-500 font-bold">Cancel</button>
                  <button type="submit" className={`flex-1 py-3 text-white font-bold rounded-xl shadow-lg ${stockOpType === 'add' ? 'bg-emerald-600 shadow-emerald-100' : 'bg-rose-600 shadow-rose-100'}`}>Post Entry</button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* DYNAMIC Asset Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-900">{editingProduct ? 'Edit Asset Record' : 'Material Registration'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full"><X /></button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              if (editingProduct) { onUpdate({ ...editingProduct, ...formData as Product, updatedAt: new Date().toISOString() }); }
              else { onAdd({ ...formData as Product, id: Math.random().toString(36).substr(2, 9), updatedAt: new Date().toISOString() }); }
              setIsModalOpen(false);
            }} className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
              
              {/* Dynamic Form Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                
                {/* Always show Name if configured, but logically always needed */}
                {renderInputField('name', <Tags className="w-3 h-3" />, "text", "e.g. Copper Wire 4mm")}
                {renderInputField('sku', <Hash className="w-3 h-3" />, "text", "SKU or Part Number")}

                {isFieldEnabled('category') && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Category</label>
                    <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm" value={formData.category} onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}>
                      {CATEGORIES.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                )}

                {renderInputField('quantity', <Package2 className="w-3 h-3" />, "number", "0")}

                {isFieldEnabled('unit') && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Unit (UOM)</label>
                    <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm" value={formData.unit} onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value as Unit }))}>
                      {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                )}

                {renderInputField('price', <Scale className="w-3 h-3" />, "number", "Price in ₹")}
                {/* Fix: Added missing AlertCircle import from lucide-react */}
                {renderInputField('minStock', <AlertCircle className="w-3 h-3 text-rose-400" />, "number", "Stock threshold")}
                {renderInputField('batchNumber', <Hash className="w-3 h-3" />, "text", "Batch / Lot code")}
                {renderInputField('supplier', <Truck className="w-3 h-3" />, "text", "Vendor name")}
                {renderInputField('location', <MapPin className="w-3 h-3" />, "text", "Rack or Bin location")}
                {renderInputField('expiryDate', <Calendar className="w-3 h-3" />, "date")}

              </div>

              {isFieldEnabled('description') && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Material Remarks</label>
                    {hasPermission('AI_DESC_GEN') && (
                      <button type="button" onClick={handleGenerateDescription} disabled={loadingAI || !formData.name} className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 disabled:opacity-50">
                        {loadingAI ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} AI FILL
                      </button>
                    )}
                  </div>
                  <textarea rows={2} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none resize-none text-sm" placeholder="Additional notes..." value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} />
                </div>
              )}

              <div className="pt-4 sticky bottom-0 bg-white">
                <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all">
                  Commit To Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryList;
