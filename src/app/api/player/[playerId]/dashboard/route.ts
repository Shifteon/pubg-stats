import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

interface PlayerResponse {
  name: string;
}

interface GamePlayerStatResponse {
  player_id: string;
  kills: number;
  assists: number;
  damage: number;
  rescues: number;
  recalls: number;
  players: PlayerResponse | PlayerResponse[] | null;
}

interface GameResponse {
  id: string;
  team_id: string;
  is_win: boolean;
  match_type: string;
  played_at: string;
  game_player_stats: GamePlayerStatResponse[] | null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ playerId: string }> }
) {
  try {
    const { playerId } = await params;
    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    if (!playerId) {
      return NextResponse.json({ error: "Player ID is required" }, { status: 400 });
    }

    if (!startDateParam || !endDateParam) {
      return NextResponse.json({ error: "Missing start or end date" }, { status: 400 });
    }

    const startDate = new Date(startDateParam).toISOString();
    const endDate = new Date(endDateParam).toISOString();

    const supabase = await createClient();

    // TODO: This is porbably the worst way to do this. 
    // Step 1: Find game IDs this player participated in within the date range
    const { data: pgData, error: pgError } = await supabase
      .from("game_player_stats")
      .select(`
        game_id,
        games!inner(played_at)
      `)
      .eq("player_id", playerId)
      .gte("games.played_at", startDate)
      .lte("games.played_at", endDate);

    if (pgError) {
      throw new Error("Failed to fetch player games: " + pgError.message);
    }

    if (!pgData || pgData.length === 0) {
      return NextResponse.json({
        periodGames: [],
        currentWinStreak: 0,
        heatmapDates: [],
      });
    }

    const gameIds = pgData.map(pg => pg.game_id);

    const CHUNK_SIZE = 100;
    const allGames: GameResponse[] = [];

    for (let i = 0; i < gameIds.length; i += CHUNK_SIZE) {
      const chunkIds = gameIds.slice(i, i + CHUNK_SIZE);
      const { data: gamesChunk, error: gamesError } = await supabase
        .from("games")
        .select(`
          id,
          team_id,
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
        .in("id", chunkIds)
        .not("played_at", "is", null);

      if (gamesError) {
        throw new Error("Failed to fetch game details: " + gamesError.message);
      }

      if (gamesChunk) {
        allGames.push(...gamesChunk);
      }
    }

    // Sort Newest -> Oldest
    allGames.sort((a, b) => new Date(b.played_at).getTime() - new Date(a.played_at).getTime());

    // 1. Heatmap Dates (only applicable to fetched range)
    const heatmapPoints: Record<string, number> = {};
    for (const game of allGames) {
      const gDate = new Date(game.played_at);
      const dateStr = gDate.toISOString().split('T')[0]; // "YYYY-MM-DD"
      heatmapPoints[dateStr] = (heatmapPoints[dateStr] || 0) + 1;
    }
    const heatmapDates = Object.entries(heatmapPoints).map(([date, count]) => ({ date, count }));

    // 2. Period Games formatting
    const periodGames = allGames.map(game => {
      return {
        id: game.id,
        teamId: game.team_id,
        gameNumber: 0, // Not super relevant for dashboard
        isWin: game.is_win ?? false,
        matchType: game.match_type,
        playedAt: game.played_at,
        stats: (game.game_player_stats || []).map((stat: GamePlayerStatResponse) => {
          let playerName = "Unknown";
          if (Array.isArray(stat.players)) {
            playerName = stat.players[0]?.name || "Unknown";
          } else if (stat.players && !Array.isArray(stat.players)) {
            playerName = stat.players.name || "Unknown";
          }
          return {
            playerId: stat.player_id,
            playerName,
            kills: stat.kills || 0,
            assists: stat.assists || 0,
            damage: stat.damage || 0,
            rescues: stat.rescues || 0,
            recalls: stat.recalls || 0,
          }
        })
      }
    });

    return NextResponse.json({
      periodGames,
      heatmapDates
    });

  } catch (error: unknown) {
    console.error(`Error in Dashboard API:`, error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Internal Server Error", details: errorMessage },
      { status: 500 }
    );
  }
}
