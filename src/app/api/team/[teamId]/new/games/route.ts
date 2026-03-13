import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { Game, gameSchema } from "@/types";
import { z } from "zod";

interface RawPlayer {
  name: string;
}

interface RawGamePlayerStat {
  player_id: string;
  kills: number | null;
  assists: number | null;
  damage: number | null;
  rescues: number | null;
  recalls: number | null;
  players: RawPlayer | RawPlayer[] | null;
}

interface RawGame {
  id: string;
  team_id: string;
  team_sort_order: number;
  is_win: boolean | null;
  match_type: string;
  game_player_stats: RawGamePlayerStat[] | null;
  played_at: string | null;
  created_at: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;

    if (!teamId) {
      return NextResponse.json({ error: "Team ID is required" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: gamesData, error: gamesError } = await supabase
      .from("games")
      .select(`
        id,
        team_id,
        team_sort_order,
        is_win,
        match_type,
        played_at,
        created_at,
        game_player_stats (
          player_id,
          kills,
          assists,
          damage,
          rescues,
          recalls,
          players (
            name
          )
        )
      `)
      .eq("team_id", teamId)
      .order("played_at", { ascending: true, nullsFirst: true })
      .order("team_sort_order", { ascending: true });

    if (gamesError) {
      throw new Error("Failed to fetch games: " + gamesError.message);
    }

    if (!gamesData) {
      return NextResponse.json([]);
    }

    const games: Game[] = (gamesData as unknown as RawGame[]).map((game, index) => {
      return {
        id: game.id,
        teamId: game.team_id,
        gameNumber: index + 1, // 1-indexed, chronological
        isWin: game.is_win ?? false,
        matchType: game.match_type as "duo" | "squad",
        playedAt: game.played_at ? new Date(game.played_at) : undefined,
        stats: (game.game_player_stats || []).map(stat => {
          let playerName = "Unknown";
          if (stat.players) {
            if (Array.isArray(stat.players)) {
              playerName = stat.players[0]?.name || "Unknown";
            } else {
              playerName = stat.players.name || "Unknown";
            }
          }
          return {
            playerId: stat.player_id,
            playerName: playerName,
            kills: stat.kills || 0,
            assists: stat.assists || 0,
            damage: stat.damage || 0,
            rescues: stat.rescues || 0,
            recalls: stat.recalls || 0,
          };
        }),
      };
    });

    const parsedGames = z.array(gameSchema).parse(games);

    return NextResponse.json(parsedGames);

  } catch (error) {
    console.error("Error in Team Games API:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
