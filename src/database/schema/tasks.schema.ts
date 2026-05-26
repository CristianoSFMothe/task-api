import { relations } from 'drizzle-orm';
import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { users } from './users.schema';

export const taskStatusEnum = pgEnum('task_status', [
  'PENDING',
  'IN_PROGRESS',
  'PAUSED',
  'BLOCKED',
  'DONE',
  'CANCELLED',
]);

export const tasks = pgTable('tasks', {
  id: uuid().defaultRandom().primaryKey(),

  title: text().notNull(),

  description: text(),

  tags: text().array().default([]).notNull(),

  status: taskStatusEnum().default('PENDING').notNull(),

  createdBy: text('created_by').notNull(),

  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),

  responsibleId: uuid('responsible_id').references(() => users.id),

  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),

  startedAt: timestamp('started_at', { withTimezone: true }),

  completedAt: timestamp('completed_at', { withTimezone: true }),

  completionTime: integer('completion_time'),
});

export const tasksRelations = relations(tasks, ({ one }) => ({
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id],
    relationName: 'taskOwner',
  }),
  responsible: one(users, {
    fields: [tasks.responsibleId],
    references: [users.id],
    relationName: 'taskResponsible',
  }),
}));

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
