import { createClient } from "@/lib/supabase/server";
import { Player, playerSchema, playerAveragesSchema, PlayerAverages, PlayerTeamStats } from "@/types";

interface DashboardRawPlayer {
  name: string;
}

interface DashboardRawGamePlayerStat {
  player_id: string;
  kills: number | null;
  assists: number | null;
  damage: number | null;
  rescues: number | null;
  recalls: number | null;
  players: DashboardRawPlayer | DashboardRawPlayer[] | null;
}

interface DashboardRawGame {
  id: string;
  team_id: string;
  is_win: boolean | null;
  match_type: string;
  played_at: string;
  game_player_stats: DashboardRawGamePlayerStat[] | null;
}

export class PlayerService {
  /** Fetch global averages and total games */
  async getPlayerAverages(playerId: string): Promise<PlayerAverages> {
    const supabase = await createClient();
    
    const { data: averages, error } = await supabase
      .from("game_player_stats")
      .select(`
        avgKills:kills.avg(), 
        avgAssists:assists.avg(), 
        avgDamage:damage.avg(), 
        avgRescues:rescues.avg(), 
        avgRecalls:recalls.avg(),
        totalGamesPlayed:id.count()
      `)
      .eq("player_id", playerId)
      .single();

    if (error) {
      console.error("Error fetching player stats:", error);
      throw new Error("Failed to fetch player stats");
    }

    if (!averages) {
      return playerAveragesSchema.parse({
        playerId,
        kills: 0,
        assists: 0,
        damage: 0,
        rescues: 0,
        recalls: 0,
      });
    }

    return playerAveragesSchema.parse({
      playerId,
      kills: Number(averages.avgKills ?? 0),
      assists: Number(averages.avgAssists ?? 0),
      damage: Number(averages.avgDamage ?? 0),
      rescues: Number(averages.avgRescues ?? 0),
      recalls: Number(averages.avgRecalls ?? 0),
    });
  }

  async getPlayerOverview(playerId: string): Promise<Player> {
    const supabase = await createClient();

    const [player, playerAverages, winsData, winStreak] = await Promise.all([
      supabase
        .from("players")
        .select("id, name, color, designation, userId")
        .eq("id", playerId)
        .single()
        .then(res => res.data),
      this.getPlayerAverages(playerId),
      supabase
        .from("game_player_stats")
        .select("id, games!inner(is_win)")
        .eq("player_id", playerId)
        .eq("games.is_win", true)
        .then(res => res.data?.length ?? 0),
      this.getPlayerWinStreak(playerId),
    ]);

    if (!player) {
      throw new Error("Player not found");
    }

    const { data: globalStats } = await supabase
      .from("game_player_stats")
      .select("totalGamesPlayed:id.count()")
      .eq("player_id", playerId)
      .single();

    const totalGamesPlayed = Number(globalStats?.totalGamesPlayed ?? 0);
    const wins = winsData;
    const totalLosses = totalGamesPlayed - wins;
    const winRate = totalGamesPlayed > 0 ? (wins / totalGamesPlayed) * 100 : 0;

    const playerTeamStats = await this.getPlayerTeamStats(playerId);

    let mostPlayedTeam = "Unknown";
    let maxTeamGames = -1;
    for (const stat of playerTeamStats) {
      if (stat.gamesPlayed > maxTeamGames) {
        maxTeamGames = stat.gamesPlayed;
        mostPlayedTeam = stat.teamName;
      }
    }

    const result = {
      id: player.id,
      name: player.name,
      color: player.color || "",
      designation: player.designation || "",
      userId: player.userId || undefined,
      playerAverages: playerAverages,
      totalGamesPlayed,
      totalWins: wins,
      totalLosses,
      winRate,
      winStreak,
      mostPlayedTeam,
      playerTeamStats,
    };

    return playerSchema.parse(result);
  }

