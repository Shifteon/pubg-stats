import { StatName } from "@/types";

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
export const KILLS_STAT_FILE = "";
export const DAMAGE_STAT_FILE = "";

export const STATS_FILE_MAP: {[key in StatName]: string} = {
  [AVERAGE_DAMAGE_STAT_NAME]: AVERAGE_DAMAGE_STAT_FILE,
  [AVERAGE_KILLS_STAT_NAME]: AVERAGE_KILLS_STAT_FILE,
  [KILLS_STAT_NAME]: KILLS_STAT_FILE,
  [DAMAGE_STAT_NAME]: DAMAGE_STAT_FILE,
};

// stroke colors
export const ISAAC_STROKE_COLOR = "#023E8A";
export const CODY_STROKE_COLOR = "#E27249";
export const BEN_STROKE_COLOR = "#D71515";
export const TRENTON_STROKE_COLOR = "#276221";
export const TEAM_STROKE_COLOR = "#6C3BAA";

// lowercase names
export const ISAAC_LOWERCASE = "isaac";
export const CODY_LOWERCASE = "cody";
export const BEN_LOWERCASE = "ben";
export const TRENTON_LOWERCASE = "trenton";
export const TEAM_LOWERCASE = "team";

// line names
export const ISAAC_LINE_NAME = "Isaac";
export const CODY_LINE_NAME = "Cody";
export const BEN_LINE_NAME = "Ben";
export const TRENTON_LINE_NAME = "Trenton";
export const TEAM_LINE_NAME = "Team";

export const GAME_INDEX_KEY = "game_index";

// we cut off 10% of game data to normalize it
export const PERCENTAGE_OF_DATA_TO_REMOVE = 0.10;
