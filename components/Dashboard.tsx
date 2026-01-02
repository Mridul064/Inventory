
import React, { useState, useEffect } from 'react';
import { Product, Department, User } from '../types';
import { 
  TrendingUp, 
  AlertTriangle, 
  DollarSign, 
  Package,
  Sparkles,
  Loader2,
  Building2
} from 'lucide-react';
import { geminiService } from '../services/geminiService';

interface DashboardProps {
  products: Product[];
  department: Department;
  user: User;
  stats: {
    totalItems: number;
    lowStockCount: number;
    totalValue: number;
    uniqueCategories: number;
  };
}

const Dashboard: React.FC<DashboardProps> = ({ products, stats, department, user }) => {
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  const fetchInsights = async () => {
    setLoadingInsights(true);
    const data = await geminiService.getInventoryInsights(products, department);
    setAiInsights(data);
    setLoadingInsights(false);
  };

  useEffect(() => {
    fetchInsights();
  }, [department]);

  const metricCards = [
    { label: `${department} Units`, value: stats.totalItems, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Low Stock Items', value: stats.lowStockCount, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Asset Value', value: `₹${stats.totalValue.toLocaleString('en-IN')}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Categories', value: stats.uniqueCategories, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{card.label}</p>
                <h3 className="text-2xl font-bold text-slate-900">{card.value}</h3>
              </div>
              <div className={`p-3 rounded-xl ${card.bg}`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              <h2 className="font-semibold text-slate-900">{department === 'All' ? 'Global' : department} Strategic Analysis</h2>
            </div>
            <button 
              onClick={fetchInsights}
              disabled={loadingInsights}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
            >
              {loadingInsights ? 'Analyzing...' : 'Refresh AI'}
            </button>
          </div>
          <div className="p-6 flex-1 min-h-[300px]">
            {loadingInsights ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                <p className="text-sm">Gemini is processing {department} metrics...</p>
              </div>
            ) : aiInsights ? (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Operational Summary</h4>
                  <p className="text-slate-600 leading-relaxed text-sm">{aiInsights.summary}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Priority Restocks</h4>
                    <ul className="space-y-2">
                      {aiInsights.priorities.map((item: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-600 p-2 bg-slate-50 rounded-lg">
                          <span className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Risk Assessment</h4>
                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-amber-900 text-xs italic">
                      "{aiInsights.trendPrediction}"
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 italic">
                Analyze your department to see AI insights.
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Critical {department === 'All' ? '' : department} Items</h2>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="p-4 flex-1 space-y-3 overflow-y-auto max-h-[400px]">
            {products.filter(p => p.quantity <= p.minStock).length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm">
                All {department} stock is optimal.
              </div>
            ) : (
              products
                .filter(p => p.quantity <= p.minStock)
                .sort((a, b) => a.quantity - b.quantity)
                .map(product => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/50">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{product.name}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500">{product.category}</span>
                        {department === 'All' && (
                          <span className="text-[10px] font-bold text-indigo-500 uppercase">{product.department}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`text-xs font-bold ${product.quantity === 0 ? 'text-rose-600' : 'text-amber-600'}`}>
                        {product.quantity} {product.unit}
                      </span>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
