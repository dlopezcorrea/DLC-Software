import { UserStatus } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        status: UserStatus;
      };
      orgId?: string;
    }
  }
}
