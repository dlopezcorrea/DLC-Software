import { NavLink, Outlet } from 'react-router-dom';
import { User, Building2, Users, Shield } from 'lucide-react';
import { cn } from '@/utils/cn';

const NAV_ITEMS = [
  { label: 'Profile', to: '/settings/profile', icon: User },
  { label: 'Organization', to: '/settings/organization', icon: Building2 },
  { label: 'Users', to: '/settings/users', icon: Users },
  { label: 'Roles', to: '/settings/roles', icon: Shield },
];

export default function SettingsLayout() {
  return (
    <div className="flex gap-6 min-h-[calc(100vh-8rem)]">
      {/* Left Sidebar */}
      <aside className="w-56 flex-shrink-0">
        <div className="bg-white rounded-xl border border-slate-200 p-3 sticky top-6">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide px-3 mb-2">
            Settings
          </p>
          <nav className="flex flex-col gap-0.5">
            {NAV_ITEMS.map(({ label, to, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>

      {/* Right Content */}
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
