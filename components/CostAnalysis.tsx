
import React, { useState, useMemo } from 'react';
import { Transaction, Product, Department } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  Legend,
  Cell
} from 'recharts';
import { 
  Calendar, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  TrendingUp, 
  PieChart as PieChartIcon,
  IndianRupee,
  Layers,
  Clock,
  ChevronLeft,
  ChevronRight,
  Search,
  Box,
  ArrowRight,
  Filter
} from 'lucide-react';

interface CostAnalysisProps {
  products: Product[];
  transactions: Transaction[];
  activeDepartment: Department;
}

type AnalysisView = 'daily' | 'monthly' | 'yearly';

const CostAnalysis: React.FC<CostAnalysisProps> = ({ products, transactions, activeDepartment }) => {
  const [view, setView] = useState<AnalysisView>('monthly');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedProductId, setSelectedProductId] = useState<string | 'all'>('all');

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesDept = activeDepartment === 'All' || t.department === activeDepartment;
      const matchesProduct = selectedProductId === 'all' || t.productId === selectedProductId;
      return matchesDept && matchesProduct;
    });
  }, [transactions, activeDepartment, selectedProductId]);

  const selectedProduct = useMemo(() => 
    products.find(p => p.id === selectedProductId), 
    [products, selectedProductId]
  );

  const stats = useMemo(() => {
    const totalIn = filteredTransactions
      .filter(t => t.type === 'IN')
      .reduce((sum, t) => sum + (t.quantity * (t.priceAtTime || 0)), 0);
    
    const totalOut = filteredTransactions
      .filter(t => t.type === 'OUT')
      .reduce((sum, t) => sum + (t.quantity * (t.priceAtTime || 0)), 0);

    return { totalIn, totalOut };
  }, [filteredTransactions]);

  const chartData = useMemo(() => {
    if (view === 'monthly') {
      const months: Record<string, { name: string; costIn: number; costOut: number }> = {};
      const now = new Date();
      
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = d.toISOString().slice(0, 7);
        months[key] = { 
          name: d.toLocaleString('default', { month: 'short' }), 
          costIn: 0, 
          costOut: 0 
        };
      }

      filteredTransactions.forEach(t => {
        const key = t.date.slice(0, 7);
        if (months[key]) {
          const val = t.quantity * (t.priceAtTime || 0);
          if (t.type === 'IN') months[key].costIn += val;
          else months[key].costOut += val;
        }
      });

      return Object.values(months);
    } else if (view === 'yearly') {
      const year = selectedDate.getFullYear();
      const monthlyData = Array.from({ length: 12 }, (_, i) => ({
        name: new Date(year, i).toLocaleString('default', { month: 'short' }),
        costIn: 0,
        costOut: 0
      }));

      filteredTransactions.forEach(t => {
        const d = new Date(t.date);
        if (d.getFullYear() === year) {
          const val = t.quantity * (t.priceAtTime || 0);
          if (t.type === 'IN') monthlyData[d.getMonth()].costIn += val;
          else monthlyData[d.getMonth()].costOut += val;
        }
      });
      return monthlyData;
    } else {
      const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
      const dailyData = Array.from({ length: daysInMonth }, (_, i) => ({
        name: (i + 1).toString(),
        costIn: 0,
        costOut: 0
      }));

      filteredTransactions.forEach(t => {
        const d = new Date(t.date);
        if (d.getFullYear() === selectedDate.getFullYear() && d.getMonth() === selectedDate.getMonth()) {
          const val = t.quantity * (t.priceAtTime || 0);
          dailyData[d.getDate() - 1][t.type === 'IN' ? 'costIn' : 'costOut'] += val;
        }
      });
      return dailyData;
    }
  }, [view, filteredTransactions, selectedDate]);

  const productSpending = useMemo(() => {
    const itemCosts: Record<string, { id: string, name: string, value: number, category: string, qty: number }> = {};
    
    // Use ALL transactions for ranking, but respect department filter
    transactions
      .filter(t => activeDepartment === 'All' || t.department === activeDepartment)
      .filter(t => t.type === 'OUT')
      .forEach(t => {
        if (!itemCosts[t.productId]) {
          const p = products.find(prod => prod.id === t.productId);
          itemCosts[t.productId] = { 
            id: t.productId,
            name: t.productName, 
            value: 0, 
            category: p?.category || 'General',
            qty: 0
          };
        }
        itemCosts[t.productId].value += (t.quantity * (t.priceAtTime || 0));
        itemCosts[t.productId].qty += t.quantity;
      });

    return Object.values(itemCosts)
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [transactions, products, activeDepartment]);

  const categorySpending = useMemo(() => {
    const cats: Record<string, number> = {};
    filteredTransactions.filter(t => t.type === 'OUT').forEach(t => {
      const p = products.find(prod => prod.id === t.productId);
      const cat = p?.category || 'Unknown';
      cats[cat] = (cats[cat] || 0) + (t.quantity * (t.priceAtTime || 0));
    });
    return Object.entries(cats)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions, products]);

  const changeMonth = (offset: number) => {
    setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Header section with view toggle & Product Search */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
            <IndianRupee className="w-7 h-7 text-indigo-600" />
            Financial Analysis
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            {selectedProductId === 'all' 
              ? `Consolidated expenditure for ${activeDepartment === 'All' ? 'Global Stores' : activeDepartment}`
              : `Material-specific cost audit: ${selectedProduct?.name}`
            }
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group">
            <Box className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select 
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none cursor-pointer min-w-[200px]"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
            >
              <option value="all">View All Products</option>
              {products
                .filter(p => activeDepartment === 'All' || p.department === activeDepartment)
                .map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                ))}
            </select>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-200/50 rounded-xl">
            <button onClick={() => setView('daily')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${view === 'daily' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600'}`}>Daily</button>
            <button onClick={() => setView('monthly')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${view === 'monthly' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600'}`}>Trends</button>
            <button onClick={() => setView('yearly')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${view === 'yearly' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600'}`}>Yearly</button>
          </div>
        </div>
      </div>

      {/* Date Navigator */}
      {(view === 'daily' || view === 'yearly') && (
        <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-200 w-fit">
          <button onClick={() => changeMonth(view === 'yearly' ? -12 : -1)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors"><ChevronLeft className="w-5 h-5 text-slate-400" /></button>
          <div className="flex items-center gap-2 px-2">
            <Calendar className="w-4 h-4 text-indigo-500" />
            <span className="font-bold text-slate-700">
              {view === 'yearly' ? selectedDate.getFullYear() : selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
          </div>
          <button onClick={() => changeMonth(view === 'yearly' ? 12 : 1)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors"><ChevronRight className="w-5 h-5 text-slate-400" /></button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-600 rounded-3xl p-6 text-white shadow-xl shadow-emerald-100 flex items-center justify-between overflow-hidden relative">
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Receipt Value</p>
            <h3 className="text-3xl font-black">₹{stats.totalIn.toLocaleString('en-IN')}</h3>
            <p className="text-[10px] mt-4 font-bold bg-white/20 px-2 py-1 rounded w-fit uppercase">Total In-Flow</p>
          </div>
          <ArrowDownCircle className="w-20 h-20 opacity-10 absolute -right-4 -bottom-4" />
        </div>

        <div className="bg-rose-600 rounded-3xl p-6 text-white shadow-xl shadow-rose-100 flex items-center justify-between overflow-hidden relative">
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Issue Value</p>
            <h3 className="text-3xl font-black">₹{stats.totalOut.toLocaleString('en-IN')}</h3>
            <p className="text-[10px] mt-4 font-bold bg-white/20 px-2 py-1 rounded w-fit uppercase">Total Out-Flow</p>
          </div>
          <ArrowUpCircle className="w-20 h-20 opacity-10 absolute -right-4 -bottom-4" />
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
            {selectedProductId === 'all' ? <TrendingUp className="w-7 h-7" /> : <Box className="w-7 h-7" />}
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 truncate">
              {selectedProductId === 'all' ? 'Budget Utilization' : selectedProduct?.name}
            </p>
            <h3 className="text-xl font-bold text-slate-800">
              {selectedProductId === 'all' 
                ? (stats.totalIn > 0 ? ((stats.totalOut / stats.totalIn) * 100).toFixed(1) + '%' : '0%')
                : `₹${selectedProduct?.price || 0}/Unit`
              }
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase">
              {selectedProductId === 'all' ? 'Issue vs Receipt' : 'Last Recorded Price'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-500" />
              {selectedProductId === 'all' ? 'General Value Timeline' : `${selectedProduct?.name} Cost Trend`}
            </h3>
            {selectedProductId !== 'all' && (
              <button 
                onClick={() => setSelectedProductId('all')}
                className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 uppercase flex items-center gap-1"
              >
                Clear Filter <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }} tickFormatter={(val) => `₹${val >= 1000 ? val/1000 + 'k' : val}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                  formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Amount']}
                />
                <Legend iconType="circle" />
                <Area type="monotone" dataKey="costIn" name="Purchase Value" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIn)" />
                <Area type="monotone" dataKey="costOut" name="Consumption Value" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorOut)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Product-Wise Ranking List */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            Top Expensive Items
          </h3>
          <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-2">
            {productSpending.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs italic">
                No consumption records found.
              </div>
            ) : productSpending.map((item, idx) => (
              <button 
                key={item.id} 
                onClick={() => setSelectedProductId(item.id)}
                className={`w-full text-left p-3 rounded-2xl border transition-all hover:border-indigo-200 group ${selectedProductId === item.id ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-100'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-black text-slate-800 truncate pr-2 group-hover:text-indigo-600">{item.name}</span>
                  <span className="text-[10px] font-black text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded uppercase">Rank #{idx+1}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{item.category}</span>
                  <span className="text-sm font-black text-slate-900">₹{item.value.toLocaleString('en-IN')}</span>
                </div>
              </button>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
             <div className="flex flex-col">
               <span className="text-[10px] font-black text-slate-400 uppercase">Top Dept Spender</span>
               <span className="text-xs font-bold text-slate-700">{activeDepartment} Unit</span>
             </div>
             <Filter className="w-4 h-4 text-slate-300" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category breakdown (Still useful) */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-indigo-500" />
            Consumption by Category
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
             {categorySpending.map((cat, idx) => {
                const max = categorySpending[0]?.value || 1;
                const percent = (cat.value / max) * 100;
                return (
                  <div key={cat.name} className="space-y-1.5">
                    <div className="flex justify-between items-center text-[11px] font-bold">
                      <span className="text-slate-600">{cat.name}</span>
                      <span className="text-slate-900">₹{cat.value.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 rounded-full transition-all duration-1000" 
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
             })}
          </div>
        </div>

        {/* Audit Summary */}
        <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden flex flex-col justify-center">
          <div className="relative z-10 space-y-4">
             <h3 className="text-lg font-black uppercase tracking-tight text-indigo-400">Ledger Financial Health</h3>
             <p className="text-sm text-slate-400 leading-relaxed font-medium">
               This analysis reflects real-time material movement valuations based on recorded unit prices at the time of entry. Total Asset exposure is calculated using current available balance and unit rate.
             </p>
             <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                   <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Total SKU's Tracked</p>
                   <p className="text-xl font-black">{products.filter(p => activeDepartment === 'All' || p.department === activeDepartment).length}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                   <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Average Tx Value</p>
                   <p className="text-xl font-black">₹{filteredTransactions.length > 0 ? (stats.totalOut / filteredTransactions.length).toFixed(0) : 0}</p>
                </div>
             </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 rounded-full blur-[80px]"></div>
        </div>
      </div>
    </div>
  );
};

export default CostAnalysis;
