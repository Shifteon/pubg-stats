import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const editGamePayloadSchema = z.object({
  isWin: z.boolean(),
  matchType: z.enum(["duo", "squad"]),
  playedAt: z.date(),
  stats: z.array(z.object({
    playerId: z.string(),
    kills: z.number().default(0),
    assists: z.number().default(0),
    damage: z.number().default(0),
    rescues: z.number().default(0),
    recalls: z.number().default(0),
  }))
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;

    if (!gameId) {
      return NextResponse.json({ error: "Game ID is required" }, { status: 400 });
    }

    const body = await request.json();
    const parsedBody = editGamePayloadSchema.parse(body);

    const supabase = await createClient();

    // 1. Update the games table
    const updateData = {
      is_win: parsedBody.isWin,
      match_type: parsedBody.matchType,
    };

    const { error: gameError } = await supabase
      .from("games")
      .update(updateData)
      .eq("id", gameId);

    if (gameError) {
      console.error("Error updating game:", gameError);
      return NextResponse.json({ error: "Failed to update game" }, { status: 500 });
    }

    // 2. We do a full replacement of the game_player_stats for this game
    const { error: deleteError } = await supabase
      .from("game_player_stats")
      .delete()
      .eq("game_id", gameId);

    if (deleteError) {
      console.error("Error deleting old player stats:", deleteError);
      return NextResponse.json({ error: "Failed to clear old player stats" }, { status: 500 });
    }

    // 3. Insert the new stats
    if (parsedBody.stats && parsedBody.stats.length > 0) {
      const statsToInsert = parsedBody.stats.map(stat => ({
        game_id: gameId,
        player_id: stat.playerId,
        kills: stat.kills,
        assists: stat.assists,
        damage: stat.damage,
        rescues: stat.rescues,
        recalls: stat.recalls,
      }));

      const { error: statsError } = await supabase
        .from("game_player_stats")
        .insert(statsToInsert);

      if (statsError) {
        console.error("Error inserting updated player stats:", statsError);
        return NextResponse.json({ error: "Failed to insert updated player stats" }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, id: gameId }, { status: 200 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload", details: error }, { status: 400 });
    }
    console.error("Error in Game PUT API:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
