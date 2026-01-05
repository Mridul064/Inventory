
import React, { useState } from 'react';
import { Product, User, Department } from '../types';
import { 
  PackageMinus, 
  Calendar, 
  Box, 
  Hash, 
  UserCircle, 
  Building2, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface StockIssueProps {
  products: Product[];
  onUpdate: (p: Product, tx?: any) => void;
  user: User;
  departments: Department[];
}

const StockIssue: React.FC<StockIssueProps> = ({ products, onUpdate, user, departments }) => {
  const [formData, setFormData] = useState({
    productId: '',
    quantity: 0,
    date: new Date().toISOString().split('T')[0],
    issueTo: '',
    targetDept: '',
    remarks: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const selectedProduct = products.find(p => p.id === formData.productId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!selectedProduct) return;
    if (formData.quantity > selectedProduct.quantity) {
      setError(`Insufficient balance: ${selectedProduct.quantity} ${selectedProduct.unit} available.`);
      return;
    }

    const updatedProduct: Product = {
      ...selectedProduct,
      quantity: selectedProduct.quantity - formData.quantity,
      totalIssued: (selectedProduct.totalIssued || 0) + formData.quantity,
      updatedAt: new Date().toISOString()
    };

    onUpdate(updatedProduct, {
      type: 'OUT',
      qty: formData.quantity,
      ref: formData.issueTo,
      rem: formData.remarks,
      dept: formData.targetDept
    });

    setShowSuccess(true);
    setFormData({ productId: '', quantity: 0, date: new Date().toISOString().split('T')[0], issueTo: '', targetDept: '', remarks: '' });
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="bg-rose-600 p-8 text-white">
          <div className="flex items-center gap-3 mb-2"><PackageMinus className="w-8 h-8" /><h2 className="text-2xl font-bold">Stock Issue Voucher</h2></div>
          <p className="text-rose-100 text-sm">Post deductions for consumption or internal use.</p>
        </div>

        {showSuccess && (
          <div className="m-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5" /><span className="font-bold">Issue Recorded & Balance Updated</span>
          </div>
        )}

        {error && (
          <div className="m-6 p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5" /><span className="font-bold">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> Issue Date</label>
              <input type="date" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><Building2 className="w-3.5 h-3.5" /> Issuing to Dept</label>
              <select required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={formData.targetDept} onChange={e => setFormData({...formData, targetDept: e.target.value})}>
                <option value="">Select Dept...</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><Box className="w-3.5 h-3.5" /> Item Name</label>
            <select required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={formData.productId} onChange={e => setFormData({...formData, productId: e.target.value})}>
              <option value="">Choose item...</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} (Available: {p.quantity})</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><Hash className="w-3.5 h-3.5" /> Issue Qty</label>
              <input type="number" required min="1" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseFloat(e.target.value) || 0})} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><UserCircle className="w-3.5 h-3.5" /> Issued To (Person)</label>
              <input type="text" placeholder="Full name" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={formData.issueTo} onChange={e => setFormData({...formData, issueTo: e.target.value})} />
            </div>
          </div>

          <button type="submit" className="w-full py-4 bg-rose-600 text-white font-black rounded-2xl hover:bg-rose-700 shadow-xl shadow-rose-100 uppercase tracking-widest transition-all">Deduct & Record Issue</button>
        </form>
      </div>
    </div>
  );
};

export default StockIssue;
