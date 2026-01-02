
import React, { useState } from 'react';
import { Indent, Product, User, Department, Unit, Permission } from '../types';
import { 
  ClipboardList, 
  Plus, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Search,
  AlertCircle,
  Building2,
  Scale
} from 'lucide-react';

interface IndentsProps {
  indents: Indent[];
  products: Product[];
  user: User;
  onAddIndent: (indent: Indent) => void;
  onUpdateStatus: (id: string, status: Indent['status']) => void;
}

const Indents: React.FC<IndentsProps> = ({ indents, products, user, onAddIndent, onUpdateStatus }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    quantity: 1,
    priority: 'medium' as Indent['priority']
  });

  const hasPermission = (p: Permission) => user.permissions.includes(p);

  const filteredIndents = hasPermission('GLOBAL_ACCESS')
    ? indents 
    : indents.filter(i => i.department === user.department);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find(p => p.id === formData.productId);
    if (!product) return;

    const newIndent: Indent = {
      id: Math.random().toString(36).substr(2, 9),
      productId: product.id,
      productName: product.name,
      department: user.department,
      quantity: formData.quantity,
      unit: product.unit,
      priority: formData.priority,
      status: 'pending',
      requestedBy: user.name,
      createdAt: new Date().toISOString()
    };

    onAddIndent(newIndent);
    setIsModalOpen(false);
  };

  const getStatusColor = (status: Indent['status']) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'approved': return 'bg-blue-100 text-blue-700';
      case 'fulfilled': return 'bg-emerald-100 text-emerald-700';
      case 'cancelled': return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-indigo-600" />
          Material Indents (Requisitions)
        </h2>
        {hasPermission('IND_CREATE') && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
          >
            <Plus className="w-4 h-4" />
            Create New Indent
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Item Details</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Qty Req.</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredIndents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-400">
                    No active indents found.
                  </td>
                </tr>
              ) : filteredIndents.map((indent) => (
                <tr key={indent.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900">{indent.productName}</span>
                      <span className="text-[10px] text-slate-400">Req by: {indent.requestedBy} • {new Date(indent.createdAt).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px] font-bold uppercase">
                      {indent.department}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-bold text-slate-700">{indent.quantity}</span>
                      <span className="text-[10px] font-medium text-slate-400">{indent.unit}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getStatusColor(indent.status)}`}>
                      {indent.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {hasPermission('IND_APPROVE') && indent.status === 'pending' && (
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => onUpdateStatus(indent.id, 'approved')}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Approve"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        {hasPermission('IND_REJECT') && (
                          <button 
                            onClick={() => onUpdateStatus(indent.id, 'cancelled')}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Reject"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    )}
                    {indent.status === 'approved' && hasPermission('IND_FULFILL') && (
                      <button 
                        onClick={() => onUpdateStatus(indent.id, 'fulfilled')}
                        className="text-xs font-bold text-indigo-600 hover:underline"
                      >
                        Mark Fulfilled
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">New Requisition (Indent)</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Select Product</label>
                <select 
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.productId}
                  onChange={(e) => setFormData(prev => ({ ...prev, productId: e.target.value }))}
                >
                  <option value="">Choose an item...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (In Store: {p.quantity} {p.unit})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Required Quantity</label>
                  <div className="relative">
                    <input 
                      type="number"
                      min="1"
                      required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={formData.quantity}
                      onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 uppercase">
                      {products.find(p => p.id === formData.productId)?.unit || 'Units'}
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Priority</label>
                  <select 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">Urgent</option>
                  </select>
                </div>
              </div>
              <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 flex gap-3">
                <AlertCircle className="w-5 h-5 text-indigo-500 shrink-0" />
                <p className="text-xs text-indigo-700 leading-relaxed">
                  Creating an indent alerts the Store Manager. Units are fixed based on the registered item specification (KG, Gram, Pieces, etc).
                </p>
              </div>
              <button 
                type="submit"
                className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
              >
                Submit Requisition
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Indents;
