import { IndividualName, StatFile, StatName } from "@/types";

export const TEAM_NO_TRENTON = "T";
export const TEAM_NO_CODY = "C";
export const TEAM_NO_BEN = "B";
export const TEAM_NO_ISAAC = "I";
export const TEAM_ALL = "All";
export const TEST_TEAM = "testTeam";
export const VALID_TEAM_NAMES = [
  TEAM_NO_TRENTON,
  TEAM_NO_CODY,
  TEAM_NO_BEN,
  TEAM_NO_ISAAC,
  TEAM_ALL,
  TEST_TEAM,
];

export const AVERAGE_KILLS_STAT_NAME = "avgKills";
export const AVERAGE_DAMAGE_STAT_NAME = "avgDamage";
export const KILLS_STAT_NAME = "kills";
export const DAMAGE_STAT_NAME = "damage";

export const AVERAGE_DAMAGE_STAT_FILE = "avgs.json";
export const AVERAGE_KILLS_STAT_FILE = "avgs.json";
export const KILLS_STAT_FILE = "sums.json";
export const DAMAGE_STAT_FILE = "sums.json";

// lowercase names
export const ISAAC_LOWERCASE = "isaac";
export const CODY_LOWERCASE = "cody";
export const BEN_LOWERCASE = "ben";
export const TRENTON_LOWERCASE = "trenton";
export const TEAM_LOWERCASE = "team";

export const STATS_FILE_MAP: {[key in StatName]: string} = {
  [AVERAGE_DAMAGE_STAT_NAME]: AVERAGE_DAMAGE_STAT_FILE,
  [AVERAGE_KILLS_STAT_NAME]: AVERAGE_KILLS_STAT_FILE,
  [KILLS_STAT_NAME]: KILLS_STAT_FILE,
  [DAMAGE_STAT_NAME]: DAMAGE_STAT_FILE,
};

export const SUPPORTED_STATS: StatName[] = [
  AVERAGE_KILLS_STAT_NAME,
  AVERAGE_DAMAGE_STAT_NAME,
  KILLS_STAT_NAME,
  DAMAGE_STAT_NAME,
];

export const STAT_KEY_MAP: {[key in StatName]: {[key in IndividualName]: keyof StatFile}} = {
  [AVERAGE_DAMAGE_STAT_NAME]: {
    [ISAAC_LOWERCASE]: 'isaac_damage',
    [CODY_LOWERCASE]: 'cody_damage',
    [BEN_LOWERCASE]: 'ben_damage',
    [TRENTON_LOWERCASE]: 'trenton_damage',
    [TEAM_LOWERCASE]: 'team_damage',
  },
  [AVERAGE_KILLS_STAT_NAME]: {
    [ISAAC_LOWERCASE]: 'isaac_kills',
    [CODY_LOWERCASE]: 'cody_kills',
    [BEN_LOWERCASE]: 'ben_kills',
    [TRENTON_LOWERCASE]: 'trenton_kills',
    [TEAM_LOWERCASE]: 'team_kills',
  },
  [KILLS_STAT_NAME]: {
    [ISAAC_LOWERCASE]: 'isaac_kills',
    [CODY_LOWERCASE]: 'cody_kills',
    [BEN_LOWERCASE]: 'ben_kills',
    [TRENTON_LOWERCASE]: 'trenton_kills',
    [TEAM_LOWERCASE]: 'team_kills',
  },
  [DAMAGE_STAT_NAME]: {
    [ISAAC_LOWERCASE]: 'isaac_damage',
    [CODY_LOWERCASE]: 'cody_damage',
    [BEN_LOWERCASE]: 'ben_damage',
    [TRENTON_LOWERCASE]: 'trenton_damage',
    [TEAM_LOWERCASE]: 'team_damage',
  },
};

export const LINE_CHART = "line";
export const BAR_CHART = "bar";

export const STAT_CHART_MAP: {[key in StatName]: string} = {
  [AVERAGE_DAMAGE_STAT_NAME]: LINE_CHART,
  [AVERAGE_KILLS_STAT_NAME]: LINE_CHART,
  [KILLS_STAT_NAME]: BAR_CHART,
  [DAMAGE_STAT_NAME]: BAR_CHART,
}

export const STAT_DISPLAY_NAME_MAP: {[key in StatName]: string} = {
  [AVERAGE_DAMAGE_STAT_NAME]: "Average Damage",
  [AVERAGE_KILLS_STAT_NAME]: "Average Kills",
  [KILLS_STAT_NAME]: "Total Kills",
  [DAMAGE_STAT_NAME]: "Total Damage",
};

// stroke colors
export const ISAAC_STROKE_COLOR = "#c4ba34";
export const CODY_STROKE_COLOR = "#277CE0";
export const BEN_STROKE_COLOR = "#5a9e37";
export const TRENTON_STROKE_COLOR = "#b06635";
export const TEAM_STROKE_COLOR = "#6C3BAA";
// #52414C

// line names
export const ISAAC_LINE_NAME = "Isaac";
export const CODY_LINE_NAME = "Cody";
export const BEN_LINE_NAME = "Ben";
export const TRENTON_LINE_NAME = "Trenton";
export const TEAM_LINE_NAME = "Team";

export const GAME_INDEX_KEY = "game_index";

// we cut off 10% of game data to normalize it
export const PERCENTAGE_OF_DATA_TO_REMOVE = 0.10;
