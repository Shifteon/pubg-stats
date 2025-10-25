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
  TEAM_LOWERCASE
} from "./constants";

export type StatName = typeof AVERAGE_KILLS_STAT_NAME | typeof AVERAGE_DAMAGE_STAT_NAME | typeof KILLS_STAT_NAME | typeof DAMAGE_STAT_NAME;

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
