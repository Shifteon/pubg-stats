import { pgTable, uuid, timestamp, varchar, primaryKey, unique, pgPolicy } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { players } from "./players";

export const teams = pgTable.withRLS("teams", {
  id: uuid().defaultRandom().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  teamType: varchar("team_type", { length: 50 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`timezone('utc'::text, now())`).notNull(),
}, (table) => [
  unique("teams_name_key").on(table.name),
  pgPolicy("Enable read access for all users", { for: "select", to: ["authenticated"], using: sql`true` }),
]);

export const teamPlayers = pgTable.withRLS("team_players", {
  teamId: uuid("team_id").notNull().references(() => teams.id, { onDelete: "cascade", name: "team_players_team_id_fkey" }),
  playerId: uuid("player_id").notNull().references(() => players.id, { onDelete: "cascade", name: "team_players_player_id_fkey" }),
}, (table) => [
  primaryKey({ columns: [table.teamId, table.playerId], name: "team_players_pkey" }),

  pgPolicy("Enable read access for all users", { for: "select", to: ["authenticated"], using: sql`true` }),
]);
