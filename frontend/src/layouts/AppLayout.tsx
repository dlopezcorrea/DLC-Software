import { Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  UserPlus,
  Kanban,
  TrendingUp,
  FileText,
  Calendar,
  BarChart2,
  Megaphone,
  Mail,
  Filter,
  LifeBuoy,
  Clock,
  BookOpen,
  Receipt,
  CreditCard,
  FileSignature,
  PieChart,
  Settings,
} from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';

const navItems = [
  {
    section: 'Main',
    items: [{ label: 'Dashboard', icon: LayoutDashboard, href: '/' }],
  },
  {
    section: 'CRM',
    items: [
      { label: 'Contacts', icon: Users, href: '/contacts' },
      { label: 'Accounts', icon: Building2, href: '/accounts' },
    ],
  },
  {
    section: 'Sales',
    items: [
      { label: 'Leads', icon: UserPlus, href: '/sales/leads' },
      { label: 'Pipeline', icon: Kanban, href: '/sales/pipelines' },
      { label: 'Opportunities', icon: TrendingUp, href: '/sales/opportunities' },
      { label: 'Quotes', icon: FileText, href: '/sales/quotes' },
      { label: 'Activities', icon: Calendar, href: '/sales/activities' },
      { label: 'Forecasting', icon: BarChart2, href: '/sales/forecasting' },
    ],
  },
  {
    section: 'Marketing',
    items: [
      { label: 'Campaigns', icon: Megaphone, href: '/marketing/campaigns' },
      { label: 'Templates', icon: Mail, href: '/marketing/templates' },
      { label: 'Segments', icon: Filter, href: '/marketing/segments' },
    ],
  },
  {
    section: 'Support',
    items: [
      { label: 'Tickets', icon: LifeBuoy, href: '/support/tickets' },
      { label: 'SLA Policies', icon: Clock, href: '/support/sla' },
      { label: 'Knowledge Base', icon: BookOpen, href: '/support/kb' },
    ],
  },
  {
    section: 'Finance',
    items: [
      { label: 'Invoices', icon: Receipt, href: '/finance/invoices' },
      { label: 'Payments', icon: CreditCard, href: '/finance/payments' },
      { label: 'Contracts', icon: FileSignature, href: '/finance/contracts' },
      { label: 'Reports', icon: PieChart, href: '/finance/reports' },
    ],
  },
  {
    section: 'Admin',
    items: [{ label: 'Settings', icon: Settings, href: '/settings' }],
  },
];

export function AppLayout() {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar navItems={navItems} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
