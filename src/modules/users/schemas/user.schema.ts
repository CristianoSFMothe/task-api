import { z } from 'zod';

import { messages } from '@/common/messages';

export const userStatusSchema = z.enum(['ACTIVE', 'INACTIVE']);

export const createUserSchema = z.object({
  name: z
    .string({ message: messages.validation.nameRequired })
    .min(2, messages.validation.nameMinLength)
    .max(100, messages.validation.nameMaxLength)
    .trim(),

  email: z
    .email(messages.validation.emailInvalid)
    .min(1, { message: messages.validation.emailRequired })
    .toLowerCase()
    .trim(),

  password: z
    .string({ message: messages.validation.passwordRequired })
    .min(6, messages.validation.passwordMinLength)
    .max(100, messages.validation.passwordMaxLength),
});

export const updateNameUserSchema = createUserSchema.pick({
  name: true,
});

export const deleteUserSchema = z.object({
  status: userStatusSchema,
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateNameUserInput = z.infer<typeof updateNameUserSchema>;
export type UserStatusInput = z.infer<typeof userStatusSchema>;
export type DeleteUserInput = z.infer<typeof deleteUserSchema>;
