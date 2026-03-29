import { Router } from 'express';
import { authRouter } from '../modules/auth/auth.router';
import { usersRouter } from '../modules/users/users.router';
import { organizationsRouter } from '../modules/organizations/organizations.router';
import { contactsRouter } from '../modules/contacts/contacts.router';
import { accountsRouter } from '../modules/accounts/accounts.router';
import { leadsRouter } from '../modules/sales/leads/leads.router';
import { pipelinesRouter } from '../modules/sales/pipelines/pipelines.router';
import { opportunitiesRouter } from '../modules/sales/opportunities/opportunities.router';
import { quotesRouter } from '../modules/sales/quotes/quotes.router';
import { activitiesRouter } from '../modules/sales/activities/activities.router';
import { forecastingRouter } from '../modules/sales/forecasting/forecasting.router';
import { campaignsRouter } from '../modules/marketing/campaigns/campaigns.router';
import { templatesRouter } from '../modules/marketing/email-templates/templates.router';
import { segmentsRouter } from '../modules/marketing/segments/segments.router';
import { ticketsRouter } from '../modules/support/tickets/tickets.router';
import { slaRouter } from '../modules/support/sla/sla.router';
import { kbRouter } from '../modules/support/knowledge-base/kb.router';
import { invoicesRouter } from '../modules/finance/invoices/invoices.router';
import { paymentsRouter } from '../modules/finance/payments/payments.router';
import { contractsRouter } from '../modules/finance/contracts/contracts.router';
import { reportsRouter } from '../modules/finance/reports/reports.router';
import { rolesRouter } from '../modules/users/roles.router';

export const apiRouter = Router();

// Auth (public)
apiRouter.use('/auth', authRouter);

// Core (protected)
apiRouter.use('/users', usersRouter);
apiRouter.use('/roles', rolesRouter);
apiRouter.use('/organizations', organizationsRouter);
apiRouter.use('/contacts', contactsRouter);
apiRouter.use('/accounts', accountsRouter);

// Sales module
apiRouter.use('/sales/leads', leadsRouter);
apiRouter.use('/sales/pipelines', pipelinesRouter);
apiRouter.use('/sales/opportunities', opportunitiesRouter);
apiRouter.use('/sales/quotes', quotesRouter);
apiRouter.use('/sales/activities', activitiesRouter);
apiRouter.use('/sales/forecasting', forecastingRouter);

// Marketing module
apiRouter.use('/marketing/campaigns', campaignsRouter);
apiRouter.use('/marketing/templates', templatesRouter);
apiRouter.use('/marketing/segments', segmentsRouter);

// Support module
apiRouter.use('/support/tickets', ticketsRouter);
apiRouter.use('/support/sla', slaRouter);
apiRouter.use('/support/kb', kbRouter);

// Finance module
apiRouter.use('/finance/invoices', invoicesRouter);
apiRouter.use('/finance/payments', paymentsRouter);
apiRouter.use('/finance/contracts', contractsRouter);
apiRouter.use('/finance/reports', reportsRouter);
