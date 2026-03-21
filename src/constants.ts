import { StatName } from "@/types";
import isaacAvatar from "@/assets/avatars/isaac.jpg";
import codyAvatar from "@/assets/avatars/cody.jpg";
import trentonAvatar from "@/assets/avatars/trenton.jpg";
import benAvatar from "@/assets/avatars/ben.jpg";

import { StaticImageData } from "next/image";

export const AVATAR_SRC_MAP: Record<string, StaticImageData> = {
  isaac: isaacAvatar,
  cody: codyAvatar,
  trenton: trentonAvatar,
  ben: benAvatar,
};

export const AVERAGE_KILLS_STAT_NAME = "avgKills";
export const AVERAGE_DAMAGE_STAT_NAME = "avgDamage";
export const KILLS_STAT_NAME = "kills";
export const DAMAGE_STAT_NAME = "damage";
export const WIN_RATE_STAT_NAME = "winRate";
export const GAME_SUMMARY_STAT_NAME = "gameSummary";
export const KILL_STEALING_STAT_NAME = "killStealing";

// lowercase names
export const ISAAC_LOWERCASE = "isaac";
export const CODY_LOWERCASE = "cody";
export const BEN_LOWERCASE = "ben";
export const TRENTON_LOWERCASE = "trenton";
export const TEAM_LOWERCASE = "team";

export const STATS_FILE_MAP = {}; // Placeholder if needed, but likely unused soon

export const SUPPORTED_STATS: StatName[] = [
  WIN_RATE_STAT_NAME,
  AVERAGE_KILLS_STAT_NAME,
  AVERAGE_DAMAGE_STAT_NAME,
  KILL_STEALING_STAT_NAME,
  KILLS_STAT_NAME,
  DAMAGE_STAT_NAME,
  GAME_SUMMARY_STAT_NAME,
];

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
export const DEFAULT_STROKE_COLOR = "#F95738";
export const TEAM_STROKE_COLOR = "#6C3BAA";
export const CHECK_STROKE_COLOR = "#F95738";

export const PLAYER_COLOR_MAP: Record<string, string> = {
  [ISAAC_LOWERCASE]: ISAAC_STROKE_COLOR,
  [CODY_LOWERCASE]: CODY_STROKE_COLOR,
  [BEN_LOWERCASE]: BEN_STROKE_COLOR,
  [TRENTON_LOWERCASE]: TRENTON_STROKE_COLOR,
  [TEAM_LOWERCASE]: TEAM_STROKE_COLOR,
};
// #52414C

// TODO: remove all uses of this
export const GAME_INDEX_KEY = "gameIndex";

// we cut off 10% of game data to normalize it
export const PERCENTAGE_OF_DATA_TO_REMOVE = 0.10;

export const statKeys = ["kills", "assists", "damage", "rescues", "recalls"];