  async getPlayerDashboard(playerId: string, startDate: string, endDate: string) {
    const supabase = await createClient();

    const { data: pgData, error: pgError } = await supabase
      .from("game_player_stats")
      .select(`
        game_id,
        games!inner(played_at)
      `)
      .eq("player_id", playerId)
      .gte("games.played_at", startDate)
      .lte("games.played_at", endDate);

    if (pgError) throw new Error("Failed to fetch player games: " + pgError.message);

    if (!pgData || pgData.length === 0) {
      return { periodGames: [], heatmapDates: [] };
    }

    const gameIds = pgData.map(pg => pg.game_id);
    const CHUNK_SIZE = 100;
    const allGames: DashboardRawGame[] = [];

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

      if (gamesError) throw new Error("Failed to fetch game details: " + gamesError.message);
      if (gamesChunk) allGames.push(...gamesChunk);
    }

    allGames.sort((a, b) => new Date(b.played_at).getTime() - new Date(a.played_at).getTime());

    const heatmapPoints: Record<string, number> = {};
    for (const game of allGames) {
      const gDate = new Date(game.played_at);
      const dateStr = gDate.toISOString().split('T')[0];
      heatmapPoints[dateStr] = (heatmapPoints[dateStr] || 0) + 1;
    }
    const heatmapDates = Object.entries(heatmapPoints).map(([date, count]) => ({ date, count }));

    const periodGames = allGames.map(game => {
      return {
        id: game.id,
        teamId: game.team_id,
        gameNumber: 0,
        isWin: game.is_win ?? false,
        matchType: game.match_type,
        playedAt: game.played_at,
        stats: (game.game_player_stats || []).map((stat: DashboardRawGamePlayerStat) => {
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

    return { periodGames, heatmapDates };
  }

  private async getPlayerTeamStats(playerId: string): Promise<PlayerTeamStats[]> {
    const supabase = await createClient();
    const playerTeamStats: PlayerTeamStats[] = [];

    const { data: statsData, error: statsError } = await supabase
      .from("player_team_avgs")
      .select(`
        avgKills: average_kills,
        avgDamage: average_damage,
        gamesPlayed:games_played,
        teamId:team_id,
        teamName:team_name
      `)
      .eq('player_id', playerId);

    const { data: winsData, error: winsError } = await supabase
      .from("player_team_wins")
      .select(`
        wins:wins,
        teamId:team_id,
        teamName:team_name
      `)
      .eq("player_id", playerId);

    if (statsError) throw statsError;
    if (winsError) throw winsError;

    const sortedWins = winsData.sort((a, b) => a.teamId.localeCompare(b.teamId));
    const sortedStats = statsData.sort((a, b) => a.teamId.localeCompare(b.teamId));

    if (sortedWins && sortedStats) {
      for (let i = 0; i < sortedWins.length; i++) {
        const win = sortedWins[i];
        const stat = sortedStats[i];
        if (win.teamId === stat.teamId) {
          playerTeamStats.push({
            teamId: stat.teamId,
            teamName: stat.teamName,
            gamesPlayed: stat.gamesPlayed,
            winRate: (win.wins / stat.gamesPlayed) * 100,
            averageKills: stat.avgKills,
            averageDamage: stat.avgDamage,
          });
        }
      }
    }

    return playerTeamStats;
  }

  private async getPlayerWinStreak(playerId: string): Promise<number> {
    const supabase = await createClient();
    const { data: gamesData, error } = await supabase
      .from("games")
      .select("is_win, game_player_stats!inner(player_id)")
      .eq("game_player_stats.player_id", playerId)
      .not("played_at", "is", null)
      .order("played_at");

    if (error) {
      console.error("Error fetching games for win streak:", error);
      return 0;
    }

    let streak = 0;
    for (const game of gamesData) {
      if (game.is_win) {
        streak++;
      } else {
        streak = 0;
      }
    }
    return streak;
  }
}
