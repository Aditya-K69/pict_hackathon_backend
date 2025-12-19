import { pgTable, serial, text,varchar } from "drizzle-orm/pg-core"

export const usersTable = pgTable('users_table',{
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    phone_number: varchar('phone_number',{length:16}).notNull(),
    email: text('email').notNull(),
    password: text('password').notNull()
}) 


export type InsertUser = typeof usersTable.$inferInsert
export type SelectUser = typeof usersTable.$inferSelect