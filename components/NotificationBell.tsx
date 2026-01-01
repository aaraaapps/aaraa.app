
import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { Notification } from '../types';

const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 'n1', title: 'New Approval', message: 'Manikandan submitted a bill for cement.', type: 'INFO', read: false, created_at: '2 mins ago' },
    { id: 'n2', title: 'Submission Approved', message: 'Your petty cash claim was approved by HR.', type: 'SUCCESS', read: false, created_at: '1 hour ago' },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-gray-100 relative transition-colors"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white rounded-[32px] shadow-2xl border border-gray-100 overflow-hidden apple-shadow z-50">
          <div className="p-5 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Notifications</h3>
            <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest">{unreadCount} New</span>
          </div>
          <div className="max-h-96 overflow-y-auto scrollbar-hide">
            {notifications.map((n) => (
              <div key={n.id} className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${!n.read ? 'bg-red-50/30' : ''}`}>
                <p className="text-sm font-bold text-gray-900">{n.title}</p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{n.message}</p>
                <p className="text-[10px] text-gray-400 mt-2">{n.created_at}</p>
              </div>
            ))}
          </div>
          <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
            <button className="text-xs font-bold text-gray-500 hover:text-red-600 transition-colors">Clear all notifications</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
