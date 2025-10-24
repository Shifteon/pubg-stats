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
    isaac_kills: Number(averages.isaac_kills),
    cody_kills: Number(averages.cody_kills),
    trenton_kills: Number(averages.trenton_kills),
    ben_kills: Number(averages.ben_kills),
    team_kills: Number(averages.team_kills),
  }));
  if (averageKillsArray.length > 40) {
    // remove first 10 so the graph is cleaner
    averageKillsArray.splice(0, 20);
  }

  return NextResponse.json({ averageKillsArray, status: 200 });
}
