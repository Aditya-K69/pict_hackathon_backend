import { pgTable, serial, text,varchar,timestamp, integer } from "drizzle-orm/pg-core"

export const usersTable = pgTable('users_table', {
  id: serial('id').primaryKey(),

  name: text('name').notNull(),

  phone_number: varchar('phone_number', { length: 16 })
    .notNull()
    .unique(),

  email: varchar('email', { length: 255 })
    .notNull()
    .unique(),

  pin_hash: text('pin_hash').notNull(),

  created_at: timestamp('created_at').defaultNow().notNull()
});


export const pinResetTable = pgTable("pin_reset_requests", {
  id: serial("id").primaryKey(),

  user_id: integer("user_id")
    .references(() => usersTable.id, { onDelete: "cascade" })
    .notNull(),

  token_hash: text("token_hash").notNull(),

  expires_at: timestamp("expires_at").notNull(),

  used_at: timestamp("used_at"),

  created_at: timestamp("created_at").defaultNow().notNull(),
});


export type InsertUser = typeof usersTable.$inferInsert
export type SelectUser = typeof usersTable.$inferSelect