import { z } from 'zod';

export const createUserSchema = z.object({
  name: z
    .string({ message: 'O nome é obrigatório' })
    .min(2, 'O nome deve ter no mínimo 2 caracteres')
    .max(100, 'O nome deve ter no máximo 100 caracteres')
    .trim(),

  email: z
    .email('Informe um email válido')
    .min(1, { message: 'O email é obrigatório' })
    .toLowerCase()
    .trim(),

  password: z
    .string({ message: 'A senha é obrigatória' })
    .min(6, 'A senha deve ter no mínimo 6 caracteres')
    .max(100, 'A senha deve ter no máximo 100 caracteres'),
});

export const updateNameUserSchema = createUserSchema.pick({
  name: true,
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateNameUserInput = z.infer<typeof updateNameUserSchema>;
