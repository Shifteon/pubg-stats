import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { Game, gameSchema } from "@/types";

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
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string; gameId: string }> }
) {
  try {
    const { teamId, gameId } = await params;

    if (!teamId || !gameId) {
      return NextResponse.json({ error: "Team ID and Game ID are required" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: gameData, error: gameError } = await supabase
      .from("games")
      .select(`
        id,
        team_id,
        team_sort_order,
        is_win,
        match_type,
        played_at,
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
      .eq("id", gameId)
      .eq("team_id", teamId)
      .maybeSingle();

    if (gameError) {
      throw new Error("Failed to fetch game: " + gameError.message);
    }

    if (!gameData) {
      return NextResponse.json({ error: "Game not found or not associated with this team" }, { status: 404 });
    }

    // Calculate gameNumber by fetching all game IDs sorted correctly and finding the index
    const { data: allGames, error: allGamesError } = await supabase
      .from("games")
      .select("id")
      .eq("team_id", teamId)
      .order("played_at", { ascending: true, nullsFirst: true })
      .order("team_sort_order", { ascending: true });

    if (allGamesError) {
      throw new Error("Failed to calculate game number: " + allGamesError.message);
    }

    const rawGame = gameData as unknown as RawGame;

    const gameIndex = allGames.findIndex(g => g.id === gameId);
    const gameNumber = gameIndex !== -1 ? gameIndex + 1 : 1;

    const game: Game = {
      id: rawGame.id,
      teamId: rawGame.team_id,
      gameNumber: gameNumber,
      isWin: rawGame.is_win ?? false,
      matchType: (rawGame.match_type as "duo" | "squad"),
      playedAt: rawGame.played_at ? new Date(rawGame.played_at) : undefined,
      stats: (rawGame.game_player_stats || [])
        .map(stat => {
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
        })
        .sort((a, b) => a.playerName.localeCompare(b.playerName)),
    };

    const parsedGame = gameSchema.parse(game);

    return NextResponse.json(parsedGame);

  } catch (error) {
    console.error("Error in Team Game API:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
