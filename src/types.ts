import { z } from "zod";

import {
  AVERAGE_KILLS_STAT_NAME,
  AVERAGE_DAMAGE_STAT_NAME,
  KILLS_STAT_NAME,
  DAMAGE_STAT_NAME,
  WIN_RATE_STAT_NAME,
  GAME_SUMMARY_STAT_NAME,
  KILL_STEALING_STAT_NAME
} from "./constants";

export type StatName = typeof AVERAGE_KILLS_STAT_NAME
  | typeof AVERAGE_DAMAGE_STAT_NAME
  | typeof KILLS_STAT_NAME
  | typeof DAMAGE_STAT_NAME
  | typeof WIN_RATE_STAT_NAME
  | typeof GAME_SUMMARY_STAT_NAME
  | typeof KILL_STEALING_STAT_NAME;

export interface ChartOptions {
  color: string;
  key: string;
  name: string;
  displayName: string;
}

export interface StatData {
  chartOptions: ChartOptions[];
  data: Record<string, number>[];
}

export const playerAveragesSchema = z.object({
  playerId: z.string(),
  kills: z.number(),
  assists: z.number(),
  damage: z.number(),
  rescues: z.number(),
  recalls: z.number(),
});

export type PlayerAverages = z.infer<typeof playerAveragesSchema>;

export const playerBestStatSchema = z.object({
  bestStat: z.string(),
  bestStatValue: z.number(),
});

export type PlayerBestStat = z.infer<typeof playerBestStatSchema>;

export const playerTeamStatsSchema = z.object({
  teamId: z.string(),
  teamName: z.string(),
  gamesPlayed: z.number(),
  winRate: z.number(),
  averageKills: z.number(),
  averageDamage: z.number(),
});

export type PlayerTeamStats = z.infer<typeof playerTeamStatsSchema>;

export const playerMetadataSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string(),
  designation: z.string(),
});

export type PlayerMetadata = z.infer<typeof playerMetadataSchema>;

export const playerSchema = playerMetadataSchema.extend({
  playerAverages: playerAveragesSchema,
  totalGamesPlayed: z.number(),
  totalWins: z.number(),
  totalLosses: z.number(),
  winRate: z.number(),
  mostPlayedTeam: z.string(),
  playerTeamStats: z.array(playerTeamStatsSchema),
});

export type Player = z.infer<typeof playerSchema>;

export const playersSchema = z.array(playerMetadataSchema);

export type Players = z.infer<typeof playersSchema>;

export const gameSchema = z.object({
  id: z.string(),
  teamId: z.string(),
  gameNumber: z.number(),
  isWin: z.boolean(),
  matchType: z.enum(["duo", "squad"]),
  playedAt: z.date().optional(),
  stats: z.array(z.object({
    playerId: z.string(),
    playerName: z.string(),
    kills: z.number(),
    assists: z.number(),
    damage: z.number(),
    rescues: z.number(),
    recalls: z.number(),
  }))
});

export type Game = z.infer<typeof gameSchema>;

export const statPairSchema = z.object({
  stat: z.enum(["kills", "assists", "damage", "rescues", "recalls"]),
  statValue: z.number(),
});

export type StatPair = z.infer<typeof statPairSchema>;

export const teamHallOfFameSchema = z.record(
  z.string(), // key is the stat name, e.g. "kills", "assists"
  z.object({
    playerId: z.string(),
    gameId: z.string(),
    statPair: statPairSchema,
  })
);

export type TeamHallOfFame = z.infer<typeof teamHallOfFameSchema>;

export const teamPersonalBestSchema = z.record(
  z.string(), // key is the playerId
  z.object({
    kills: statPairSchema.extend({
      gameId: z.string(),
    }),
    assists: statPairSchema.extend({
      gameId: z.string(),
    }),
    damage: statPairSchema.extend({
      gameId: z.string(),
    }),
    rescues: statPairSchema.extend({
      gameId: z.string(),
    }),
    recalls: statPairSchema.extend({
      gameId: z.string(),
    }),
  })
);

export type TeamPersonalBest = z.infer<typeof teamPersonalBestSchema>;

export const teamOverviewSchema = z.object({
  teamId: z.string(),
  teamName: z.string(),
  teamType: z.string(),
  players: playersSchema,
  totalGames: z.number(),
  totalWins: z.number(),
  totalLosses: z.number(),
  winRate: z.number(),
  winStreak: z.number(),
  longestWinStreak: z.number(),
  hallOfFame: teamHallOfFameSchema,
  teamPersonalBests: teamPersonalBestSchema,
});

export type TeamOverview = z.infer<typeof teamOverviewSchema>;

export const teamsSchema = z.array(z.object({
  id: z.string(),
  name: z.string(),
  teamType: z.string(),
  players: z.array(playerMetadataSchema),
}));

export type Teams = z.infer<typeof teamsSchema>;

export const teamStatTimelinePointSchema = z.object({
  gameIndex: z.number(),
  avgKills: z.record(z.string(), z.number()),
  avgDamage: z.record(z.string(), z.number()),
  kills: z.record(z.string(), z.number()),
  damage: z.record(z.string(), z.number()),
  winRate: z.number(),
  killStealing: z.record(z.string(), z.number()),
});

export type TeamStatTimelinePoint = z.infer<typeof teamStatTimelinePointSchema>;

export const teamStatTimelineSchema = z.array(teamStatTimelinePointSchema);

export type TeamStatTimeline = z.infer<typeof teamStatTimelineSchema>;
