import React, { Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

// Layouts
const AuthLayout = React.lazy(() => import('@/layouts/AuthLayout'));
const AppLayout = React.lazy(() => import('@/layouts/AppLayout'));

// Auth pages
const LoginPage = React.lazy(() => import('@/pages/auth/LoginPage'));
const ForgotPasswordPage = React.lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = React.lazy(() => import('@/pages/auth/ResetPasswordPage'));
const AcceptInvitePage = React.lazy(() => import('@/pages/auth/AcceptInvitePage'));

// Dashboard
const DashboardPage = React.lazy(() => import('@/pages/dashboard/DashboardPage'));

// CRM
const ContactsListPage = React.lazy(() => import('@/pages/contacts/ContactsListPage'));
const ContactDetailPage = React.lazy(() => import('@/pages/contacts/ContactDetailPage'));
const AccountsListPage = React.lazy(() => import('@/pages/accounts/AccountsListPage'));
const AccountDetailPage = React.lazy(() => import('@/pages/accounts/AccountDetailPage'));

// Sales
const LeadsListPage = React.lazy(() => import('@/pages/sales/leads/LeadsListPage'));
const PipelinesPage = React.lazy(() => import('@/pages/sales/pipelines/PipelinesPage'));
const OpportunitiesListPage = React.lazy(() => import('@/pages/sales/opportunities/OpportunitiesListPage'));
const QuotesListPage = React.lazy(() => import('@/pages/sales/quotes/QuotesListPage'));
const ActivitiesPage = React.lazy(() => import('@/pages/sales/activities/ActivitiesPage'));
const ForecastingPage = React.lazy(() => import('@/pages/sales/forecasting/ForecastingPage'));

// Marketing
const CampaignsListPage = React.lazy(() => import('@/pages/marketing/campaigns/CampaignsListPage'));
const CampaignDetailPage = React.lazy(() => import('@/pages/marketing/campaigns/CampaignDetailPage'));
const TemplatesListPage = React.lazy(() => import('@/pages/marketing/templates/TemplatesListPage'));
const SegmentsListPage = React.lazy(() => import('@/pages/marketing/segments/SegmentsListPage'));

// Support
const TicketsListPage = React.lazy(() => import('@/pages/support/tickets/TicketsListPage'));
const TicketDetailPage = React.lazy(() => import('@/pages/support/tickets/TicketDetailPage'));
const SLAPoliciesPage = React.lazy(() => import('@/pages/support/sla/SLAPoliciesPage'));
const KBDashboardPage = React.lazy(() => import('@/pages/support/knowledge-base/KBDashboardPage'));

// Finance
const InvoicesListPage = React.lazy(() => import('@/pages/finance/invoices/InvoicesListPage'));
const InvoiceDetailPage = React.lazy(() => import('@/pages/finance/invoices/InvoiceDetailPage'));
const PaymentsListPage = React.lazy(() => import('@/pages/finance/payments/PaymentsListPage'));
const ContractsListPage = React.lazy(() => import('@/pages/finance/contracts/ContractsListPage'));
const FinancialReportsPage = React.lazy(() => import('@/pages/finance/reports/FinancialReportsPage'));

// Settings
const SettingsLayout = React.lazy(() => import('@/pages/settings/SettingsLayout'));
const ProfilePage = React.lazy(() => import('@/pages/settings/ProfilePage'));
const OrganizationPage = React.lazy(() => import('@/pages/settings/OrganizationPage'));
const UsersPage = React.lazy(() => import('@/pages/settings/UsersPage'));
const RolesPage = React.lazy(() => import('@/pages/settings/RolesPage'));

function Lazy({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>;
}

export const router = createBrowserRouter([
  // Public / auth routes
  {
    element: <Lazy><AuthLayout /></Lazy>,
    children: [
      { path: '/login', element: <Lazy><LoginPage /></Lazy> },
      { path: '/forgot-password', element: <Lazy><ForgotPasswordPage /></Lazy> },
      { path: '/reset-password', element: <Lazy><ResetPasswordPage /></Lazy> },
      { path: '/accept-invite', element: <Lazy><AcceptInvitePage /></Lazy> },
    ],
  },

  // Protected app routes
  {
    element: (
      <ProtectedRoute>
        <Lazy><AppLayout /></Lazy>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Lazy><DashboardPage /></Lazy> },

      // CRM
      { path: '/contacts', element: <Lazy><ContactsListPage /></Lazy> },
      { path: '/contacts/:id', element: <Lazy><ContactDetailPage /></Lazy> },
      { path: '/accounts', element: <Lazy><AccountsListPage /></Lazy> },
      { path: '/accounts/:id', element: <Lazy><AccountDetailPage /></Lazy> },

      // Sales
      { path: '/sales/leads', element: <Lazy><LeadsListPage /></Lazy> },
      { path: '/sales/pipelines', element: <Lazy><PipelinesPage /></Lazy> },
      { path: '/sales/opportunities', element: <Lazy><OpportunitiesListPage /></Lazy> },
      { path: '/sales/quotes', element: <Lazy><QuotesListPage /></Lazy> },
      { path: '/sales/activities', element: <Lazy><ActivitiesPage /></Lazy> },
      { path: '/sales/forecasting', element: <Lazy><ForecastingPage /></Lazy> },

      // Marketing
      { path: '/marketing/campaigns', element: <Lazy><CampaignsListPage /></Lazy> },
      { path: '/marketing/campaigns/:id', element: <Lazy><CampaignDetailPage /></Lazy> },
      { path: '/marketing/templates', element: <Lazy><TemplatesListPage /></Lazy> },
      { path: '/marketing/segments', element: <Lazy><SegmentsListPage /></Lazy> },

      // Support
      { path: '/support/tickets', element: <Lazy><TicketsListPage /></Lazy> },
      { path: '/support/tickets/:id', element: <Lazy><TicketDetailPage /></Lazy> },
      { path: '/support/sla', element: <Lazy><SLAPoliciesPage /></Lazy> },
      { path: '/support/kb', element: <Lazy><KBDashboardPage /></Lazy> },

      // Finance
      { path: '/finance/invoices', element: <Lazy><InvoicesListPage /></Lazy> },
      { path: '/finance/invoices/:id', element: <Lazy><InvoiceDetailPage /></Lazy> },
      { path: '/finance/payments', element: <Lazy><PaymentsListPage /></Lazy> },
      { path: '/finance/contracts', element: <Lazy><ContractsListPage /></Lazy> },
      { path: '/finance/reports', element: <Lazy><FinancialReportsPage /></Lazy> },

      // Settings (nested)
      {
        path: '/settings',
        element: <Lazy><SettingsLayout /></Lazy>,
        children: [
          { index: true, element: <Navigate to="/settings/profile" replace /> },
          { path: 'profile', element: <Lazy><ProfilePage /></Lazy> },
          { path: 'organization', element: <Lazy><OrganizationPage /></Lazy> },
          { path: 'users', element: <Lazy><UsersPage /></Lazy> },
          { path: 'roles', element: <Lazy><RolesPage /></Lazy> },
        ],
      },

      // Fallback
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
