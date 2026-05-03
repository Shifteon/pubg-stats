import { NextResponse } from "next/server";
import { TeamService } from "@/services/teamService";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const teamId = (await params).teamId;
    const teamService = new TeamService();
    const sessions = await teamService.getTeamSessions(teamId);

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Error fetching team sessions:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
