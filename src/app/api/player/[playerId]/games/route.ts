import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { Game, gameSchema } from "@/types";
import { z } from "zod";

interface RawPlayer {
  name: string;
}

interface RawGamePlayerStat {
  player_id: string;
  game_id?: string;
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
  created_at: string;
  game_player_stats: RawGamePlayerStat[] | null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ playerId: string }> }
) {
  try {
    const { playerId } = await params;
    const { searchParams } = new URL(request.url);
    const matchType = searchParams.get("matchType") || "squad";

    if (!playerId) {
      return NextResponse.json({ error: "Player ID is required" }, { status: 400 });
    }

    if (matchType !== "squad" && matchType !== "duo") {
      return NextResponse.json({ error: "Invalid matchType, must be 'squad' or 'duo'" }, { status: 400 });
    }

    // Step 1: Find all game IDs this player participated in
    const { data: pgData, error: pgError } = await supabase
      .from("game_player_stats")
      .select("game_id")
      .eq("player_id", playerId);

    if (pgError) {
      throw new Error("Failed to fetch player games: " + pgError.message);
    }

    if (!pgData || pgData.length === 0) {
      return NextResponse.json([]);
    }

    const gameIds = pgData.map(pg => pg.game_id);

    // Step 2: Fetch full game details for these game IDs, filtered by matchType
    // To avoid URI too long errors for many games, we could chunk, or we can just pass them as a list to postgrest.
    // In practice, since this runs on the server, we use standard Supabase select query.

    // We'll chunk the gameIds to be safe against URL length limits.
    const CHUNK_SIZE = 100;
    const allGames: RawGame[] = [];

    for (let i = 0; i < gameIds.length; i += CHUNK_SIZE) {
      const chunkIds = gameIds.slice(i, i + CHUNK_SIZE);
      const { data: gamesChunk, error: gamesError } = await supabase
        .from("games")
        .select(`
          id,
          team_id,
          team_sort_order,
          is_win,
          match_type,
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
        .in("id", chunkIds)
        .eq("match_type", matchType);

      if (gamesError) {
        throw new Error("Failed to fetch game details: " + gamesError.message);
      }

      if (gamesChunk) {
        allGames.push(...(gamesChunk as unknown as RawGame[]));
      }
    }

    // Sort by team_sort_order ascending to determine gameNumber
    allGames.sort((a, b) => a.team_sort_order - b.team_sort_order);

    const games: Game[] = allGames.map((game, index) => {
      return {
        id: game.id,
        teamId: game.team_id,
        gameNumber: index + 1, // Chronological game number for this player & matchType
        isWin: game.is_win ?? false,
        matchType: game.match_type as "duo" | "squad",
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

    // Reverse array to return most recent games first
    games.reverse();

    const parsedGames = z.array(gameSchema).parse(games);

    return NextResponse.json(parsedGames);

  } catch (error) {
    console.error(`Error in Player Games API:`, error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
