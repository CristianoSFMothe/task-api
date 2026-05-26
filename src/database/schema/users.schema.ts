import { relations } from 'drizzle-orm';
import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { tasks } from './tasks.schema';

export const userRoleEnum = pgEnum('user_role', ['USER', 'ADMIN']);
export const userStatusEnum = pgEnum('user_status', ['ACTIVE', 'INACTIVE']);

export type UserRole = (typeof userRoleEnum.enumValues)[number];
export type UserStatus = (typeof userStatusEnum.enumValues)[number];

export const users = pgTable('users', {
  id: uuid().defaultRandom().primaryKey(),

  name: text().notNull(),

  email: text().notNull().unique(),

  password: text().notNull(),

  role: userRoleEnum().default('USER').notNull(),

  status: userStatusEnum().default('ACTIVE').notNull(),

  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  tasks: many(tasks, { relationName: 'taskOwner' }),
  responsibleTasks: many(tasks, { relationName: 'taskResponsible' }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
