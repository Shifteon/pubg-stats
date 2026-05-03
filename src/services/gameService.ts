import { createClient } from "@/lib/supabase/server";
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
  played_at: string | null;
  game_player_stats: RawGamePlayerStat[] | null;
}

export class GameService {
  async getGamesForPlayer(playerId: string, matchType: string): Promise<Game[]> {
    const supabase = await createClient();

    const { data: pgData, error: pgError } = await supabase
      .from("game_player_stats")
      .select("game_id")
      .eq("player_id", playerId);

    if (pgError) {
      throw new Error("Failed to fetch player games: " + pgError.message);
    }

    if (!pgData || pgData.length === 0) {
      return [];
    }

    const gameIds = pgData.map(pg => pg.game_id);
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
        .eq("match_type", matchType);

      if (gamesError) {
        throw new Error("Failed to fetch game details: " + gamesError.message);
      }

      if (gamesChunk) {
        allGames.push(...(gamesChunk as unknown as RawGame[]));
      }
    }

    allGames.sort((a, b) => {
      if (a.played_at && b.played_at) {
        return new Date(b.played_at).getTime() - new Date(a.played_at).getTime();
      }
      if (a.played_at && !b.played_at) return -1;
      if (!a.played_at && b.played_at) return 1;
      return b.team_sort_order - a.team_sort_order;
    });

    const totalGames = allGames.length;
    const games: Game[] = allGames.map((game, index) => {
      return {
        id: game.id,
        teamId: game.team_id,
        gameNumber: totalGames - index,
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

    return z.array(gameSchema).parse(games);
  }

  async getGamesForTeam(teamId: string, startDate?: string | null, endDate?: string | null): Promise<Game[]> {
    const supabase = await createClient();

    let query = supabase
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
      .eq("team_id", teamId);

    if (startDate) {
      query = query.gte("played_at", startDate);
    }
    
    if (endDate) {
      query = query.lte("played_at", endDate);
    }

    const { data: gamesData, error: gamesError } = await query
      .order("played_at", { ascending: true, nullsFirst: true })
      .order("team_sort_order", { ascending: true });

    if (gamesError) {
      throw new Error("Failed to fetch games: " + gamesError.message);
    }

    if (!gamesData) {
      return [];
    }

    const games: Game[] = (gamesData as unknown as RawGame[]).map((game, index) => {
      return {
        id: game.id,
        teamId: game.team_id,
        gameNumber: index + 1,
        isWin: game.is_win ?? false,
        matchType: game.match_type as "duo" | "squad",
        playedAt: game.played_at ? new Date(game.played_at) : undefined,
        stats: (game.game_player_stats || [])
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
    });

    return z.array(gameSchema).parse(games);
  }

  async updateGame(gameId: string, payload: {
    isWin: boolean,
    matchType: "duo" | "squad",
    playedAt: Date,
    stats: {
      playerId: string,
      kills: number,
      assists: number,
      damage: number,
      rescues: number,
      recalls: number,
    }[]
  }): Promise<{ success: boolean, id: string }> {
    const supabase = await createClient();

    const updateData = {
      is_win: payload.isWin,
      match_type: payload.matchType,
      played_at: payload.playedAt.toISOString(),
    };

    const { error: gameError } = await supabase
      .from("games")
      .update(updateData)
      .eq("id", gameId);

    if (gameError) {
      throw new Error("Failed to update game: " + gameError.message);
    }

    if (payload.stats && payload.stats.length > 0) {
      const updatePromises = payload.stats.map(stat =>
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
        throw new Error("Failed to update player stats: " + errorResult.error?.message);
      }
    }

    return { success: true, id: gameId };
  }

  async deleteGame(gameId: string): Promise<{ success: boolean, id: string }> {
    const supabase = await createClient();

    const { error: gameError } = await supabase
      .from("games")
      .delete()
      .eq("id", gameId);

    if (gameError) {
      throw new Error("Failed to delete game: " + gameError.message);
    }

    return { success: true, id: gameId };
  }
}
