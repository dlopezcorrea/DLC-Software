import { NavLink } from 'react-router-dom';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/utils/cn';
import {
  LayoutDashboard, Users, Building2, UserPlus, Kanban, TrendingUp,
  FileText, Calendar, BarChart2, Megaphone, Mail, Filter, LifeBuoy,
  Clock, BookOpen, Receipt, CreditCard, FileSignature, PieChart,
  Settings, ChevronRight, ChevronLeft,
} from 'lucide-react';

interface NavItem { label: string; icon: React.ComponentType<{ className?: string }>; href: string; }
interface NavSection { section: string; items: NavItem[]; }

const navSections: NavSection[] = [
  { section: 'Main', items: [{ label: 'Dashboard', icon: LayoutDashboard, href: '/' }] },
  { section: 'CRM', items: [
    { label: 'Contacts', icon: Users, href: '/contacts' },
    { label: 'Accounts', icon: Building2, href: '/accounts' },
  ]},
  { section: 'Sales', items: [
    { label: 'Leads', icon: UserPlus, href: '/sales/leads' },
    { label: 'Pipeline', icon: Kanban, href: '/sales/pipelines' },
    { label: 'Opportunities', icon: TrendingUp, href: '/sales/opportunities' },
    { label: 'Quotes', icon: FileText, href: '/sales/quotes' },
    { label: 'Activities', icon: Calendar, href: '/sales/activities' },
    { label: 'Forecasting', icon: BarChart2, href: '/sales/forecasting' },
  ]},
  { section: 'Marketing', items: [
    { label: 'Campaigns', icon: Megaphone, href: '/marketing/campaigns' },
    { label: 'Templates', icon: Mail, href: '/marketing/templates' },
    { label: 'Segments', icon: Filter, href: '/marketing/segments' },
  ]},
  { section: 'Support', items: [
    { label: 'Tickets', icon: LifeBuoy, href: '/support/tickets' },
    { label: 'SLA Policies', icon: Clock, href: '/support/sla' },
    { label: 'Knowledge Base', icon: BookOpen, href: '/support/kb' },
  ]},
  { section: 'Finance', items: [
    { label: 'Invoices', icon: Receipt, href: '/finance/invoices' },
    { label: 'Payments', icon: CreditCard, href: '/finance/payments' },
    { label: 'Contracts', icon: FileSignature, href: '/finance/contracts' },
    { label: 'Reports', icon: PieChart, href: '/finance/reports' },
  ]},
  { section: 'System', items: [{ label: 'Settings', icon: Settings, href: '/settings' }] },
];

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  return (
    <aside className={cn(
      'flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 shrink-0',
      sidebarCollapsed ? 'w-16' : 'w-60'
    )}>
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-sidebar-border">
        {!sidebarCollapsed && (
          <span className="text-white font-bold text-lg tracking-tight">DLC CRM</span>
        )}
        <button onClick={toggleSidebar} className="text-sidebar-foreground hover:text-white p-1 rounded transition-colors ml-auto">
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {navSections.map(({ section, items }) => (
          <div key={section}>
            {!sidebarCollapsed && (
              <p className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider px-2 mb-1">{section}</p>
            )}
            <ul className="space-y-0.5">
              {items.map(({ label, icon: Icon, href }) => (
                <li key={href}>
                  <NavLink
                    to={href}
                    end={href === '/'}
                    className={({ isActive }) => cn(
                      'flex items-center gap-3 px-2 py-2 rounded-md text-sm transition-colors',
                      isActive
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-white'
                    )}
                    title={sidebarCollapsed ? label : undefined}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {!sidebarCollapsed && <span>{label}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
