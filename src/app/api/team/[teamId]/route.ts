import { NextRequest, NextResponse } from "next/server";
import {
  VALID_TEAM_NAMES,
  TEAM_DISPLAY_NAMES,
  TEAM_ABBREVIATIONS,
  TEAM_MEMBER_MAP,
  TEAM_LOWERCASE
} from "@/constants";

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

  const displayName = TEAM_DISPLAY_NAMES[teamId] || teamId;
  const abbreviation = TEAM_ABBREVIATIONS[teamId] || teamId;

  // Filter out the 'TEAM_LOWERCASE' alias, we only want actual player identifiers
  const players = (TEAM_MEMBER_MAP[teamId] || []).filter(
    (member) => member !== TEAM_LOWERCASE
  );

  return NextResponse.json(
    {
      teamId,
      displayName,
      abbreviation,
      size: players.length,
      players,
    },
    { status: 200 }
  );
}
