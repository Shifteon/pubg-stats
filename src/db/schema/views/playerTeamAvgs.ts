import { uuid, varchar, pgView, numeric, bigint } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const playerTeamAvgs = pgView("player_team_avgs", {	playerId: uuid("player_id"),
	teamId: uuid("team_id"),
	teamName: varchar("team_name", { length: 255 }),
	averageKills: numeric("average_kills"),
	averageDamage: numeric("average_damage"),
	averageAssists: numeric("average_assists"),
	averageRescues: numeric("average_rescues"),
	averageRecalls: numeric("average_recalls"),
	gamesPlayed: bigint("games_played", { mode: 'number' }),
}).with({"securityInvoker":true}).as(sql`SELECT tp.player_id, t.id AS team_id, t.name AS team_name, avg(gps.kills) AS average_kills, avg(gps.damage) AS average_damage, avg(gps.assists) AS average_assists, avg(gps.rescues) AS average_rescues, avg(gps.recalls) AS average_recalls, count(g.id) AS games_played FROM team_players tp JOIN teams t ON tp.team_id = t.id JOIN games g ON t.id = g.team_id JOIN game_player_stats gps ON g.id = gps.game_id AND tp.player_id = gps.player_id GROUP BY tp.player_id, t.id, t.name`);
