import { StatName } from "@/types";

export const TEAM_NO_TRENTON = "T";
export const TEAM_NO_CODY = "C";
export const TEAM_NO_BEN = "B";
export const TEAM_NO_ISAAC = "I";
export const TEAM_ALL = "All";
export const TEST_TEAM = "testTeam";
// two man teams
export const TEAM_ISAAC_TRENTON = "IT";
export const TEAM_ISAAC_CODY = "IC";
export const TEAM_ISAAC_BEN = "IB";
export const TWO_MAN_TEAMS = [TEAM_ISAAC_TRENTON, TEAM_ISAAC_CODY, TEAM_ISAAC_BEN];
export const VALID_TEAM_NAMES = [
  TEAM_NO_TRENTON,
  TEAM_NO_CODY,
  TEAM_NO_BEN,
  TEAM_NO_ISAAC,
  TEAM_ALL,
  TEST_TEAM,
  TEAM_ISAAC_TRENTON,
  TEAM_ISAAC_CODY,
  TEAM_ISAAC_BEN,
];

export const AVATAR_SRC_MAP: Record<string, string> = {
  isaac: "https://5xbmuxxl0mrwzkji.public.blob.vercel-storage.com/avatars/isaac.jpg",
  cody: "https://5xbmuxxl0mrwzkji.public.blob.vercel-storage.com/avatars/cody.jpg",
  trenton: "https://5xbmuxxl0mrwzkji.public.blob.vercel-storage.com/avatars/trenton.jpg",
  ben: "https://5xbmuxxl0mrwzkji.public.blob.vercel-storage.com/avatars/ben.jpg",
};

export const AVERAGE_KILLS_STAT_NAME = "avgKills";
export const AVERAGE_DAMAGE_STAT_NAME = "avgDamage";
export const KILLS_STAT_NAME = "kills";
export const DAMAGE_STAT_NAME = "damage";
export const WIN_RATE_STAT_NAME = "winRate";
export const GAME_SUMMARY_STAT_NAME = "gameSummary";
export const KILL_STEALING_STAT_NAME = "killStealing";

export const AVERAGE_DAMAGE_STAT_FILE = "avgs.json";
export const AVERAGE_KILLS_STAT_FILE = "avgs.json";
export const KILLS_STAT_FILE = "sums.json";
export const DAMAGE_STAT_FILE = "sums.json";
export const WIN_RATE_STAT_FILE = "wrate.json";
export const GAME_SUMMARY_STAT_FILE = "data.json";
export const KILL_STEALING_STAT_FILE = "sums.json";

// lowercase names
export const ISAAC_LOWERCASE = "isaac";
export const CODY_LOWERCASE = "cody";
export const BEN_LOWERCASE = "ben";
export const TRENTON_LOWERCASE = "trenton";
export const TEAM_LOWERCASE = "team";

export const STATS_FILE_MAP: { [key in StatName]: string } = {
  [AVERAGE_DAMAGE_STAT_NAME]: AVERAGE_DAMAGE_STAT_FILE,
  [AVERAGE_KILLS_STAT_NAME]: AVERAGE_KILLS_STAT_FILE,
  [KILLS_STAT_NAME]: KILLS_STAT_FILE,
  [DAMAGE_STAT_NAME]: DAMAGE_STAT_FILE,
  [WIN_RATE_STAT_NAME]: WIN_RATE_STAT_FILE,
  [GAME_SUMMARY_STAT_NAME]: GAME_SUMMARY_STAT_FILE,
  [KILL_STEALING_STAT_NAME]: KILL_STEALING_STAT_FILE,
};

export const SUPPORTED_STATS: StatName[] = [
  WIN_RATE_STAT_NAME,
  AVERAGE_KILLS_STAT_NAME,
  AVERAGE_DAMAGE_STAT_NAME,
  KILL_STEALING_STAT_NAME,
  KILLS_STAT_NAME,
  DAMAGE_STAT_NAME,
  GAME_SUMMARY_STAT_NAME,
];

export const STAT_KEY_MAP: { [key in StatName]: string[] } = {
  [AVERAGE_DAMAGE_STAT_NAME]: [
    'isaac_damage',
    'cody_damage',
    'ben_damage',
    'trenton_damage',
    'team_damage',
  ],
  [AVERAGE_KILLS_STAT_NAME]: [
    'isaac_kills',
    'cody_kills',
    'ben_kills',
    'trenton_kills',
    'team_kills',
  ],
  [KILLS_STAT_NAME]: [
    'isaac_kills',
    'cody_kills',
    'ben_kills',
    'trenton_kills',
  ],
  [DAMAGE_STAT_NAME]: [
    'isaac_damage',
    'cody_damage',
    'ben_damage',
    'trenton_damage',
  ],
  [WIN_RATE_STAT_NAME]: [
    'win_rate',
  ],
  [GAME_SUMMARY_STAT_NAME]: [
    "isaac_kills",
    "isaac_assists",
    "isaac_damage",
    "isaac_rescues",
    "isaac_recalls",
    "cody_kills",
    "cody_assists",
    "cody_damage",
    "cody_rescues",
    "cody_recalls",
    "trenton_kills",
    "trenton_assists",
    "trenton_damage",
    "trenton_rescues",
    "trenton_recalls",
    "ben_kills",
    "ben_assists",
    "ben_damage",
    "ben_rescues",
    "ben_recalls",
    "win",
    "total_kills",
    "total_assists",
    "total_damage",
    "total_rescues",
    "total_recalls",
  ],
  [KILL_STEALING_STAT_NAME]: [
    "isaac_steals",
    "cody_steals",
    "trenton_steals",
    "ben_steals",
  ],
};

