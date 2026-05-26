import { z } from 'zod';

import { messages } from '@/common/messages';

export const taskStatusValues = [
  'PENDING',
  'IN_PROGRESS',
  'PAUSED',
  'BLOCKED',
  'DONE',
  'CANCELLED',
] as const;

export const taskStatusSchema = z.enum(taskStatusValues);

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

export const findTasksSchema = z.object({
  title: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : undefined)),
  status: taskStatusSchema.optional(),
  tag: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : undefined)),
  responsibleId: z.uuid().optional(),
});

export const updateTaskStatusSchema = z.object({
  status: taskStatusSchema,
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type FindTasksInput = z.infer<typeof findTasksSchema>;
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;
