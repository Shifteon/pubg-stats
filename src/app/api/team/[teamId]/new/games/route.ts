import { NextRequest, NextResponse } from "next/server";
import { GameService } from "@/services/gameService";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;

    if (!teamId) {
      return NextResponse.json({ error: "Team ID is required" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const gameService = new GameService();
    const parsedGames = await gameService.getGamesForTeam(teamId, startDate, endDate);

    return NextResponse.json(parsedGames);

  } catch (error) {
    console.error("Error in Team Games API:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
