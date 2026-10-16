import { pgTable, uuid, timestamp, text, jsonb, unique } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { players } from "./players";
import { teams } from "./teams";
import { games } from "./games";

export const achievements = pgTable.withRLS("achievements", {
	id: uuid().defaultRandom().primaryKey(),
	createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`).notNull(),
	category: text().notNull(),
	displayName: text("display_name").notNull(),
	criteria: jsonb().notNull(),
});

export const playerTeamAchievements = pgTable.withRLS("player_team_achievements", {
	id: uuid().defaultRandom().primaryKey(),
	playerId: uuid("player_id").notNull().references(() => players.id, { onDelete: "cascade", onUpdate: "cascade" }),
	teamId: uuid("team_id").notNull().references(() => teams.id, { onDelete: "cascade", onUpdate: "cascade" }),
	achievedAt: timestamp("achieved_at", { withTimezone: true }).default(sql`now()`).notNull(),
	achievementId: uuid("achievement_id").defaultRandom().notNull().references(() => achievements.id, { onDelete: "cascade", onUpdate: "cascade" }),
	gameId: uuid("game_id").defaultRandom().notNull().references(() => games.id, { onDelete: "cascade", onUpdate: "cascade" }),
}, (table) => [
	unique("unique_player_team_achievement").on(table.playerId, table.teamId, table.achievementId),]);

