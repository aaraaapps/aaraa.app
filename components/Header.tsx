
import React, { useContext, useState } from 'react';
import { AuthContext } from '../App';
import { Bell, Search, User, LogOut } from 'lucide-react';
import { COLORS } from '../constants';
import NotificationBell from './NotificationBell';

const Header: React.FC = () => {
  const { user, logout } = useContext(AuthContext);
  const [showProfile, setShowProfile] = useState(false);

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-md hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search documents, IDs, tasks..." 
            className="w-full bg-gray-100/50 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-red-500/20 transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <NotificationBell />
        
        <div className="relative">
          <button 
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 p-1 pl-2 pr-3 rounded-full hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xs">
              {user?.name.charAt(0)}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold leading-tight">{user?.name}</p>
              <p className="text-[10px] text-gray-500">{user?.id}</p>
            </div>
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 apple-shadow">
              <div className="p-3 border-b border-gray-50 mb-1">
                <p className="text-xs font-medium text-gray-900">{user?.designation}</p>
                <p className="text-[10px] text-gray-500">{user?.department}</p>
              </div>
              <button 
                onClick={logout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
