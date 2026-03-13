import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const createGamePayloadSchema = z.object({
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

export type CreateGamePayload = z.infer<typeof createGamePayloadSchema>;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;

    if (!teamId) {
      return NextResponse.json({ error: "Team ID is required" }, { status: 400 });
    }

    const body = await request.json();
    const parsedBody = createGamePayloadSchema.parse(body);

    const supabase = await createClient();

    // 1. Insert into games table
    const { data: gameData, error: gameError } = await supabase
      .from("games")
      .insert({
        team_id: teamId,
        is_win: parsedBody.isWin,
        match_type: parsedBody.matchType,
        played_at: parsedBody.playedAt,
      })
      .select("id")
      .single();

    if (gameError) {
      console.error("Error inserting game:", gameError);
      return NextResponse.json({ error: "Failed to insert game" }, { status: 500 });
    }

    if (!gameData || !gameData.id) {
      return NextResponse.json({ error: "Game ID not returned after insert" }, { status: 500 });
    }

    // 2. Insert into game_player_stats table
    if (parsedBody.stats && parsedBody.stats.length > 0) {
      const statsToInsert = parsedBody.stats.map(stat => ({
        game_id: gameData.id,
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
        console.error("Error inserting player stats:", statsError);
        // We could potentially delete the game here to rollback, but let's just return an error for now
        return NextResponse.json({ error: "Failed to insert player stats" }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, id: gameData.id }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Error in Team Game POST API:", error);
      return NextResponse.json({ error: "Invalid payload", details: error }, { status: 400 });
    }
    console.error("Error in Team Game POST API:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
