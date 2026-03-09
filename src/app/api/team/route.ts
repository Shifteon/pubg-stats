import { createClient } from "@/lib/supabase/server";
import { teamsSchema } from "@/types";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: teams, error } = await supabase.from("teams").select(`
    id,
    name,
    teamType:team_type,
    players(
      id,
      name,
      color,
      designation
    )
  `);

  if (error) {
    console.error("Error fetching teams:", error);
    return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 });
  }

  const teamData = teamsSchema.parse(teams);

  return NextResponse.json(teamData);
}
