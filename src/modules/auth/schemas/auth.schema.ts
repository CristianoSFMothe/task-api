import { z } from 'zod';

import { messages } from '@/common/messages';

export const loginSchema = z.object({
  email: z
    .email(messages.validation.emailInvalid)
    .min(1, { message: messages.validation.emailRequired })
    .toLowerCase()
    .trim(),

  password: z
    .string({ message: messages.validation.passwordRequired })
    .min(1, messages.validation.passwordRequired),
});

export type LoginInput = z.infer<typeof loginSchema>;
