import React, { Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

// Lazy-loaded layouts
const AuthLayout = React.lazy(() =>
  import('@/layouts/AuthLayout').then((m) => ({ default: m.AuthLayout }))
);
const AppLayout = React.lazy(() =>
  import('@/layouts/AppLayout').then((m) => ({ default: m.AppLayout }))
);
const SettingsLayout = React.lazy(() =>
  import('@/layouts/SettingsLayout').then((m) => ({ default: m.SettingsLayout }))
);

// Auth pages
const LoginPage = React.lazy(() =>
  import('@/pages/auth/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const ForgotPasswordPage = React.lazy(() =>
  import('@/pages/auth/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage }))
);
const ResetPasswordPage = React.lazy(() =>
  import('@/pages/auth/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage }))
);
const AcceptInvitePage = React.lazy(() =>
  import('@/pages/auth/AcceptInvitePage').then((m) => ({ default: m.AcceptInvitePage }))
);

// Dashboard
const DashboardPage = React.lazy(() =>
  import('@/pages/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);

// Contacts
const ContactsListPage = React.lazy(() =>
  import('@/pages/contacts/ContactsListPage').then((m) => ({ default: m.ContactsListPage }))
);
const ContactDetailPage = React.lazy(() =>
  import('@/pages/contacts/ContactDetailPage').then((m) => ({ default: m.ContactDetailPage }))
);

// Accounts
const AccountsListPage = React.lazy(() =>
  import('@/pages/accounts/AccountsListPage').then((m) => ({ default: m.AccountsListPage }))
);
const AccountDetailPage = React.lazy(() =>
  import('@/pages/accounts/AccountDetailPage').then((m) => ({ default: m.AccountDetailPage }))
);

// Sales
const LeadsListPage = React.lazy(() =>
  import('@/pages/sales/LeadsListPage').then((m) => ({ default: m.LeadsListPage }))
);
const PipelinesPage = React.lazy(() =>
  import('@/pages/sales/PipelinesPage').then((m) => ({ default: m.PipelinesPage }))
);
const OpportunitiesListPage = React.lazy(() =>
  import('@/pages/sales/OpportunitiesListPage').then((m) => ({ default: m.OpportunitiesListPage }))
);
const QuotesListPage = React.lazy(() =>
  import('@/pages/sales/QuotesListPage').then((m) => ({ default: m.QuotesListPage }))
);
const ActivitiesPage = React.lazy(() =>
  import('@/pages/sales/ActivitiesPage').then((m) => ({ default: m.ActivitiesPage }))
);
const ForecastingPage = React.lazy(() =>
  import('@/pages/sales/ForecastingPage').then((m) => ({ default: m.ForecastingPage }))
);

// Marketing
const CampaignsListPage = React.lazy(() =>
  import('@/pages/marketing/CampaignsListPage').then((m) => ({ default: m.CampaignsListPage }))
);
const CampaignDetailPage = React.lazy(() =>
  import('@/pages/marketing/CampaignDetailPage').then((m) => ({ default: m.CampaignDetailPage }))
);
const TemplatesListPage = React.lazy(() =>
  import('@/pages/marketing/TemplatesListPage').then((m) => ({ default: m.TemplatesListPage }))
);
const SegmentsListPage = React.lazy(() =>
  import('@/pages/marketing/SegmentsListPage').then((m) => ({ default: m.SegmentsListPage }))
);

// Support
const TicketsListPage = React.lazy(() =>
  import('@/pages/support/TicketsListPage').then((m) => ({ default: m.TicketsListPage }))
);
const TicketDetailPage = React.lazy(() =>
  import('@/pages/support/TicketDetailPage').then((m) => ({ default: m.TicketDetailPage }))
);
const SLAPoliciesPage = React.lazy(() =>
  import('@/pages/support/SLAPoliciesPage').then((m) => ({ default: m.SLAPoliciesPage }))
);
const KBDashboardPage = React.lazy(() =>
  import('@/pages/support/KBDashboardPage').then((m) => ({ default: m.KBDashboardPage }))
);

// Finance
const InvoicesListPage = React.lazy(() =>
  import('@/pages/finance/InvoicesListPage').then((m) => ({ default: m.InvoicesListPage }))
);
const InvoiceDetailPage = React.lazy(() =>
  import('@/pages/finance/InvoiceDetailPage').then((m) => ({ default: m.InvoiceDetailPage }))
);
const PaymentsListPage = React.lazy(() =>
  import('@/pages/finance/PaymentsListPage').then((m) => ({ default: m.PaymentsListPage }))
);
const ContractsListPage = React.lazy(() =>
  import('@/pages/finance/ContractsListPage').then((m) => ({ default: m.ContractsListPage }))
);
const FinancialReportsPage = React.lazy(() =>
  import('@/pages/finance/FinancialReportsPage').then((m) => ({ default: m.FinancialReportsPage }))
);

// Settings
const ProfileSettingsPage = React.lazy(() =>
  import('@/pages/settings/ProfileSettingsPage').then((m) => ({ default: m.ProfileSettingsPage }))
);
const OrganizationSettingsPage = React.lazy(() =>
  import('@/pages/settings/OrganizationSettingsPage').then((m) => ({
    default: m.OrganizationSettingsPage,
  }))
);
const UsersSettingsPage = React.lazy(() =>
  import('@/pages/settings/UsersSettingsPage').then((m) => ({ default: m.UsersSettingsPage }))
);
const RolesSettingsPage = React.lazy(() =>
  import('@/pages/settings/RolesSettingsPage').then((m) => ({ default: m.RolesSettingsPage }))
);

function Lazy({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>;
}

export const router = createBrowserRouter([
  // Public / auth routes
  {
    element: (
      <Lazy>
        <AuthLayout />
      </Lazy>
    ),
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
        <Lazy>
          <AppLayout />
        </Lazy>
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

      // Settings (nested layout)
      {
        path: '/settings',
        element: (
          <Lazy>
            <SettingsLayout />
          </Lazy>
        ),
        children: [
          { index: true, element: <Navigate to="/settings/profile" replace /> },
          { path: 'profile', element: <Lazy><ProfileSettingsPage /></Lazy> },
          { path: 'organization', element: <Lazy><OrganizationSettingsPage /></Lazy> },
          { path: 'users', element: <Lazy><UsersSettingsPage /></Lazy> },
          { path: 'roles', element: <Lazy><RolesSettingsPage /></Lazy> },
        ],
      },

      // Fallback
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
