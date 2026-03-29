import { Bell, ChevronDown, LogOut, User, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useAuth } from '@/hooks/useAuth';
import { getInitials } from '@/utils/formatters';

export function TopBar() {
  const user = useAuthStore(s => s.user);
  const { handleLogout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
      <div /> {/* left placeholder */}
      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button className="relative p-2 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors">
          <Bell className="w-5 h-5" />
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(p => !p)}
            className="flex items-center gap-2 p-1.5 rounded-md hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-semibold">
              {user ? getInitials(user.firstName, user.lastName) : 'U'}
            </div>
            <span className="text-sm font-medium text-slate-700 max-w-32 truncate">
              {user ? `${user.firstName} ${user.lastName}` : ''}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-20 py-1">
                <Link to="/settings/profile" onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                  <User className="w-4 h-4" /> Profile
                </Link>
                <Link to="/settings" onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                  <Settings className="w-4 h-4" /> Settings
                </Link>
                <hr className="my-1" />
                <button onClick={() => { setDropdownOpen(false); handleLogout(); }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left">
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
