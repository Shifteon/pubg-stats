import { NextRequest, NextResponse } from "next/server";
import { PlayerService } from "@/services/playerService";

export const dynamic = 'force-dynamic';

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
    const result = await playerService.getPlayerOverview(playerId);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching player:", error);
    return NextResponse.json({ error: "Failed to fetch player stats" }, { status: 500 });
  }
}
