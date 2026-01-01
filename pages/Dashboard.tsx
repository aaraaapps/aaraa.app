
import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../App';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Users, FileCheck, AlertTriangle, ArrowUpRight, Zap, PlusCircle, Building2 } from 'lucide-react';
import { getDashboardInsights } from '../services/gemini';
import { UserRole } from '../types';

const Dashboard: React.FC = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [insight, setInsight] = useState('Generating executive insights...');
  
  const isProjectAdmin = user?.id.toLowerCase() === 'project.admin';

  useEffect(() => {
    if (user && !isProjectAdmin) {
      getDashboardInsights(user, "Overview of active projects and pending approvals").then(setInsight);
    }
  }, [user, isProjectAdmin]);

  if (isProjectAdmin) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 animate-in fade-in duration-1000">
        <div className="w-full max-w-2xl bg-white p-12 rounded-[50px] apple-shadow border border-gray-100 text-center space-y-8">
          <div className="w-24 h-24 bg-red-50 rounded-[32px] flex items-center justify-center mx-auto shadow-inner">
            <Building2 className="w-10 h-10 text-red-600" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-3">Project Command Center</h1>
            <p className="text-gray-500 font-medium max-w-sm mx-auto">
              Initialize new infrastructure projects, assign teams, and define BOQ scopes.
            </p>
          </div>
          <button 
            onClick={() => navigate('/project-creation')}
            className="group relative flex items-center justify-center gap-3 bg-red-600 text-white w-full py-6 rounded-3xl font-black text-lg shadow-2xl shadow-red-500/30 hover:bg-red-700 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <PlusCircle className="w-6 h-6 transition-transform group-hover:rotate-90" />
            Create New Project
            <div className="absolute inset-0 rounded-3xl group-hover:bg-white/10 pointer-events-none transition-colors"></div>
          </button>
          <div className="pt-8 border-t border-gray-50 flex justify-center gap-12 text-gray-400">
             <div className="text-center">
               <p className="text-xs font-bold uppercase tracking-widest">Active Projects</p>
               <p className="text-xl font-black text-gray-900 mt-1">12</p>
             </div>
             <div className="text-center">
               <p className="text-xs font-bold uppercase tracking-widest">In Pipeline</p>
               <p className="text-xl font-black text-gray-900 mt-1">08</p>
             </div>
          </div>
        </div>
      </div>
    );
  }

  // Standard Dashboard for other roles
  const stats = [
    { label: 'Active Projects', value: '12', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Pending Approvals', value: '43', icon: FileCheck, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Field Workforce', value: '1,280', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Critical Alerts', value: '3', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            {user?.dashboard || 'Control Center'}
          </h1>
          <p className="text-gray-500 mt-1">Status report for {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors apple-shadow">Download Report</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[32px] border border-gray-100 apple-shadow hover:translate-y-[-4px] transition-transform group">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-300 group-hover:text-red-500 transition-colors" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-[40px] text-white apple-shadow flex flex-col md:flex-row items-center gap-8">
          <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-2">AI Executive Summary</h2>
            <p className="text-gray-300 text-sm leading-relaxed italic">"{insight}"</p>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;
