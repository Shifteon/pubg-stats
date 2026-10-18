import { pgTable, uuid, timestamp, varchar, integer, boolean, index, pgPolicy } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { teams } from "./teams";

export const games = pgTable.withRLS("games", {
  id: uuid().defaultRandom().primaryKey(),
  teamId: uuid("team_id").notNull().references(() => teams.id, { onDelete: "cascade", name: "games_team_id_fkey" }),
  teamSortOrder: integer("team_sort_order"),
  isWin: boolean("is_win"),
  matchType: varchar("match_type", { length: 50 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`timezone('utc'::text, now())`).notNull(),
  playedAt: timestamp("played_at", { withTimezone: true }),
}, (table) => [
  index("idx_games_team_sort").using("btree", table.teamId.asc().nullsLast(), table.teamSortOrder.asc().nullsLast()),

  pgPolicy("Authenticated can delete", { for: "delete", to: ["authenticated"], using: sql`true` }),

  pgPolicy("Enable insert for authenticated users only", { for: "insert", to: ["authenticated"], withCheck: sql`true` }),

  pgPolicy("Enable read access for all users", { for: "select", to: ["authenticated"], using: sql`true` }),

  pgPolicy("update", { for: "update", to: ["authenticated"], using: sql`true`, withCheck: sql`true` }),
]);
