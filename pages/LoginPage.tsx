
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { LOGO_URL } from '../constants';
import { ShieldCheck, ArrowRight, User, AlertCircle } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [empId, setEmpId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empId) return;
    setIsLoading(true);
    setErrorMessage('');

    try {
      // 1. Enforce password rule
      if (password !== '123') {
        throw new Error("Access Denied: Incorrect password. Use '123'.");
      }

      // 2. Auth against Supabase Profile record
      await login(empId);
      
      // 3. Logic-based redirect (Handled by App.tsx routes, but we can nudge it)
      // If the user is a project admin, they will see the project creation tab by default.
      
    } catch (err: any) {
      setErrorMessage(err.message || "Authentication failed. Check your ID.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-50 rounded-full blur-3xl -mr-48 -mt-48 opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gray-50 rounded-full blur-3xl -ml-24 -mb-24 opacity-50"></div>

      <div className="w-full max-w-md bg-white p-8 md:p-12 rounded-[40px] shadow-2xl relative z-10 apple-shadow">
        <div className="text-center mb-10">
          <img src={LOGO_URL} alt="AARAA Logo" className="h-16 mx-auto mb-6 object-contain" />
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome back</h1>
          <p className="text-gray-500 mt-2 text-sm">ERP Gateway for Infrastructure Management</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 ml-4 uppercase tracking-wider">Employee ID</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
              <input 
                type="text" 
                required
                value={empId}
                onChange={(e) => setEmpId(e.target.value)}
                placeholder="e.g. project.admin"
                className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 text-gray-900 outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 ml-4 uppercase tracking-wider">Password</label>
            <div className="relative">
              <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 text-gray-900 outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <p className="text-xs font-semibold text-red-700">{errorMessage}</p>
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 group shadow-xl shadow-red-500/20 active:scale-[0.98] disabled:opacity-70"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                Sign In
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
