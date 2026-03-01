import { NextRequest, NextResponse } from "next/server";
import { VALID_TEAM_NAMES } from "@/constants";
import { GameSummaryStat } from "@/stats/gameSummaryStat";
import { TeamName } from "@/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;

  if (!teamId || !VALID_TEAM_NAMES.includes(teamId)) {
    return NextResponse.json(
      { message: `${teamId} is not a valid team name.` },
      { status: 400 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const startStr = searchParams.get('start');
  const endStr = searchParams.get('end');

  // We need to fetch the team stats
  // First, we create an instance of GameSummaryStat.
  // Note: StatBase.fetchData has been updated to bypass HTTP loop on the server.
  const statClass = new GameSummaryStat();
  const stats = await statClass.getStats(teamId as TeamName);

  if (!stats || !stats.data) {
    return NextResponse.json(
      { message: "Failed to load game summary data." },
      { status: 500 }
    );
  }

  /* eslint-disable  @typescript-eslint/no-explicit-any */
  let gameData: any[] = stats.data;

  // Apply range slicing if provided
  if (startStr !== null && endStr !== null) {
    const start = parseInt(startStr, 10);
    const end = parseInt(endStr, 10);

    if (!isNaN(start) && !isNaN(end) && start >= 0 && end >= start) {
      gameData = gameData.slice(start, end);
    }
  }

  return NextResponse.json(gameData, { status: 200 });
}
