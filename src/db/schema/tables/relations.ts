import { defineRelations } from "drizzle-orm";
import { authUsers } from "drizzle-orm/supabase";
import { achievements, playerTeamAchievements } from "./achievements";
import { gamePlayerStats } from "./gamePlayerStats";
import { games } from "./games";
import { players } from "./players";
import { teamPlayers, teams } from "./teams";

export const relations = defineRelations(
	{
		achievements,
		playerTeamAchievements,
		gamePlayerStats,
		games,
		players,
		teams,
		teamPlayers,
		authUsers,
	},
	(r) => ({
		games: {
			players: r.many.players({
				from: r.games.id.through(r.gamePlayerStats.gameId),
				to: r.players.id.through(r.gamePlayerStats.playerId),
			}),
			gamePlayerStats: r.many.gamePlayerStats(),
			team: r.one.teams({
				from: r.games.teamId,
				to: r.teams.id,
			}),
			playerTeamAchievements: r.many.playerTeamAchievements(),
		},
		gamePlayerStats: {
			game: r.one.games({
				from: r.gamePlayerStats.gameId,
				to: r.games.id,
			}),
			player: r.one.players({
				from: r.gamePlayerStats.playerId,
				to: r.players.id,
			}),
		},
		players: {
			games: r.many.games(),
			gamePlayerStats: r.many.gamePlayerStats(),
			playerTeamAchievements: r.many.playerTeamAchievements(),
			authUsers: r.one.authUsers({
				from: r.players.userId,
				to: r.authUsers.id,
			}),
			teams: r.many.teams({
				from: r.players.id.through(r.teamPlayers.playerId),
				to: r.teams.id.through(r.teamPlayers.teamId),
			}),
		},
		teams: {
			games: r.many.games(),
			playerTeamAchievements: r.many.playerTeamAchievements(),
			players: r.many.players(),
		},
		playerTeamAchievements: {
			achievement: r.one.achievements({
				from: r.playerTeamAchievements.achievementId,
				to: r.achievements.id,
			}),
			game: r.one.games({
				from: r.playerTeamAchievements.gameId,
				to: r.games.id,
			}),
			player: r.one.players({
				from: r.playerTeamAchievements.playerId,
				to: r.players.id,
			}),
			team: r.one.teams({
				from: r.playerTeamAchievements.teamId,
				to: r.teams.id,
			}),
		},
		achievements: {
			playerTeamAchievements: r.many.playerTeamAchievements(),
		},
		authUsers: {
			players: r.many.players(),
		},
	})
);
