import { NextRequest, NextResponse } from "next/server";
import { TeamService } from "@/services/teamService";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;

  if (!teamId) {
    return NextResponse.json(
      { message: `${teamId} is not a valid team name.` },
      { status: 400 }
    );
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const startStr = searchParams.get('start');
    const endStr = searchParams.get('end');

    let start: number | undefined;
    let end: number | undefined;

    if (startStr !== null) {
      start = parseInt(startStr, 10);
      if (isNaN(start)) start = undefined;
    }

    if (endStr !== null) {
      end = parseInt(endStr, 10);
      if (isNaN(end)) end = undefined;
    }

    const teamService = new TeamService();
    const statData = await teamService.getTeamStats(teamId, start, end);

    return NextResponse.json(statData, { status: 200 });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { message: `Failed to load data for stats` },
      { status: 500 }
    );
  }
}
