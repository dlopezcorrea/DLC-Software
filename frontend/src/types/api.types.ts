export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: { page: number; perPage: number; total: number; totalPages: number };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface Contact {
  id: string;
  email?: string;
  firstName: string;
  lastName: string;
  phone?: string;
  mobile?: string;
  jobTitle?: string;
  department?: string;
  type: string;
  source?: string;
  isActive: boolean;
  accountId?: string;
  account?: { id: string; name: string };
  emailOptIn: boolean;
  smsOptIn: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  id: string;
  name: string;
  website?: string;
  industry?: string;
  phone?: string;
  email?: string;
  employeeCount?: number;
  annualRevenue?: number;
  isActive: boolean;
  _count?: { contacts: number; opportunities: number };
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company?: string;
  source: string;
  status: string;
  score: number;
  estimatedValue?: number;
  assigneeId?: string;
  assignee?: { firstName: string; lastName: string };
  createdAt: string;
  updatedAt: string;
}

export interface Stage {
  id: string;
  pipelineId: string;
  name: string;
  probability: number;
  order: number;
  color: string;
  isWon: boolean;
  isLost: boolean;
}

export interface Pipeline {
  id: string;
  name: string;
  description?: string;
  currency: string;
  isDefault: boolean;
  stages: Stage[];
}

export interface Opportunity {
  id: string;
  name: string;
  value: number;
  currency: string;
  probability: number;
  status: string;
  pipelineId: string;
  stageId: string;
  stage?: Stage;
  assigneeId?: string;
  assignee?: { firstName: string; lastName: string };
  contactId?: string;
  contact?: { firstName: string; lastName: string };
  accountId?: string;
  account?: { name: string };
  expectedCloseDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuoteItem {
  id: string;
  productName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
  order: number;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  title: string;
  status: string;
  subtotal: number;
  total: number;
  currency: string;
  validUntil?: string;
  sentAt?: string;
  acceptedAt?: string;
  items: QuoteItem[];
  createdAt: string;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  channel: string;
  tags: string[];
  assigneeId?: string;
  assignee?: { firstName: string; lastName: string };
  contactId?: string;
  contact?: { firstName: string; lastName: string };
  firstResponseDue?: string;
  resolutionDue?: string;
  slaBreached: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  title?: string;
  status: string;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  total: number;
  amountPaid: number;
  amountDue: number;
  currency: string;
  accountId?: string;
  account?: { name: string };
  createdAt: string;
}

export interface Contract {
  id: string;
  contractNumber: string;
  title: string;
  status: string;
  startDate?: string;
  endDate?: string;
  value?: number;
  currency: string;
  autoRenew: boolean;
  accountId?: string;
  account?: { name: string };
  createdAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  type: string;
  status: string;
  totalRecipients: number;
  sentCount: number;
  openCount: number;
  clickCount: number;
  scheduledAt?: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  type: string;
  subject: string;
  description?: string;
  outcome?: string;
  isCompleted: boolean;
  dueAt?: string;
  completedAt?: string;
  duration?: number;
  userId: string;
  user?: { firstName: string; lastName: string };
  createdAt: string;
}
