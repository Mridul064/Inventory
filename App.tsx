
import React, { useState, useEffect, useMemo } from 'react';
import { NavigationTab, Product, Department, User, Indent, Permission, InventoryFormConfig, AppConfig, Transaction } from './types';
import { INITIAL_PRODUCTS, DEPARTMENTS as DEFAULT_DEPARTMENTS, ADMIN_PERMISSIONS, DEFAULT_FORM_CONFIG, DEFAULT_APP_CONFIG } from './constants';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import InventoryList from './components/InventoryList';
import Analytics from './components/Analytics';
import Indents from './components/Indents';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import StockEntry from './components/StockEntry';
import StockIssue from './components/StockIssue';
import CostAnalysis from './components/CostAnalysis';
import { 
  Search,
  ChevronDown,
  Building2,
  LogOut,
  AlertTriangle,
  Menu
} from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('inventory_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [activeTab, setActiveTab] = useState<NavigationTab>(NavigationTab.DASHBOARD);
  const [activeDept, setActiveDept] = useState<Department>('All');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('inventory_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('inventory_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [departments, setDepartments] = useState<Department[]>(() => {
    const saved = localStorage.getItem('inventory_depts');
    return saved ? JSON.parse(saved) : DEFAULT_DEPARTMENTS;
  });

  const [formConfig, setFormConfig] = useState<InventoryFormConfig>(() => {
    const saved = localStorage.getItem('inventory_form_config');
    return saved ? JSON.parse(saved) : DEFAULT_FORM_CONFIG;
  });

  const [appConfig, setAppConfig] = useState<AppConfig>(() => {
    const saved = localStorage.getItem('inventory_app_config');
    return saved ? JSON.parse(saved) : DEFAULT_APP_CONFIG;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('inventory_users_list');
    if (saved) return JSON.parse(saved);
    return [{
      id: 'admin-root',
      username: 'admin',
      password: 'password123',
      name: 'System Admin',
      department: 'Admin',
      role: 'admin',
      permissions: ADMIN_PERMISSIONS,
      createdAt: new Date().toISOString()
    }];
  });

  const [indents, setIndents] = useState<Indent[]>(() => {
    const saved = localStorage.getItem('inventory_indents');
    return saved ? JSON.parse(saved) : [];
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [isDeptMenuOpen, setIsDeptMenuOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('inventory_products', JSON.stringify(products));
    localStorage.setItem('inventory_transactions', JSON.stringify(transactions));
    localStorage.setItem('inventory_depts', JSON.stringify(departments));
    localStorage.setItem('inventory_users_list', JSON.stringify(users));
    localStorage.setItem('inventory_indents', JSON.stringify(indents));
    localStorage.setItem('inventory_form_config', JSON.stringify(formConfig));
    localStorage.setItem('inventory_app_config', JSON.stringify(appConfig));
    if (currentUser) {
      localStorage.setItem('inventory_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('inventory_user');
    }
    document.title = appConfig.appName;
  }, [products, transactions, departments, users, indents, currentUser, formConfig, appConfig]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const hasPermission = (p: Permission) => currentUser?.permissions.includes(p);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            p.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const isGlobal = hasPermission('GLOBAL_ACCESS');
      const visibleDept = isGlobal ? activeDept : currentUser?.department;
      const matchesDept = visibleDept === 'All' || p.department === visibleDept;
      return matchesSearch && matchesDept;
    });
  }, [products, searchTerm, activeDept, currentUser]);

  const stats = useMemo(() => {
    const isGlobal = hasPermission('GLOBAL_ACCESS');
    const visibleDept = isGlobal ? activeDept : currentUser?.department;
    const currentProducts = visibleDept === 'All' ? products : products.filter(p => p.department === visibleDept);
    
    const totalItems = currentProducts.reduce((acc, p) => acc + (p.quantity || 0), 0);
    const totalReceived = currentProducts.reduce((acc, p) => acc + (p.totalReceived || 0), 0);
    const totalIssued = currentProducts.reduce((acc, p) => acc + (p.totalIssued || 0), 0);
    const lowStockCount = currentProducts.filter(p => p.quantity <= p.minStock).length;
    const totalValue = currentProducts.reduce((acc, p) => acc + (p.price * p.quantity), 0);
    const uniqueCategories = new Set(currentProducts.map(p => p.category)).size;

    return { totalItems, totalReceived, totalIssued, lowStockCount, totalValue, uniqueCategories };
  }, [products, activeDept, currentUser]);

  const handleLogTransaction = (type: 'IN' | 'OUT', product: Product, qty: number, reference?: string, remarks?: string, targetDept?: string) => {
    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      productId: product.id,
      productName: product.name,
      type,
      quantity: qty,
      department: targetDept || product.department,
      user: currentUser?.name || 'System',
      reference,
      remarks,
      priceAtTime: product.price
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const handleUpdateProduct = (updatedProduct: Product, txInfo?: { type: 'IN' | 'OUT', qty: number, ref?: string, rem?: string, dept?: string }) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    if (txInfo) {
      handleLogTransaction(txInfo.type, updatedProduct, txInfo.qty, txInfo.ref, txInfo.rem, txInfo.dept);
    }
  };

  const handleAddProduct = (newProduct: Product) => {
    const productWithTracking = {
      ...newProduct,
      totalReceived: newProduct.totalReceived || newProduct.quantity || 0,
      totalIssued: newProduct.totalIssued || 0
    };
    setProducts(prev => [...prev, productWithTracking]);
    if (productWithTracking.quantity > 0) {
      handleLogTransaction('IN', productWithTracking, productWithTracking.quantity, 'Opening Stock', 'Initial Entry');
    }
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    setTransactions(prev => prev.filter(t => t.productId !== id));
  };

  const handleClearAllInventory = () => {
    if (window.confirm('Are you sure you want to delete ALL data?')) {
      setProducts([]);
      setIndents([]);
      setTransactions([]);
    }
  };

  const handleAddIndent = (newIndent: Indent) => setIndents(prev => [newIndent, ...prev]);
  const handleUpdateIndentStatus = (id: string, status: Indent['status']) => 
    setIndents(prev => prev.map(i => i.id === id ? { ...i, status } : i));

  const handleAddUser = (user: User) => setUsers(prev => [...prev, user]);
  const handleUpdateUser = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (currentUser?.id === updatedUser.id) setCurrentUser(updatedUser);
  };
  const handleDeleteUser = (id: string) => setUsers(prev => prev.filter(u => u.id !== id));
  const handleAddDept = (dept: Department) => setDepartments(prev => [...prev, dept]);
  const handleDeleteDept = (dept: Department) => setDepartments(prev => prev.filter(d => d !== dept));
  const handleLogout = () => setCurrentUser(null);

  if (!currentUser) return <Login onLogin={setCurrentUser} existingUsers={users} appConfig={appConfig} />;

  const renderContent = () => {
    const isGlobal = hasPermission('GLOBAL_ACCESS');
    const effectiveDept = isGlobal ? activeDept : currentUser.department;
    
    switch (activeTab) {
      case NavigationTab.DASHBOARD:
        return <Dashboard products={filteredProducts} stats={stats} department={effectiveDept} user={currentUser} />;
      case NavigationTab.INVENTORY:
        return <InventoryList 
          products={filteredProducts} 
          transactions={transactions}
          activeDepartment={effectiveDept}
          onUpdate={handleUpdateProduct} 
          onAdd={handleAddProduct}
          onDelete={handleDeleteProduct}
          user={currentUser}
          formConfig={formConfig}
        />;
      case NavigationTab.STOCK_ENTRY:
        return <StockEntry products={products} onUpdate={handleUpdateProduct} user={currentUser} />;
      case NavigationTab.STOCK_ISSUE:
        return <StockIssue products={products} onUpdate={handleUpdateProduct} user={currentUser} departments={departments} />;
      case NavigationTab.INDENTS:
        return <Indents indents={indents} products={products} user={currentUser} onAddIndent={handleAddIndent} onUpdateStatus={handleUpdateIndentStatus} />;
      case NavigationTab.ANALYTICS:
        return <Analytics products={filteredProducts} department={effectiveDept} />;
      case NavigationTab.COST_ANALYSIS:
        return <CostAnalysis products={products} transactions={transactions} activeDepartment={effectiveDept} />;
      case NavigationTab.ADMIN_PANEL:
        return <AdminPanel users={users} departments={departments} onAddUser={handleAddUser} onUpdateUser={handleUpdateUser} onDeleteUser={handleDeleteUser} onAddDepartment={handleAddDept} onDeleteDepartment={handleDeleteDept} onClearAllData={handleClearAllInventory} currentUser={currentUser} formConfig={formConfig} onUpdateFormConfig={setFormConfig} appConfig={appConfig} onUpdateAppConfig={setAppConfig} />;
      default:
        return <div className="py-20 text-center text-slate-400">Section available in standard version...</div>;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden relative">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      <Sidebar activeTab={activeTab} setActiveTab={(tab) => { setActiveTab(tab); if (window.innerWidth < 1024) setIsSidebarOpen(false); }} user={currentUser} appConfig={appConfig} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between sticky top-0 z-20 shrink-0">
          <div className="flex items-center gap-3 md:gap-6 flex-1">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors lg:hidden"><Menu className="w-6 h-6" /></button>
            {hasPermission('GLOBAL_ACCESS') ? (
              <div className="relative">
                <button onClick={() => setIsDeptMenuOpen(!isDeptMenuOpen)} className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs md:text-sm font-bold text-slate-700">{activeDept} Ledger</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isDeptMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {isDeptMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setIsDeptMenuOpen(false)}></div>
                    <div className="absolute left-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-40 py-2">
                      <button onClick={() => { setActiveDept('All'); setIsDeptMenuOpen(false); }} className={`w-full text-left px-4 py-2 text-sm ${activeDept === 'All' ? 'bg-indigo-50 text-indigo-600' : ''}`}>Global Stocks</button>
                      {departments.map(dept => (
                        <button key={dept} onClick={() => { setActiveDept(dept); setIsDeptMenuOpen(false); }} className={`w-full text-left px-4 py-2 text-sm ${activeDept === dept ? 'bg-indigo-50 text-indigo-600' : ''}`}>{dept} Dept</button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-lg border border-indigo-100">
                <Building2 className="w-4 h-4 text-indigo-600" />
                <span className="text-xs md:text-sm font-bold text-indigo-700 truncate max-w-[100px] md:max-w-none">{currentUser.department} Desk</span>
              </div>
            )}
            <div className="relative w-full max-w-xs hidden lg:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder={`Quick find...`} className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm text-black font-medium focus:ring-2 focus:ring-indigo-500 transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4 ml-4">
            {stats.lowStockCount > 0 && (
              <div className="flex items-center gap-2 px-2 md:px-3 py-1 bg-rose-50 text-rose-600 rounded-full animate-bounce">
                <AlertTriangle className="w-3 md:w-4 h-3 md:h-4" />
                <span className="text-[8px] md:text-[10px] font-bold uppercase whitespace-nowrap">{stats.lowStockCount} Short</span>
              </div>
            )}
            <div className="flex items-center gap-2 md:gap-4 pl-2 md:pl-4 border-l border-slate-200">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-xs font-bold text-slate-900 truncate max-w-[80px]">{currentUser.name}</span>
                <span className="text-[10px] text-slate-500 uppercase">{currentUser.department}</span>
              </div>
              <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><LogOut className="w-5 h-5" /></button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
