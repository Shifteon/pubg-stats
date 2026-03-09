import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { playerSchema, PlayerTeamStats } from "@/types";
import { SupabaseClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

/** Fetch player base information */
async function fetchPlayerBase(supabase: SupabaseClient, playerId: string) {
  const { data: player, error } = await supabase
    .from("players")
    .select("id, name, color, designation")
    .eq("id", playerId)
    .single();

  if (error) throw error;
  return player;
}

/** Fetch global averages and total games */
async function fetchPlayerAverages(supabase: SupabaseClient, playerId: string) {
  const { data: globalStats, error } = await supabase
    .from("game_player_stats")
    .select(`
      kills:kills.avg(),
      assists:assists.avg(),
      damage:damage.avg(),
      rescues:rescues.avg(),
      recalls:recalls.avg(),
      totalGamesPlayed:id.count()
    `)
    .eq("player_id", playerId)
    .single();

  if (error) throw error;
  return {
    kills: Number(globalStats?.kills ?? 0),
    assists: Number(globalStats?.assists ?? 0),
    damage: Number(globalStats?.damage ?? 0),
    rescues: Number(globalStats?.rescues ?? 0),
    recalls: Number(globalStats?.recalls ?? 0),
    totalGamesPlayed: Number(globalStats?.totalGamesPlayed ?? 0),
  };
}

/** Fetch total wins by joining `games` table to check is_win = true */
async function fetchTotalWins(supabase: SupabaseClient, playerId: string) {
  const { data: winsData, error } = await supabase
    .from("game_player_stats")
    .select("id, games!inner(is_win)")
    .eq("player_id", playerId)
    .eq("games.is_win", true);

  if (error) throw error;
  return winsData?.length ?? 0;
}

/** Fetch and aggregate stats grouped for each team a player is in */
async function fetchPlayerTeamStats(supabase: SupabaseClient, playerId: string): Promise<PlayerTeamStats[]> {
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

  //sort winsData and statsData by teamId
  const sortedWins = winsData.sort((a, b) => a.teamId - b.teamId);
  const sortedStats = statsData.sort((a, b) => a.teamId - b.teamId);

  if (sortedWins && sortedStats) {
    if (sortedWins.length !== sortedStats.length) {
      throw new Error("Wins and stats data length mismatch");
    }
    for (let i = 0; i < sortedWins.length; i++) {
      const win = sortedWins[i];
      const stat = sortedStats[i];
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

  return playerTeamStats;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ playerId: string }> }
) {
  const { playerId } = await params;

  if (!playerId) {
    return NextResponse.json({ error: "Player ID is required" }, { status: 400 });
  }

  try {
    const supabase = await createClient();

    const [player, playerAverages, wins] = await Promise.all([
      fetchPlayerBase(supabase, playerId),
      fetchPlayerAverages(supabase, playerId),
      fetchTotalWins(supabase, playerId),
    ]);

    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    const totalLosses = playerAverages.totalGamesPlayed - wins;
    const winRate = playerAverages.totalGamesPlayed > 0 ? (wins / playerAverages.totalGamesPlayed) * 100 : 0;

    const playerTeamStats = await fetchPlayerTeamStats(supabase, playerId);

    // Determine the most played team
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
      playerAverages: {
        playerId,
        ...playerAverages,
      },
      totalGamesPlayed: playerAverages.totalGamesPlayed,
      totalWins: wins,
      totalLosses,
      winRate,
      mostPlayedTeam,
      playerTeamStats,
    };

    const parsedPlayer = playerSchema.parse(result);
    return NextResponse.json(parsedPlayer);
  } catch (error) {
    console.error("Error fetching player:", error);
    return NextResponse.json({ error: "Failed to fetch player stats" }, { status: 500 });
  }
}
