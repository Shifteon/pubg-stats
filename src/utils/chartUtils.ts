import { BEN_LINE_NAME, BEN_LOWERCASE, BEN_STROKE_COLOR, CODY_LINE_NAME, CODY_LOWERCASE, CODY_STROKE_COLOR, GAME_INDEX_KEY, ISAAC_LINE_NAME, ISAAC_LOWERCASE, ISAAC_STROKE_COLOR, TEAM_LINE_NAME, TEAM_LOWERCASE, TEAM_STROKE_COLOR, TRENTON_LINE_NAME, TRENTON_LOWERCASE, TRENTON_STROKE_COLOR } from "@/constants";
import { AverageKills, FrontendStatArray, IndividualStats, StatName } from "@/types";

export function getStrokeColor(key: string) {
  const lowercaseKey = key.toLowerCase();
  if (lowercaseKey.includes(ISAAC_LOWERCASE)) {
    return ISAAC_STROKE_COLOR;
  }
  if (lowercaseKey.includes(CODY_LOWERCASE)) {
    return CODY_STROKE_COLOR;
  }
  if (lowercaseKey.includes(BEN_LOWERCASE)) {
    return BEN_STROKE_COLOR;
  }
  if (lowercaseKey.includes(TRENTON_LOWERCASE)) {
    return TRENTON_STROKE_COLOR;
  }
  if (lowercaseKey.includes(TEAM_LOWERCASE)) {
    return TEAM_STROKE_COLOR;
  }

  return "#000000";
}

// some stat files have empty data
export function removeEmptyKeys(data: FrontendStatArray, statName: StatName) {
  const stat = data[0];
  const keys = Object.keys(stat).filter(key => key !== GAME_INDEX_KEY);

  if (ISAAC_LOWERCASE in stat) {
    return keys.filter(key => !!stat[key as keyof IndividualStats]);
  }
  return keys;
}

export function getLineName(key: string) {
  const lowercaseKey = key.toLowerCase();
  if (lowercaseKey.includes(ISAAC_LOWERCASE)) {
    return ISAAC_LINE_NAME;
  }
  if (lowercaseKey.includes(CODY_LOWERCASE)) {
    return CODY_LINE_NAME;
  }
  if (lowercaseKey.includes(BEN_LOWERCASE)) {
    return BEN_LINE_NAME;
  }
  if (lowercaseKey.includes(TRENTON_LOWERCASE)) {
    return TRENTON_LINE_NAME;
  }
  if (lowercaseKey.includes(TEAM_LOWERCASE)) {
    return TEAM_LINE_NAME;
  }

  return "unkown";
}
