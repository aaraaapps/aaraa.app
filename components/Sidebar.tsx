
import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../App';
import { LayoutDashboard, FileText, CheckCircle2, Settings, Users, Building2, PlusCircle } from 'lucide-react';
import { LOGO_URL, COLORS } from '../constants';
import { UserRole } from '../types';

const Sidebar: React.FC = () => {
  const { user } = useContext(AuthContext);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', roles: [UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN] },
    { icon: FileText, label: 'My Submissions', path: '/submissions', roles: [UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN] },
    { icon: PlusCircle, label: 'Project Creation', path: '/project-creation', roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
    { icon: CheckCircle2, label: 'Approvals', path: '/approvals', roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
    { icon: Building2, label: 'Project Status', path: '/projects', roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
    { icon: Users, label: 'Team', path: '/team', roles: [UserRole.SUPER_ADMIN] },
    { icon: Settings, label: 'Settings', path: '/settings', roles: [UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN] },
  ];

  return (
    <aside className="w-full md:w-64 bg-white border-r border-gray-100 flex flex-col z-40">
      <div className="p-6">
        <img src={LOGO_URL} alt="AARAA Logo" className="h-10 object-contain" />
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {menuItems
          .filter(item => item.roles.includes(user?.role || UserRole.USER))
          .map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
                ${isActive 
                  ? 'bg-red-50 text-red-600 font-semibold shadow-sm' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
              `}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
            </NavLink>
          ))}
      </nav>

      <div className="p-6 border-t border-gray-50">
        <div className="bg-gradient-to-br from-red-50 to-white rounded-2xl p-4 border border-red-100">
          <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-1">Company Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <p className="text-xs font-medium">All systems operational</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
