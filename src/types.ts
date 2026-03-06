import { z } from "zod";

import {
  AVERAGE_KILLS_STAT_NAME,
  AVERAGE_DAMAGE_STAT_NAME,
  KILLS_STAT_NAME,
  DAMAGE_STAT_NAME,
  TEAM_NO_TRENTON,
  TEAM_NO_CODY,
  TEAM_NO_BEN,
  TEAM_NO_ISAAC,
  TEAM_ALL,
  TEST_TEAM,
  GAME_INDEX_KEY,
  ISAAC_LOWERCASE,
  CODY_LOWERCASE,
  BEN_LOWERCASE,
  TRENTON_LOWERCASE,
  TEAM_LOWERCASE,
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

export type TeamName = typeof TEAM_NO_TRENTON | typeof TEAM_NO_CODY | typeof TEAM_NO_BEN | typeof TEAM_NO_ISAAC | typeof TEAM_ALL | typeof TEST_TEAM;

export type IndividualName = typeof ISAAC_LOWERCASE | typeof CODY_LOWERCASE | typeof BEN_LOWERCASE | typeof TRENTON_LOWERCASE | typeof TEAM_LOWERCASE;

export interface Averages {
  isaac_kills: string;
  cody_kills: string;
  trenton_kills: string;
  ben_kills: string;
  team_kills: string;

  isaac_damage: string;
  cody_damage: string;
  trenton_damage: string;
  ben_damage: string;
  team_damage: string;
};
export type AveragesArray = Averages[];
export type StatFile = Averages;

export interface AverageKills {
  isaac_kills: number;
  cody_kills: number;
  trenton_kills: number;
  ben_kills: number;
  team_kills: number;
  [GAME_INDEX_KEY]: number;
};
export interface AverageDamage {
  isaac_damage: number;
  cody_damage: number;
  trenton_damage: number;
  ben_damage: number;
  team_damage: number;
  [GAME_INDEX_KEY]: number;
}
export interface IndividualStats {
  [ISAAC_LOWERCASE]: number;
  [CODY_LOWERCASE]: number;
  [BEN_LOWERCASE]: number;
  [TRENTON_LOWERCASE]: number;
  [TEAM_LOWERCASE]: number;
  [GAME_INDEX_KEY]: number;
}
export interface WinRate {
  winrate: number;
}
export type AverageKillsArray = AverageKills[];
export type AverageDamageArray = AverageDamage[];
export type IndividualStatsArray = IndividualStats[];
export type WinRateArray = WinRate[];

export type StatArray = AveragesArray;

// these are array that will be used on the frontend
export type FrontendStatArray = IndividualStatsArray | WinRateArray;

export interface PlayerGameStat {
  player: string;
  kills: number;
  assists: number;
  damage: number;
  rescues: number;
  recalls: number;
}

export interface GameSummaryData {
  win: number;
  gameIndex: number;
  data: PlayerGameStat[];
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
    kills: statPairSchema,
    assists: statPairSchema,
    damage: statPairSchema,
    rescues: statPairSchema,
    recalls: statPairSchema,
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
  players: z.array(playerSchema),
}));

export type Teams = z.infer<typeof teamsSchema>;
