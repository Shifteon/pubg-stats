import { pgTable, uuid, timestamp, varchar, text, unique, pgPolicy } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { authUsers } from "drizzle-orm/supabase"

export const players = pgTable.withRLS("players", {
	id: uuid().defaultRandom().primaryKey(),
	name: varchar({ length: 255 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).default(sql`timezone('utc'::text, now())`).notNull(),
	color: varchar(),
	designation: text(),
	userId: uuid().references(() => authUsers.id, { onDelete: "set null", onUpdate: "cascade", name: "players_userId_fkey" } ),
}, (table) => [
	unique("players_name_key").on(table.name),
	pgPolicy("Enable read access for all users", { for: "select", to: ["authenticated"], using: sql`true` }),
]);
