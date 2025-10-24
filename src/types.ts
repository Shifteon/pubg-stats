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
  TEST_TEAM
} from "./constants";

export type StatName = typeof AVERAGE_KILLS_STAT_NAME | typeof AVERAGE_DAMAGE_STAT_NAME | typeof KILLS_STAT_NAME | typeof DAMAGE_STAT_NAME;

export type TeamName = typeof TEAM_NO_TRENTON | typeof TEAM_NO_CODY | typeof TEAM_NO_BEN | typeof TEAM_NO_ISAAC | typeof TEAM_ALL | typeof TEST_TEAM;

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

export interface AverageKills {
  isaac_kills: number;
  cody_kills: number;
  trenton_kills: number;
  ben_kills: number;
  team_kills: number;
};
export type AverageKillsArray = AverageKills[];

export type StatArray = AveragesArray;
