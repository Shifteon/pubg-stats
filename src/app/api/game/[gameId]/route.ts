import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const editGamePayloadSchema = z.object({
  isWin: z.boolean(),
  matchType: z.enum(["duo", "squad"]),
  playedAt: z.string().transform((value) => new Date(value)),
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
      played_at: parsedBody.playedAt,
    };

    const { error: gameError } = await supabase
      .from("games")
      .update(updateData)
      .eq("id", gameId);

    if (gameError) {
      console.error("Error updating game:", gameError);
      return NextResponse.json({ error: "Failed to update game" }, { status: 500 });
    }

    // 2. Update individual player stats
    if (parsedBody.stats && parsedBody.stats.length > 0) {
      const updatePromises = parsedBody.stats.map(stat =>
        supabase
          .from("game_player_stats")
          .update({
            kills: stat.kills,
            assists: stat.assists,
            damage: stat.damage,
            rescues: stat.rescues,
            recalls: stat.recalls,
          })
          .eq("game_id", gameId)
          .eq("player_id", stat.playerId)
      );

      const results = await Promise.all(updatePromises);

      const errorResult = results.find(r => r.error);
      if (errorResult) {
        console.error("Error updating player stats:", errorResult.error);
        return NextResponse.json({ error: "Failed to update player stats" }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, id: gameId }, { status: 200 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Error in Game PUT API:", error);
      return NextResponse.json({ error: "Invalid payload", details: error }, { status: 400 });
    }
    console.error("Error in Game PUT API:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;

    if (!gameId) {
      return NextResponse.json({ error: "Game ID is required" }, { status: 400 });
    }

    const supabase = await createClient();

    const { error: gameError } = await supabase
      .from("games")
      .delete()
      .eq("id", gameId);

    if (gameError) {
      console.error("Error deleting game:", gameError);
      return NextResponse.json({ error: "Failed to delete game" }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: gameId }, { status: 200 });

  } catch (error) {
    console.error("Error in Game DELETE API:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
