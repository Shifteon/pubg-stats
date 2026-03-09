import { NextRequest, NextResponse } from "next/server";
import { TeamStatTimelinePoint } from "@/types";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;

  if (!teamId) {
    return NextResponse.json(
      { message: `${teamId} is not a valid team name.` },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .rpc('get_team_stats_over_time', { p_team_id: teamId });

  if (error) {
    console.error("Error fetching stats from Supabase:", error);
    return NextResponse.json(
      { message: `Failed to load data for stats` },
      { status: 500 }
    );
  }

  if (!data || data.length === 0) {
    return NextResponse.json([], { status: 200 });
  }

  // The RPC returns multiple rows per game (one per player). 
  // We need to group them by game_id to build the Timeline objects expected by the frontend.
  const groupedData: Record<string, TeamStatTimelinePoint> = {};

  // Track game indices monotonically. The SQL order by `team_sort_order` ensures they come in chronologically.
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
    const playerId = row.player_id; // Using player ID as requested

    point.avgKills[playerId] = Number(row.running_avg_kills);
    point.avgKills["team"] = Number(row.running_avg_team_kills);

    point.avgDamage[playerId] = Number(row.running_avg_damage);
    point.avgDamage["team"] = Number(row.running_avg_team_damage);

    point.kills[playerId] = Number(row.running_sum_kills);
    point.kills["team"] = Number(row.running_team_kills);

    point.damage[playerId] = Number(row.running_sum_damage);
    point.damage["team"] = Number(row.running_team_damage);

    point.winRate = (Number(row.running_wins) / Number(row.games_played)) * 100;

    // Prevent div by zero for kill stealing calculation
    if (Number(row.running_team_kills) > 0 && Number(row.running_team_damage) > 0) {
      const killRatio = Number(row.running_sum_kills) / Number(row.running_team_kills);
      const damageRatio = Number(row.running_sum_damage) / Number(row.running_team_damage);
      point.killStealing[playerId] = (killRatio - damageRatio) * 100;
    } else {
      point.killStealing[playerId] = 0;
    }
  }

  const result = Object.values(groupedData).sort((a, b) => a.gameIndex - b.gameIndex);

  const searchParams = request.nextUrl.searchParams;
  const startStr = searchParams.get('start');
  const endStr = searchParams.get('end');

  let statData = result;

  // Apply range slicing if provided
  if (startStr !== null && endStr !== null) {
    const start = parseInt(startStr, 10);
    const end = parseInt(endStr, 10);

    if (!isNaN(start) && !isNaN(end) && start >= 0 && end >= start) {
      statData = statData.slice(start, end);
    }
  }

  return NextResponse.json(statData, { status: 200 });
}
