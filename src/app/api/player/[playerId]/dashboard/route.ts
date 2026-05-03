import { NextRequest, NextResponse } from "next/server";
import { PlayerService } from "@/services/playerService";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ playerId: string }> }
) {
  const { playerId } = await params;
  const { searchParams } = new URL(request.url);
  const startDateParam = searchParams.get("startDate");
  const endDateParam = searchParams.get("endDate");

  if (!playerId) {
    return NextResponse.json({ error: "Player ID is required" }, { status: 400 });
  }

  if (!startDateParam || !endDateParam) {
    return NextResponse.json({ error: "Missing start or end date" }, { status: 400 });
  }

  try {
    const startDate = new Date(startDateParam).toISOString();
    const endDate = new Date(endDateParam).toISOString();

    const playerService = new PlayerService();
    const result = await playerService.getPlayerDashboard(playerId, startDate, endDate);
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error(`Error in Dashboard API:`, error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Internal Server Error", details: errorMessage },
      { status: 500 }
    );
  }
}
