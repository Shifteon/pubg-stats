import { NextRequest, NextResponse } from "next/server";
import { PlayerService } from "@/services/playerService";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ playerId: string }> }
) {
  const { playerId } = await params;

  if (!playerId) {
    return NextResponse.json({ error: "Player ID is required" }, { status: 400 });
  }

  try {
    const playerService = new PlayerService();
    const result = await playerService.getPlayerAverages(playerId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching player stats:", error);
    return NextResponse.json({ error: "Failed to fetch player stats" }, { status: 500 });
  }
}
