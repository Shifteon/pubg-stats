import { BEN_LOWERCASE, BEN_STROKE_COLOR, CODY_LOWERCASE, CODY_STROKE_COLOR, ISAAC_LOWERCASE, ISAAC_STROKE_COLOR, TEAM_LOWERCASE, TEAM_STROKE_COLOR, TRENTON_LOWERCASE, TRENTON_STROKE_COLOR } from "@/constants";
import { AverageKills, FrontendStatArray } from "@/types";

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
export function removeEmptyKeys(data: FrontendStatArray) {
  const stat = data[0];
  const keys = Object.keys(stat);

  if ("isaac_kills" in stat) {
    return keys.filter(key => !!stat[key as keyof AverageKills]);
  }
  return keys;
}
