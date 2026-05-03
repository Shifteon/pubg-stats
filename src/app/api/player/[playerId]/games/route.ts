import { NextRequest, NextResponse } from "next/server";
import { GameService } from "@/services/gameService";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ playerId: string }> }
) {
  try {
    const { playerId } = await params;
    const { searchParams } = new URL(request.url);
    const matchType = searchParams.get("matchType") || "squad";

    if (!playerId) {
      return NextResponse.json({ error: "Player ID is required" }, { status: 400 });
    }

    if (matchType !== "squad" && matchType !== "duo") {
      return NextResponse.json({ error: "Invalid matchType, must be 'squad' or 'duo'" }, { status: 400 });
    }

    const gameService = new GameService();
    const parsedGames = await gameService.getGamesForPlayer(playerId, matchType);

    return NextResponse.json(parsedGames);

  } catch (error) {
    console.error(`Error in Player Games API:`, error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
