
import React from 'react';
import { NavigationTab, User, AppConfig } from '../types';
import { 
  LayoutDashboard, 
  Package, 
  BarChart3, 
  Settings,
  ShieldCheck,
  Monitor,
  ClipboardList,
  ShieldAlert,
  X,
  ChevronLeft,
  PackagePlus,
  PackageMinus,
  IndianRupee
} from 'lucide-react';

interface SidebarProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  user: User;
  appConfig: AppConfig;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, user, appConfig, isOpen, onClose }) => {
  const navItems = [
    { id: NavigationTab.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: NavigationTab.INVENTORY, label: 'Stock Ledger', icon: Package },
    { id: NavigationTab.STOCK_ENTRY, label: 'Stock Entry', icon: PackagePlus, permission: 'STOCK_IN' },
    { id: NavigationTab.STOCK_ISSUE, label: 'Stock Issue', icon: PackageMinus, permission: 'STOCK_OUT' },
    { id: NavigationTab.INDENTS, label: 'Indents', icon: ClipboardList },
    { id: NavigationTab.ANALYTICS, label: 'Analytics', icon: BarChart3 },
    { id: NavigationTab.COST_ANALYSIS, label: 'Cost Analysis', icon: IndianRupee, permission: 'REPORTS_VIEW' },
  ];

  const filteredNavItems = navItems.filter(item => {
    if (item.permission && !user.permissions.includes(item.permission as any)) return false;
    return true;
  });

  if (user.role === 'admin') {
    filteredNavItems.push({ id: NavigationTab.ADMIN_PANEL, label: 'Admin Control', icon: ShieldAlert });
  }

  filteredNavItems.push({ id: NavigationTab.SETTINGS, label: 'Settings', icon: Settings });

  const isPWA = window.matchMedia('(display-mode: standalone)').matches;

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 no-print transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
      ${isOpen ? 'translate-x-0 shadow-2xl lg:shadow-none' : '-translate-x-full'}
    `}>
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20 overflow-hidden shrink-0">
            {appConfig.logoUrl ? (
              <img src={appConfig.logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <ShieldCheck className="text-white w-5 h-5" />
            )}
          </div>
          <span className="text-lg font-bold text-white tracking-tight truncate" title={appConfig.appName}>
            {appConfig.appName}
          </span>
        </div>
        
        <button 
          onClick={onClose}
          className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
        {filteredNavItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === item.id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 mt-auto space-y-3">
        {isPWA && (
          <div className="bg-indigo-900/40 p-3 rounded-xl border border-indigo-500/30 flex items-center gap-3">
            <Monitor className="w-4 h-4 text-indigo-400" />
            <span className="text-[10px] font-bold text-indigo-300 uppercase">Desktop Mode</span>
          </div>
        )}
        
        <button 
          onClick={onClose}
          className="hidden lg:flex w-full items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 hover:text-white transition-all text-slate-500"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="font-medium">Collapse Menu</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
