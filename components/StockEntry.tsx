
import React, { useState } from 'react';
import { Product, User } from '../types';
import { 
  PackagePlus, 
  Calendar, 
  Box, 
  Hash, 
  IndianRupee, 
  FileText, 
  CheckCircle2
} from 'lucide-react';

interface StockEntryProps {
  products: Product[];
  onUpdate: (p: Product, tx?: any) => void;
  user: User;
}

const StockEntry: React.FC<StockEntryProps> = ({ products, onUpdate, user }) => {
  const [formData, setFormData] = useState({
    productId: '',
    quantity: 0,
    price: 0,
    date: new Date().toISOString().split('T')[0],
    reference: '',
    remarks: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const selectedProduct = products.find(p => p.id === formData.productId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const updatedProduct: Product = {
      ...selectedProduct,
      quantity: selectedProduct.quantity + formData.quantity,
      totalReceived: (selectedProduct.totalReceived || 0) + formData.quantity,
      price: formData.price > 0 ? formData.price : selectedProduct.price,
      updatedAt: new Date().toISOString()
    };

    onUpdate(updatedProduct, {
      type: 'IN',
      qty: formData.quantity,
      ref: formData.reference,
      rem: formData.remarks
    });

    setShowSuccess(true);
    setFormData({
      productId: '',
      quantity: 0,
      price: 0,
      date: new Date().toISOString().split('T')[0],
      reference: '',
      remarks: ''
    });

    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="bg-indigo-600 p-8 text-white">
          <div className="flex items-center gap-3 mb-2"><PackagePlus className="w-8 h-8" /><h2 className="text-2xl font-bold">Stock Entry (Purchase)</h2></div>
          <p className="text-indigo-100 text-sm">Log material additions to the master ledger.</p>
        </div>

        {showSuccess && (
          <div className="m-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl flex items-center gap-3 animate-in zoom-in duration-300">
            <CheckCircle2 className="w-5 h-5" /><span className="font-bold">Entry Logged Successfully</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> Date</label>
              <input type="date" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><FileText className="w-3.5 h-3.5" /> Ref No / Bill No</label>
              <input type="text" placeholder="INV-001" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={formData.reference} onChange={e => setFormData({...formData, reference: e.target.value})} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><Box className="w-3.5 h-3.5" /> Material</label>
            <select required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={formData.productId} onChange={e => {
                const p = products.find(x => x.id === e.target.value);
                setFormData({...formData, productId: e.target.value, price: p?.price || 0});
              }}>
              <option value="">Select item...</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><Hash className="w-3.5 h-3.5" /> Quantity</label>
              <input type="number" required min="1" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseFloat(e.target.value) || 0})} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><IndianRupee className="w-3.5 h-3.5" /> New Price (Optional)</label>
              <input type="number" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})} />
            </div>
          </div>

          <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 uppercase tracking-widest transition-all">Submit Receipt</button>
        </form>
      </div>
    </div>
  );
};

export default StockEntry;
