import { VALID_TEAM_NAMES, AVERAGE_KILLS_STAT_NAME } from "@/constants";
import { AverageKillsArray, TeamName } from "@/types";
import { getStatArray } from "@/utils/getStatArray";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const team = params.get('team');
  if (!team || !VALID_TEAM_NAMES.includes(team)) {
    return NextResponse.json({ message: "Not a valid team name.", status: 400 });
  }

  const averagesArray = await getStatArray(AVERAGE_KILLS_STAT_NAME, team as TeamName);
  if (!averagesArray) {
    return NextResponse.json({ message: "Error getting Average Kills stats", status: 500 });
  }

  const averageKillsArray: AverageKillsArray = averagesArray.map(averages => ({ 
    isaac_kills: averages.isaac_kills,
    cody_kills: averages.cody_kills,
    trenton_kills: averages.trenton_kills,
    ben_kills: averages.ben_kills,
    team_kills: averages.team_kills,
  }));

  return NextResponse.json({ averageKillsArray, status: 200 });
}
