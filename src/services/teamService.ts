import { createClient } from "@/lib/supabase/server";
import { teamOverviewSchema, TeamHallOfFame, TeamPersonalBest, PlayerMetadata, playerMetadataSchema, TeamOverview, TeamStatTimelinePoint } from "@/types";
import { calculateKillStealing } from "@/utils/statHelpers";

export class TeamService {
  async getTeamOverview(teamId: string): Promise<TeamOverview> {
    const { teamData, players } = await this.getTeamAndPlayers(teamId);

    const [stats, hallOfFame, teamPersonalBests] = await Promise.all([
      this.getGameStats(teamId),
      this.getHallOfFame(teamId),
      this.getTeamPersonalBests(teamId, players)
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

    return teamOverviewSchema.parse(overviewData);
  }

  async getTeamStats(teamId: string, start?: number, end?: number): Promise<TeamStatTimelinePoint[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .rpc('get_team_stats_over_time', { p_team_id: teamId });

    if (error) {
      console.error("Error fetching stats from Supabase:", error);
      throw new Error("Failed to load data for stats");
    }

    if (!data || data.length === 0) {
      return [];
    }

    const groupedData: Record<string, TeamStatTimelinePoint> = {};
    let currentGameIndex = 1;
    const gameIndexMap = new Map<string, number>();

    for (const row of data) {
      const gameId = row.game_id;
      if (!gameIndexMap.has(gameId)) {
        gameIndexMap.set(gameId, currentGameIndex++);
        groupedData[gameId] = {
          gameIndex: gameIndexMap.get(gameId)!,
          avgKills: {},
          avgDamage: {},
          kills: {},
          damage: {},
          winRate: 0,
          killStealing: {},
        };
      }

      const point = groupedData[gameId];
      const playerId = row.player_id;

      point.avgKills[playerId] = Number(row.running_avg_kills);
      point.avgKills["team"] = Number(row.running_avg_team_kills);

      point.avgDamage[playerId] = Number(row.running_avg_damage);
      point.avgDamage["team"] = Number(row.running_avg_team_damage);

      point.kills[playerId] = Number(row.running_sum_kills);
      point.kills["team"] = Number(row.running_team_kills);

      point.damage[playerId] = Number(row.running_sum_damage);
      point.damage["team"] = Number(row.running_team_damage);

      point.winRate = (Number(row.running_wins) / Number(row.games_played)) * 100;

      point.killStealing[playerId] = calculateKillStealing(
        Number(row.running_sum_kills),
        Number(row.running_sum_damage),
        Number(row.running_team_kills),
        Number(row.running_team_damage)
      );
    }

    let result = Object.values(groupedData).sort((a, b) => a.gameIndex - b.gameIndex);

    if (start !== undefined && end !== undefined && start >= 0 && end >= start) {
      result = result.slice(start, end);
    }

    return result;
  }

  private async getTeamAndPlayers(teamId: string) {
    const supabase = await createClient();
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
      .maybeSingle();

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

  private async getGameStats(teamId: string) {
    const supabase = await createClient();
    const { data: gamesData, error: gamesError } = await supabase
      .from("games")
      .select("id, is_win, team_sort_order")
      .eq("team_id", teamId)
      .order("played_at", { ascending: true, nullsFirst: true })
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

  private async getHallOfFame(teamId: string): Promise<TeamHallOfFame> {
    const supabase = await createClient();
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
          .maybeSingle();

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

  private async getTeamPersonalBests(teamId: string, players: PlayerMetadata[]): Promise<TeamPersonalBest> {
    const supabase = await createClient();
    const teamPersonalBests: TeamPersonalBest = {};
    const stats = ["kills", "assists", "damage", "rescues", "recalls"] as const;

    await Promise.all(
      players.map(async (player) => {
        const playerBests: Record<string, { stat: "kills" | "assists" | "damage" | "rescues" | "recalls"; statValue: number; gameId: string }> = {};

        await Promise.all(
          stats.map(async (stat) => {
            const { data, error } = await supabase
              .from("game_player_stats")
              .select(`game_id, ${stat}, games!inner(team_id)`)
              .eq("games.team_id", teamId)
              .eq("player_id", player.id)
              .order(stat, { ascending: false, nullsFirst: false })
              .limit(1)
              .maybeSingle();

            if (!error && data) {
              const row = data as Record<string, unknown>;
              playerBests[stat] = {
                stat: stat,
                statValue: (row[stat] as number) || 0,
                gameId: (row.game_id as string) || "",
              };
            } else {
              playerBests[stat] = {
                stat: stat,
                statValue: 0,
                gameId: "",
              };
            }
          })
        );

        teamPersonalBests[player.id] = {
          kills: playerBests.kills,
          assists: playerBests.assists,
          damage: playerBests.damage,
          rescues: playerBests.rescues,
          recalls: playerBests.recalls,
        };
      })
    );

    return teamPersonalBests;
  }
}
