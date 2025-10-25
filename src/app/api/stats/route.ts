import { 
  VALID_TEAM_NAMES,
  GAME_INDEX_KEY,
  PERCENTAGE_OF_DATA_TO_REMOVE, 
  SUPPORTED_STATS, 
  ISAAC_LOWERCASE, 
  CODY_LOWERCASE, 
  TRENTON_LOWERCASE, 
  BEN_LOWERCASE, 
  TEAM_LOWERCASE, 
  STAT_KEY_MAP 
} from "@/constants";
import { FrontendStatArray, StatName, TeamName } from "@/types";
import { getStatArray } from "@/utils/getStatArray";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const team = params.get('team');
  const stat = params.get('stat');
  if (!team || !VALID_TEAM_NAMES.includes(team)) {
    return NextResponse.json({ message: `${team} is not a valid team name.`, status: 400 });
  }
  if (!stat || !SUPPORTED_STATS.includes(stat as StatName)) {
    return NextResponse.json({ message: "Not a valid stat.", status: 400 });
  }
  const statName = stat as StatName;

  const statArray = await getStatArray(statName, team as TeamName);
  if (!statArray) {
    return NextResponse.json({ message: `Error getting ${stat} stats`, status: 500 });
  }

  const frontendStatArray: FrontendStatArray = statArray.map((stats, index) => ({
    [ISAAC_LOWERCASE]: Number(stats[STAT_KEY_MAP[statName][ISAAC_LOWERCASE]]),
    [CODY_LOWERCASE]: Number(stats[STAT_KEY_MAP[statName][CODY_LOWERCASE]]),
    [TRENTON_LOWERCASE]: Number(stats[STAT_KEY_MAP[statName][TRENTON_LOWERCASE]]),
    [BEN_LOWERCASE]: Number(stats[STAT_KEY_MAP[statName][BEN_LOWERCASE]]),
    [TEAM_LOWERCASE]: Number(stats[STAT_KEY_MAP[statName][TEAM_LOWERCASE]]),
    [GAME_INDEX_KEY]: index,
  }));
  // remove some of the data to nomralize it
  const startIndex = Math.ceil(frontendStatArray.length * PERCENTAGE_OF_DATA_TO_REMOVE);
  const filteredArray = frontendStatArray.slice(startIndex);

  return NextResponse.json({ frontendStatArray: filteredArray, status: 200 });
}
