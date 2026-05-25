import { authMessages } from './auth';
import { taskMessages } from './tasks';
import { userMessages } from './users';
import { validationMessages } from './validation';

export const messages = {
  validation: validationMessages,
  auth: authMessages,
  task: taskMessages,
  user: userMessages,
} as const;

export type Messages = typeof messages;

export { authMessages, taskMessages, userMessages, validationMessages };
