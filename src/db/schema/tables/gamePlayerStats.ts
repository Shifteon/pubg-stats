import { pgTable, uuid, integer, index, pgPolicy } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { games } from "./games";
import { players } from "./players";

export const gamePlayerStats = pgTable.withRLS("game_player_stats", {
	id: uuid().defaultRandom().primaryKey(),
	gameId: uuid("game_id").notNull().references(() => games.id, { onDelete: "cascade", name: "game_player_stats_game_id_fkey" } ),
	playerId: uuid("player_id").notNull().references(() => players.id, { onDelete: "cascade", name: "game_player_stats_player_id_fkey" } ),
	kills: integer().default(0),
	assists: integer().default(0),
	damage: integer().default(0),
	rescues: integer().default(0),
	recalls: integer().default(0),
}, (table) => [
	index("idx_game_player_stats_game").using("btree", table.gameId.asc().nullsLast()),
	index("idx_game_player_stats_player").using("btree", table.playerId.asc().nullsLast()),

	pgPolicy("Authenticated can delete", { for: "delete", to: ["authenticated"], using: sql`true` }),

	pgPolicy("Enable insert for authenticated users only", { for: "insert", to: ["authenticated"], withCheck: sql`true` }),

	pgPolicy("Enable read access for all users", { for: "select", to: ["authenticated"], using: sql`true` }),

	pgPolicy("update", { for: "update", to: ["authenticated"], using: sql`true`, withCheck: sql`true` }),
]);
