import { NextRequest, NextResponse } from "next/server";
import { TeamService } from "@/services/teamService";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;

    if (!teamId) {
      return NextResponse.json({ error: "Team ID is required" }, { status: 400 });
    }

    const teamService = new TeamService();
    const parsedOverview = await teamService.getTeamOverview(teamId);

    return NextResponse.json(parsedOverview);

  } catch (error) {
    console.error("Error in Team Overview API:", error);
    if (error instanceof Error && error.message === "Team not found") {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Internal Server Error", details: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
