import type { Request } from 'express';

import type { UserRole } from '@/database/schema/users.schema';

export type AuthenticatedUser = {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
};

export type RequestWithUser = Request & {
  user: AuthenticatedUser;
};
