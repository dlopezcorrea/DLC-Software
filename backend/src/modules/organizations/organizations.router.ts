import { Router } from 'express';
import * as organizationsController from './organizations.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { updateOrganizationSchema } from './organizations.schema';

export const organizationsRouter = Router();

organizationsRouter.use(authMiddleware);

organizationsRouter.get('/current', organizationsController.getCurrent);
organizationsRouter.patch('/current', validate(updateOrganizationSchema), organizationsController.updateCurrent);
organizationsRouter.get('/current/stats', organizationsController.getStats);