export const TWO_MAN_GAME_SUMMARY_KEYS = [
  "isaac_kills",
  "team_mate_kills",
  "isaac_assists",
  "team_mate_assists",
  "isaac_damage",
  "team_mate_damage",
  "isaac_rescues",
  "team_mate_rescues",
  "isaac_recalls",
  "team_mate_recalls",
  "win",
  "total_kills",
  "total_assists",
  "total_damage",
  "total_rescues",
  "total_recalls",
];

export const getStatKeys = (statName: StatName, teamName: string): string[] => {
  if (!VALID_TEAM_NAMES.includes(teamName)) {
    throw new Error(`Invalid team name: ${teamName}`);
  }
  if (!SUPPORTED_STATS.includes(statName)) {
    throw new Error(`Invalid stat name: ${statName}`);
  }
  // this is the same no matter what
  if (statName === WIN_RATE_STAT_NAME) {
    return STAT_KEY_MAP[statName];
  }

  if (statName === GAME_SUMMARY_STAT_NAME && TWO_MAN_TEAMS.includes(teamName)) {
    const teamMembers = TEAM_MEMBER_MAP[teamName];
    const teamMate = teamMembers.find((member) => member !== ISAAC_LOWERCASE && member !== TEAM_LOWERCASE);

    if (teamMate) {
      return TWO_MAN_GAME_SUMMARY_KEYS.map((key) => key.replace("team_mate", teamMate));
    }
  }

  if (TWO_MAN_TEAMS.includes(teamName)) {
    return STAT_KEY_MAP[statName].filter((key) => key.includes("total") || TEAM_MEMBER_MAP[teamName].some((teamMember) => key.includes(teamMember)));
  }
  return STAT_KEY_MAP[statName];
};

export const LINE_CHART = "line";
export const BAR_CHART = "bar";

export const AVERAGE_DAMAGE_DISPLAY_NAME = "Average Damage";
export const AVERAGE_KILLS_DISPLAY_NAME = "Average Kills";
export const KILLS_DISPLAY_NAME = "Total Kills";
export const DAMAGE_DISPLAY_NAME = "Total Damage";
export const WIN_RATE_DISPLAY_NAME = "Win Rate";
export const GAME_SUMMARY_DISPLAY_NAME = "Game Summary";
export const KILL_STEALING_DISPLAY_NAME = "Kill Stealing";

// stroke colors
export const ISAAC_STROKE_COLOR = "#c4ba34";
export const CODY_STROKE_COLOR = "#277CE0";
export const BEN_STROKE_COLOR = "#5a9e37";
export const TRENTON_STROKE_COLOR = "#b06635";
export const TEAM_STROKE_COLOR = "#6C3BAA";
export const DEFAULT_STROKE_COLOR = "#F95738";
// #52414C

// line names
export const ISAAC_LINE_NAME = "Isaac";
export const CODY_LINE_NAME = "Cody";
export const BEN_LINE_NAME = "Ben";
export const TRENTON_LINE_NAME = "Trenton";
export const TEAM_LINE_NAME = "Team";

export const GAME_INDEX_KEY = "gameIndex";

export const TEAM_MEMBER_MAP: Record<string, string[]> = {
  [TEAM_ALL]: [ISAAC_LOWERCASE, CODY_LOWERCASE, BEN_LOWERCASE, TRENTON_LOWERCASE, TEAM_LOWERCASE],
  [TEAM_NO_BEN]: [ISAAC_LOWERCASE, CODY_LOWERCASE, TRENTON_LOWERCASE, TEAM_LOWERCASE],
  [TEAM_NO_CODY]: [ISAAC_LOWERCASE, BEN_LOWERCASE, TRENTON_LOWERCASE, TEAM_LOWERCASE],
  [TEAM_NO_ISAAC]: [CODY_LOWERCASE, BEN_LOWERCASE, TRENTON_LOWERCASE, TEAM_LOWERCASE],
  [TEAM_NO_TRENTON]: [ISAAC_LOWERCASE, CODY_LOWERCASE, BEN_LOWERCASE, TEAM_LOWERCASE],
  [TEAM_ISAAC_BEN]: [ISAAC_LOWERCASE, BEN_LOWERCASE, TEAM_LOWERCASE],
  [TEAM_ISAAC_CODY]: [ISAAC_LOWERCASE, CODY_LOWERCASE, TEAM_LOWERCASE],
  [TEAM_ISAAC_TRENTON]: [ISAAC_LOWERCASE, TRENTON_LOWERCASE, TEAM_LOWERCASE],
};

// we cut off 10% of game data to normalize it
export const PERCENTAGE_OF_DATA_TO_REMOVE = 0.10;
