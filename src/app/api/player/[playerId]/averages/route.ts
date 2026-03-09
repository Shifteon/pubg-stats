import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { playerAveragesSchema } from "@/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ playerId: string }> }
) {
  const { playerId } = await params;

  if (!playerId) {
    return NextResponse.json({ error: "Player ID is required" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: averages, error } = await supabase
    .from("game_player_stats")
    .select(`
      avgKills:kills.avg(), 
      avgAssists:assists.avg(), 
      avgDamage:damage.avg(), 
      avgRescues:rescues.avg(), 
      avgRecalls:recalls.avg()
    `)
    .eq("player_id", playerId)
    .single();

  if (error) {
    console.error("Error fetching player stats:", error);
    return NextResponse.json({ error: "Failed to fetch player stats" }, { status: 500 });
  }

  if (!averages) {
    return NextResponse.json(playerAveragesSchema.parse({
      playerId,
      kills: 0,
      assists: 0,
      damage: 0,
      rescues: 0,
      recalls: 0,
    }));
  }

  const averagesObject = {
    playerId,
    kills: averages.avgKills,
    assists: averages.avgAssists,
    damage: averages.avgDamage,
    rescues: averages.avgRescues,
    recalls: averages.avgRecalls,
  }

  const parsedAverages = playerAveragesSchema.parse(averagesObject);

  return NextResponse.json(parsedAverages);
}
