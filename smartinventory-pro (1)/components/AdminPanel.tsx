
import React, { useState } from 'react';
import { User, Department, Permission, InventoryFormConfig, AppConfig } from '../types';
import { PERMISSION_LIST, ADMIN_PERMISSIONS } from '../constants';
import { 
  Users, 
  Building2, 
  UserPlus, 
  Shield, 
  Trash2, 
  Lock, 
  Plus,
  Key,
  ShieldAlert,
  BadgeCheck,
  AlertOctagon,
  X,
  CheckSquare,
  Square,
  Settings,
  ToggleLeft,
  ToggleRight,
  Eye,
  EyeOff,
  Palette,
  Type as TypeIcon,
  Image as ImageIcon,
  Globe,
  Smartphone,
  Server,
  ExternalLink,
  Code
} from 'lucide-react';

interface AdminPanelProps {
  users: User[];
  departments: Department[];
  onAddUser: (user: User) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (id: string) => void;
  onAddDepartment: (name: string) => void;
  onDeleteDepartment: (name: string) => void;
  onClearAllData?: () => void;
  currentUser: User;
  formConfig: InventoryFormConfig;
  onUpdateFormConfig: (config: InventoryFormConfig) => void;
  appConfig: AppConfig;
  onUpdateAppConfig: (config: AppConfig) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  users, 
  departments, 
  onAddUser, 
  onUpdateUser,
  onDeleteUser, 
  onAddDepartment, 
  onDeleteDepartment,
  onClearAllData,
  currentUser,
  formConfig,
  onUpdateFormConfig,
  appConfig,
  onUpdateAppConfig
}) => {
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  
  const [activeTab, setActiveTab] = useState<'access' | 'custom' | 'system'>('access');

  const hasPermission = (p: Permission) => currentUser.permissions.includes(p);

  const toggleFormField = (fieldId: string) => {
    const protectedFields = ['name', 'quantity', 'unit'];
    if (protectedFields.includes(fieldId)) return;

    const newFields = formConfig.fields.map(f => 
      f.id === fieldId ? { ...f, isEnabled: !f.isEnabled } : f
    );
    onUpdateFormConfig({ fields: newFields });
  };

  const toggleFieldRequired = (fieldId: string) => {
    const newFields = formConfig.fields.map(f => 
      f.id === fieldId ? { ...f, isRequired: !f.isRequired } : f
    );
    onUpdateFormConfig({ fields: newFields });
  };

  // Fixed the TypeScript error by specifying HTMLFormElement in React.FormEvent
  const handleCreateUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.get('name') as string,
      username: formData.get('username') as string,
      password: formData.get('password') as string,
      department: formData.get('department') as string,
      role: 'user',
      permissions: ['INV_VIEW', 'IND_VIEW', 'DASHBOARD_VIEW'],
      createdAt: new Date().toISOString()
    };
    onAddUser(newUser);
    setIsUserModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Sub-Navigation */}
      <div className="flex items-center gap-1 p-1 bg-slate-200/50 rounded-xl w-fit no-print">
        <button onClick={() => setActiveTab('access')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'access' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>User Access</button>
        <button onClick={() => setActiveTab('custom')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'custom' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>Customization</button>
        <button onClick={() => setActiveTab('system')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'system' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>Go Live (Deployment)</button>
      </div>

      {activeTab === 'access' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-left-4 duration-300">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-6 h-6 text-indigo-600" />
                Employee Access Control
              </h2>
              {hasPermission('USER_MANAGE') && (
                <button 
                  onClick={() => setIsUserModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg"
                >
                  <UserPlus className="w-4 h-4" /> New ID
                </button>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">User Info</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Permissions</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Settings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs uppercase">
                            {user.name.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900">{user.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">@{user.username} | {user.department}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold">
                          {user.permissions.length} RIGHTS
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {hasPermission('USER_PASS_RESET') && (
                            <button onClick={() => { setSelectedUserForPassword(user); setIsPasswordModalOpen(true); }} className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg">
                              <Key className="w-4 h-4" />
                            </button>
                          )}
                          {hasPermission('USER_MANAGE') && user.username !== 'admin' && (
                            <button onClick={() => onDeleteUser(user.id)} className="p-2 text-slate-300 hover:text-rose-600 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-indigo-600" /> Departments
            </h2>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Units</label>
                <div className="flex flex-wrap gap-2">
                  {departments.map(dept => (
                    <div key={dept} className="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg">
                      <span className="text-xs font-semibold text-slate-600">{dept}</span>
                      {hasPermission('DEPT_MANAGE') && (
                        <button onClick={() => onDeleteDepartment(dept)} className="text-slate-300 hover:text-rose-500"><Trash2 className="w-3 h-3" /></button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'custom' && (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Palette className="w-5 h-5 text-indigo-600" /> Branding Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">App Name (System Label)</label>
                  <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold" value={appConfig.appName} onChange={(e) => onUpdateAppConfig({ ...appConfig, appName: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Logo Image URL</label>
                  <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono text-xs" value={appConfig.logoUrl} onChange={(e) => onUpdateAppConfig({ ...appConfig, logoUrl: e.target.value })} placeholder="https://..." />
                </div>
              </div>
              <div className="flex items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-6">
                <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-lg border border-slate-100">
                  <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center overflow-hidden">
                    {appConfig.logoUrl ? <img src={appConfig.logoUrl} className="w-full h-full object-cover" alt="Preview" /> : <Shield className="text-white w-6 h-6" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Identity Preview</span>
                    <span className="font-black text-slate-900 text-lg">{appConfig.appName}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-600" /> Material Entry Form Config
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {formConfig.fields.map(field => {
                const isLocked = ['name', 'quantity', 'unit'].includes(field.id);
                return (
                  <div key={field.id} className={`p-4 rounded-xl border flex items-center justify-between transition-all ${field.isEnabled ? 'bg-indigo-50/50 border-indigo-100' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-800">{field.label} {field.isRequired && <span className="text-rose-500">*</span>}</span>
                      <span className="text-[10px] text-slate-400 uppercase">ID: {field.id}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {!isLocked && (
                        <button onClick={() => toggleFormField(field.id)} className={`p-1.5 rounded-lg ${field.isEnabled ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                          {field.isEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                      )}
                      {field.isEnabled && !isLocked && (
                        <button onClick={() => toggleFieldRequired(field.id)} className={`px-2 py-1 rounded text-[10px] font-black uppercase ${field.isRequired ? 'bg-rose-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                          {field.isRequired ? 'Req' : 'Opt'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'system' && (
        <div className="space-y-6 animate-in zoom-in duration-300">
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200 overflow-hidden relative">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="max-w-xl">
                <div className="flex items-center gap-2 mb-4 bg-white/20 w-fit px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border border-white/30">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  Cloud Ready System
                </div>
                <h3 className="text-3xl font-black mb-3">Softwar Ko Live Kaise Karein?</h3>
                <p className="text-indigo-100 text-sm leading-relaxed mb-6 font-medium">Aapka inventory system poori tarah se tayyar hai. Ise duniya bhar mein kahin se bhi access karne ke liye niche diye gaye 3 aasaan steps follow karein.</p>
                <div className="flex flex-wrap gap-3">
                   <a href="https://vercel.com" target="_blank" className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform">
                      Vercel Website <ExternalLink className="w-4 h-4" />
                   </a>
                   <a href="https://github.com" target="_blank" className="bg-indigo-950/40 border border-white/20 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-900/40 transition-colors">
                      GitHub Login <Code className="w-4 h-4" />
                   </a>
                </div>
              </div>
              <div className="hidden lg:flex gap-4">
                <div className="bg-white/10 p-6 rounded-3xl backdrop-blur-md border border-white/20 text-center w-40 flex flex-col items-center justify-center">
                  <Globe className="w-10 h-10 mb-3 opacity-80" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Global URL</span>
                </div>
                <div className="bg-white/10 p-6 rounded-3xl backdrop-blur-md border border-white/20 text-center w-40 flex flex-col items-center justify-center">
                  <Smartphone className="w-10 h-10 mb-3 opacity-80" />
                  <span className="text-[10px] font-black uppercase tracking-widest">PWA App</span>
                </div>
              </div>
            </div>
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl translate-y-1/2 translate-x-1/2"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                  <Server className="w-6 h-6" />
                </div>
                <div>
                   <h4 className="font-black text-slate-900 text-lg uppercase tracking-tight">Step 1: Hosting (Free)</h4>
                   <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Vercel Deployment Guide</p>
                </div>
              </div>
              <ul className="space-y-6">
                <li className="flex gap-4">
                  <span className="w-8 h-8 rounded-xl bg-slate-900 text-white text-sm flex items-center justify-center shrink-0 font-black">1</span>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-800">GitHub par upload karein</p>
                    <p className="text-xs text-slate-500">Apni files ko GitHub repo mein daalein. Ye bilkul safe aur free hai.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="w-8 h-8 rounded-xl bg-slate-900 text-white text-sm flex items-center justify-center shrink-0 font-black">2</span>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-800">Vercel se Connect karein</p>
                    <p className="text-xs text-slate-500">Vercel par jaakar "Add Project" dabayein aur apni repo select karein.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white text-sm flex items-center justify-center shrink-0 font-black animate-pulse">3</span>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-indigo-600">API_KEY set karein (Zaroori)</p>
                    <p className="text-xs text-slate-500 leading-relaxed">Vercel settings mein "Environment Variables" mein jaakar <b>API_KEY</b> naam se apni Gemini key daalein.</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                   <h4 className="font-black text-slate-900 text-lg uppercase tracking-tight">Step 2: Mobile Setup</h4>
                   <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Install as Native App</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <h5 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-3">Android (Chrome)</h5>
                  <p className="text-sm text-slate-600 leading-relaxed">Browser mein URL kholein, fir 3-dots (top right) par click karke <b>"Install App"</b> ya <b>"Add to Home Screen"</b> dabayein.</p>
                </div>
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <h5 className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-3">iPhone (Safari)</h5>
                  <p className="text-sm text-slate-600 leading-relaxed">Safari mein link kholein, fir **Share icon** (arrow square) dabakar niche scroll karein aur <b>"Add to Home Screen"</b> par tap karein.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-8 border-t border-slate-200 no-print">
            {hasPermission('PURGE_DATA') && (
              <button onClick={onClearAllData} className="px-8 py-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-2xl text-xs font-black hover:bg-rose-100 transition-colors flex items-center gap-3 shadow-sm uppercase tracking-widest">
                <AlertOctagon className="w-5 h-5" /> Reset System Data (Destructive)
              </button>
            )}
          </div>
        </div>
      )}

      {/* User Creation Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl animate-in zoom-in duration-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-900">Provision Employee ID</h3>
              <button onClick={() => setIsUserModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors"><X /></button>
            </div>
            <form onSubmit={handleCreateUser} className="p-8 space-y-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
                  <input name="name" required placeholder="e.g. Rahul Sharma" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Department</label>
                  <select name="department" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                    {departments.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">System Username</label>
                  <input name="username" required placeholder="e.g. rahul123" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Login Password</label>
                  <input name="password" required type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
              <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all uppercase tracking-widest">Create Profile</button>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {isPasswordModalOpen && selectedUserForPassword && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-8 space-y-4 animate-in zoom-in duration-200">
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                 <Key className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 uppercase">Change Password</h3>
              <p className="text-sm text-slate-500 mt-1">Updating: <span className="font-bold text-indigo-600">{selectedUserForPassword.name}</span></p>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              onUpdateUser({ ...selectedUserForPassword, password: newPassword });
              setIsPasswordModalOpen(false);
              setNewPassword('');
            }} className="space-y-4">
              <input autoFocus required type="password" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="New Secure Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              <div className="flex gap-2">
                <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
