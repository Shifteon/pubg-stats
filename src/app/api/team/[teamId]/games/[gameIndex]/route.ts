import { NextRequest, NextResponse } from "next/server";
import { VALID_TEAM_NAMES, GAME_INDEX_KEY } from "@/constants";
import { GameSummaryStat } from "@/stats/gameSummaryStat";
import { TeamName } from "@/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string, gameIndex: string }> }
) {
  const { teamId, gameIndex: gameIndexStr } = await params;

  if (!teamId || !VALID_TEAM_NAMES.includes(teamId)) {
    return NextResponse.json(
      { message: `${teamId} is not a valid team name.` },
      { status: 400 }
    );
  }

  const gameIndex = parseInt(gameIndexStr, 10);
  if (isNaN(gameIndex) || gameIndex < 1) {
    return NextResponse.json(
      { message: `Invalid game index provided: ${gameIndexStr}. It must be a positive integer.` },
      { status: 400 }
    );
  }

  const statClass = new GameSummaryStat();
  const stats = await statClass.getStats(teamId as TeamName);

  if (!stats || !stats.data) {
    return NextResponse.json(
      { message: "Failed to load game summary data." },
      { status: 500 }
    );
  }

  /* eslint-disable  @typescript-eslint/no-explicit-any */
  const gameData: any[] = stats.data;

  // Find the game where the gameIndex matches the required index
  // Note: the `prepareData` method in StatBase sets `gameIndex` as a 1-based index (starting from 1 to N).
  // So we just find the object matching this property.
  const targetGame = gameData.find(game => game[GAME_INDEX_KEY] === gameIndex);

  if (!targetGame) {
    return NextResponse.json(
      { message: `Game at index ${gameIndex} not found.` },
      { status: 404 }
    );
  }

  return NextResponse.json(targetGame, { status: 200 });
}
