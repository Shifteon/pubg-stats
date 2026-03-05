import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { teamOverviewSchema, TeamHallOfFame, TeamPersonalBest, PlayerMetadata, playerMetadataSchema } from "@/types";

async function getTeamAndPlayers(teamId: string) {
  const { data: teamData, error: teamError } = await supabase
    .from("teams")
    .select(`
      id, name, team_type,
      team_players (
        players (
          id, name, color, designation
        )
      )
    `)
    .eq("id", teamId)
    .single();

  if (teamError) {
    throw new Error("Failed to fetch team data: " + teamError.message);
  }

  if (!teamData) {
    throw new Error("Team not found");
  }

  const players: PlayerMetadata[] = (teamData.team_players || [])
    .map((tp) => tp.players)
    .filter((p) => p !== null && typeof p === "object")
    .map((p) => {
      const player = p as unknown as Record<string, unknown>;
      return playerMetadataSchema.parse({
        id: player.id,
        name: player.name,
        color: player.color || "",
        designation: player.designation || "",
      });
    });

  return { teamData, players };
}

async function getGameStats(teamId: string) {
  const { data: gamesData, error: gamesError } = await supabase
    .from("games")
    .select("id, is_win, team_sort_order")
    .eq("team_id", teamId)
    .order("team_sort_order", { ascending: true });

  if (gamesError) {
    throw new Error("Failed to fetch games: " + gamesError.message);
  }

  let totalGames = 0;
  let totalWins = 0;
  let totalLosses = 0;
  let currentWinStreak = 0;
  let winStreak = 0;
  let longestWinStreak = 0;

  if (gamesData) {
    for (const game of gamesData) {
      if (game.is_win !== null) {
        totalGames++;
        if (game.is_win) {
          totalWins++;
          currentWinStreak++;
          if (currentWinStreak > longestWinStreak) {
            longestWinStreak = currentWinStreak;
          }
        } else {
          totalLosses++;
          currentWinStreak = 0;
        }
      }
    }
    winStreak = currentWinStreak;
  }

  const winRate = totalGames > 0 ? (totalWins / totalGames) * 100 : 0;

  return { totalGames, totalWins, totalLosses, winStreak, longestWinStreak, winRate };
}

async function getHallOfFame(teamId: string): Promise<TeamHallOfFame> {
  const stats = ["kills", "assists", "damage", "rescues", "recalls"] as const;
  const hallOfFame: TeamHallOfFame = {};

  await Promise.all(
    stats.map(async (stat) => {
      const { data, error } = await supabase
        .from("game_player_stats")
        .select(`player_id, game_id, ${stat}, games!inner(team_id)`)
        .eq("games.team_id", teamId)
        .order(stat, { ascending: false, nullsFirst: false })
        .limit(1)
        .single();

      if (!error && data) {
        const row = data as Record<string, unknown>;
        hallOfFame[stat] = {
          playerId: data.player_id,
          gameId: data.game_id,
          statPair: {
            stat: stat,
            statValue: (row[stat] as number) || 0,
          },
        };
      } else {
        hallOfFame[stat] = {
          playerId: "",
          gameId: "",
          statPair: { stat, statValue: 0 },
        };
      }
    })
  );

  return hallOfFame;
}

async function getTeamPersonalBests(teamId: string, players: PlayerMetadata[]): Promise<TeamPersonalBest> {
  const teamPersonalBests: TeamPersonalBest = {};

  await Promise.all(
    players.map(async (player) => {
      const { data, error } = await supabase
        .from("game_player_stats")
        .select(`
          max_kills:kills.max(),
          max_assists:assists.max(),
          max_damage:damage.max(),
          max_rescues:rescues.max(),
          max_recalls:recalls.max(),
          games!inner(team_id)
        `)
        .eq("games.team_id", teamId)
        .eq("player_id", player.id)
        .single();

      if (!error && data) {
        teamPersonalBests[player.id] = {
          kills: { stat: "kills", statValue: data.max_kills || 0 },
          assists: { stat: "assists", statValue: data.max_assists || 0 },
          damage: { stat: "damage", statValue: data.max_damage || 0 },
          rescues: { stat: "rescues", statValue: data.max_rescues || 0 },
          recalls: { stat: "recalls", statValue: data.max_recalls || 0 },
        };
      } else {
        teamPersonalBests[player.id] = {
          kills: { stat: "kills", statValue: 0 },
          assists: { stat: "assists", statValue: 0 },
          damage: { stat: "damage", statValue: 0 },
          rescues: { stat: "rescues", statValue: 0 },
          recalls: { stat: "recalls", statValue: 0 },
        };
      }
    })
  );

  return teamPersonalBests;
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

    const { teamData, players } = await getTeamAndPlayers(teamId);

    // Run the remaining independent queries in parallel
    const [stats, hallOfFame, teamPersonalBests] = await Promise.all([
      getGameStats(teamId),
      getHallOfFame(teamId),
      getTeamPersonalBests(teamId, players)
    ]);

    const overviewData = {
      teamId: teamData.id,
      teamName: teamData.name,
      teamType: teamData.team_type,
      players,
      ...stats,
      hallOfFame,
      teamPersonalBests,
    };

    const parsedOverview = teamOverviewSchema.parse(overviewData);

    return NextResponse.json(parsedOverview);

  } catch (error) {
    console.error("Error in Team Overview API:", error);
    if (error instanceof Error && error.message === "Team not found") {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Internal Server Error", details: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
