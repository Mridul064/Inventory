
import React, { useState } from 'react';
import { ShieldCheck, Lock, User as UserIcon, Loader2 } from 'lucide-react';
import { User, AppConfig } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
  existingUsers: User[];
  appConfig: AppConfig;
}

const Login: React.FC<LoginProps> = ({ onLogin, existingUsers, appConfig }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Dynamic Authentication Logic
    setTimeout(() => {
      const matchedUser = existingUsers.find(
        u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
      );

      if (matchedUser) {
        onLogin(matchedUser);
      } else {
        setError('Invalid username or password. Please contact the administrator.');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/20 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10 animate-in zoom-in duration-500">
        <div className="p-8 pb-0 text-center">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-200 overflow-hidden">
            {appConfig.logoUrl ? (
              <img src={appConfig.logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <ShieldCheck className="text-white w-10 h-10" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight truncate px-4">{appConfig.appName}</h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">Departmental Access Portal</p>
        </div>

        <form onSubmit={handleLogin} className="p-8 space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-[11px] font-bold rounded-xl animate-in fade-in slide-in-from-top-1">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Work ID / Username</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Enter your username"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-300"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-300"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Authenticating...
              </>
            ) : (
              'Login to Secure Workspace'
            )}
          </button>

          <div className="pt-2 text-center">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold opacity-50">
              Secured by Enterprise Shield™
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
