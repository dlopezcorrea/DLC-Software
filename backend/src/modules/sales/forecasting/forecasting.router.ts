import { Router } from 'express';
import * as forecastingController from './forecasting.controller';
import { authMiddleware } from '../../../middleware/auth.middleware';

export const forecastingRouter = Router();

forecastingRouter.get(
  '/summary',
  authMiddleware,
  forecastingController.getSummary
);

forecastingRouter.get(
  '/by-stage',
  authMiddleware,
  forecastingController.getByStage
);

forecastingRouter.get(
  '/by-user',
  authMiddleware,
  forecastingController.getByUser
);

forecastingRouter.get(
  '/by-period',
  authMiddleware,
  forecastingController.getByPeriod
);

forecastingRouter.get(
  '/conversion-rates',
  authMiddleware,
  forecastingController.getConversionRates
);
