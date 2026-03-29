export const ROUTES = {
  // Auth
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  ACCEPT_INVITE: '/accept-invite',

  // App
  DASHBOARD: '/',
  CONTACTS: '/contacts',
  CONTACT_DETAIL: '/contacts/:id',
  ACCOUNTS: '/accounts',
  ACCOUNT_DETAIL: '/accounts/:id',

  // Sales
  LEADS: '/sales/leads',
  PIPELINES: '/sales/pipelines',
  OPPORTUNITIES: '/sales/opportunities',
  QUOTES: '/sales/quotes',
  FORECASTING: '/sales/forecasting',
  ACTIVITIES: '/sales/activities',

  // Marketing
  CAMPAIGNS: '/marketing/campaigns',
  CAMPAIGN_DETAIL: '/marketing/campaigns/:id',
  TEMPLATES: '/marketing/templates',
  SEGMENTS: '/marketing/segments',

  // Support
  TICKETS: '/support/tickets',
  TICKET_DETAIL: '/support/tickets/:id',
  SLA: '/support/sla',
  KNOWLEDGE_BASE: '/support/kb',

  // Finance
  INVOICES: '/finance/invoices',
  INVOICE_DETAIL: '/finance/invoices/:id',
  PAYMENTS: '/finance/payments',
  CONTRACTS: '/finance/contracts',
  REPORTS: '/finance/reports',

  // Settings
  SETTINGS: '/settings',
  SETTINGS_PROFILE: '/settings/profile',
  SETTINGS_ORGANIZATION: '/settings/organization',
  SETTINGS_USERS: '/settings/users',
  SETTINGS_ROLES: '/settings/roles',
};

export const TICKET_STATUS_LABELS: Record<string, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  WAITING_ON_CUSTOMER: 'Waiting on Customer',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

export const TICKET_PRIORITY_LABELS: Record<string, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
};

export const TICKET_PRIORITY_COLORS: Record<string, string> = {
  LOW: 'bg-slate-100 text-slate-700',
  MEDIUM: 'bg-blue-100 text-blue-700',
  HIGH: 'bg-orange-100 text-orange-700',
  URGENT: 'bg-red-100 text-red-700',
};

export const LEAD_STATUS_LABELS: Record<string, string> = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  QUALIFIED: 'Qualified',
  UNQUALIFIED: 'Unqualified',
  CONVERTED: 'Converted',
};

export const OPPORTUNITY_STATUS_LABELS: Record<string, string> = {
  OPEN: 'Open',
  WON: 'Won',
  LOST: 'Lost',
  ON_HOLD: 'On Hold',
};

export const INVOICE_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Draft',
  SENT: 'Sent',
  PARTIALLY_PAID: 'Partially Paid',
  PAID: 'Paid',
  OVERDUE: 'Overdue',
  VOID: 'Void',
  CANCELLED: 'Cancelled',
};

export const INVOICE_STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-700',
  SENT: 'bg-blue-100 text-blue-700',
  PARTIALLY_PAID: 'bg-yellow-100 text-yellow-700',
  PAID: 'bg-green-100 text-green-700',
  OVERDUE: 'bg-red-100 text-red-700',
  VOID: 'bg-slate-100 text-slate-500',
  CANCELLED: 'bg-slate-100 text-slate-500',
};

export const CONTRACT_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Draft',
  ACTIVE: 'Active',
  EXPIRED: 'Expired',
  TERMINATED: 'Terminated',
  RENEWED: 'Renewed',
};

export const CAMPAIGN_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Draft',
  SCHEDULED: 'Scheduled',
  RUNNING: 'Running',
  PAUSED: 'Paused',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  CALL: 'Call',
  EMAIL: 'Email',
  MEETING: 'Meeting',
  TASK: 'Task',
  NOTE: 'Note',
  DEMO: 'Demo',
};
