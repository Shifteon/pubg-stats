import { 
  VALID_TEAM_NAMES,
  SUPPORTED_STATS, 
} from "@/constants";
import { FrontendStatArray, StatName, TeamName } from "@/types";
import { getStatArray } from "@/utils/getStatArray";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const team = params.get('team');
  const stat = params.get('stat');
  if (!team || !VALID_TEAM_NAMES.includes(team)) {
    return NextResponse.json({ message: `${team} is not a valid team name.` }, { status: 400 });
  }
  if (!stat || !SUPPORTED_STATS.includes(stat as StatName)) {
    console.log("There was an error!");
    return NextResponse.json({ message: "Not a valid stat." }, { status: 400 });
  }
  const statName = stat as StatName;

  const statArray = await getStatArray(statName, team as TeamName);
  if (!statArray) {
    return NextResponse.json({ message: `Error getting ${stat} stats`, status: 500 });
  }

  return NextResponse.json({ statArray }, { status: 200 });
}
