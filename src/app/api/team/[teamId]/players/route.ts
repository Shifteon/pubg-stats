import { NextRequest, NextResponse } from "next/server";
import {
  VALID_TEAM_NAMES,
  TEAM_MEMBER_MAP,
  TEAM_LOWERCASE,
  PLAYER_NAMES,
  PLAYER_COLOR_MAP,
  PLAYER_DESIGNATIONS
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

  // Filter out the 'TEAM_LOWERCASE' alias, we only want actual player identifiers
  const playersIds = (TEAM_MEMBER_MAP[teamId] || []).filter(
    (member) => member !== TEAM_LOWERCASE && PLAYER_NAMES.includes(member)
  );

  const players = playersIds.map(id => ({
    id,
    name: id.charAt(0).toUpperCase() + id.slice(1),
    color: PLAYER_COLOR_MAP[id],
    designation: PLAYER_DESIGNATIONS[id] || "The Player",
  }));

  return NextResponse.json(
    { players },
    { status: 200 }
  );
}
