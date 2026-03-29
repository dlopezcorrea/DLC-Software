# DLC CRM

A comprehensive, full-stack Customer Relationship Management system built for mixed B2B/B2C businesses.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js + Express + TypeScript |
| Frontend | React + TypeScript + Vite + Tailwind CSS |
| Database | PostgreSQL + Prisma ORM |
| Cache / Queues | Redis + BullMQ |
| Auth | JWT (access 15m) + Refresh Tokens (httpOnly cookie, 7d) |
| UI Components | Shadcn/ui (Radix UI + Tailwind) |

## Modules

| Module | Features |
|--------|----------|
| **Core** | Organizations, Users, Roles & Permissions (RBAC), Contacts, Accounts |
| **Sales** | Leads, Pipelines (Kanban), Opportunities, Quotes (PDF), Activities, Forecasting |
| **Marketing** | Email Templates, Audience Segments, Email Campaigns, Analytics |
| **Support** | Tickets, SLA Policies, Knowledge Base |
| **Finance** | Contracts, Invoices, Payments (Stripe), Financial Reports |

## Prerequisites

- Node.js 20+
- Docker & Docker Compose
- pnpm or npm

## Quick Start

### 1. Clone and install

```bash
git clone <repo-url>
cd DLC-Software

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 2. Configure environment

```bash
cp .env.example backend/.env
# Edit backend/.env with your settings
```

### 3. Start infrastructure

```bash
cd docker
docker-compose up -d
# Starts: PostgreSQL (5432), Redis (6379), MinIO (9000)
```

### 4. Run database migrations and seed

```bash
cd backend
npm run db:migrate    # Apply Prisma schema
npm run db:seed       # Load demo data
```

### 5. Start the servers

```bash
# Backend (terminal 1)
cd backend && npm run dev
# API available at http://localhost:3001

# Frontend (terminal 2)
cd frontend && npm run dev
# UI available at http://localhost:5173
```

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@acme-crm.com | Admin1234! |
| Sales Rep | sales@acme-crm.com | Sales1234! |
| Support | support@acme-crm.com | Support1234! |
| Finance | finance@acme-crm.com | Finance1234! |
| Marketing | marketing@acme-crm.com | Mktg1234! |

## API Base URL

```
http://localhost:3001/api/v1
```

All endpoints return:
```json
{ "success": true, "data": {...}, "meta": { "page": 1, "total": 100 } }
```

## Project Structure

```
DLC-Software/
├── backend/              # Express API
│   ├── src/
│   │   ├── config/       # DB, Redis, email, env config
│   │   ├── middleware/   # Auth, RBAC, validation, rate limiting
│   │   ├── modules/      # Feature modules (auth/users/sales/marketing/support/finance)
│   │   ├── services/     # Cross-cutting services (email, PDF, storage)
│   │   ├── utils/        # Helpers (pagination, errors, crypto)
│   │   └── routes/       # API router aggregation
│   └── prisma/
│       ├── schema.prisma # Complete data model (30+ models)
│       └── seed/         # Demo data seeding
├── frontend/             # React SPA
│   └── src/
│       ├── api/          # React Query hooks per module
│       ├── components/   # Reusable UI components
│       ├── layouts/      # App shell and auth layouts
│       ├── pages/        # Page components per module
│       ├── store/        # Zustand state (auth, UI)
│       ├── router/       # React Router v6 routes
│       └── utils/        # Formatters, constants
└── docker/
    └── docker-compose.yml # Local dev infrastructure
```

## RBAC Roles

| Role | Access |
|------|--------|
| super_admin | Full access, cross-org |
| admin | Full access within org |
| sales_manager | Full sales + read contacts/finance |
| sales_rep | Own sales records + read contacts |
| marketing_manager | Full marketing + contact management |
| support_agent | Full support + read contacts/accounts |
| finance_manager | Full finance + read contacts/accounts |
| read_only | Read access to all modules |

## Key API Endpoints

### Auth
- `POST /api/v1/auth/login` — Login
- `POST /api/v1/auth/refresh` — Refresh access token
- `GET /api/v1/auth/me` — Current user profile

### Sales
- `GET /api/v1/sales/opportunities?pipelineId=...` — Kanban data
- `PATCH /api/v1/sales/opportunities/:id/stage` — Move stage
- `POST /api/v1/sales/leads/:id/convert` — Convert lead

### Finance
- `POST /api/v1/finance/invoices` — Create invoice
- `POST /api/v1/finance/invoices/:id/send` — Email invoice
- `GET /api/v1/finance/reports/invoice-aging` — Aging report

## Development

```bash
# Run backend tests
cd backend && npm test

# Database studio
cd backend && npm run db:studio

# Format code
npm run format

# Type check
npx tsc --noEmit
```
