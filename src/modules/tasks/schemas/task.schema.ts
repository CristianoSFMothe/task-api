import { z } from 'zod';

import { messages } from '@/common/messages';

export const createTaskSchema = z.object({
  title: z
    .string({ message: messages.validation.taskTitleRequired })
    .trim()
    .min(1, messages.validation.taskTitleRequired),
  description: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : undefined)),
  tags: z
    .array(
      z.string().trim().min(1, 'Cada tag precisa ter ao menos 1 caractere'),
    )
    .optional()
    .default([]),
  userEmail: z
    .string()
    .trim()
    .toLowerCase()
    .email(messages.validation.emailInvalid)
    .optional(),
  responsibleEmail: z
    .string()
    .trim()
    .toLowerCase()
    .email(messages.validation.emailInvalid)
    .optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
