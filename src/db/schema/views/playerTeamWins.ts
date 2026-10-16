import { uuid, varchar, pgView, bigint } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const playerTeamWins = pgView("player_team_wins", {	playerId: uuid("player_id"),
	teamId: uuid("team_id"),
	teamName: varchar("team_name", { length: 255 }),
	wins: bigint({ mode: 'number' }),
}).with({"securityInvoker":true}).as(sql`SELECT tp.player_id, t.id AS team_id, t.name AS team_name, count(g.id) AS wins FROM team_players tp JOIN teams t ON tp.team_id = t.id JOIN games g ON t.id = g.team_id WHERE g.is_win = true GROUP BY tp.player_id, t.id, t.name`);
