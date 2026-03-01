import { NextRequest, NextResponse } from "next/server";
import { VALID_TEAM_NAMES, SUPPORTED_STATS } from "@/constants";
import { TeamName, StatName } from "@/types";
import { AverageKillsStat } from "@/stats/averageKillsStat";
import { AverageDamageStat } from "@/stats/averageDamageStat";
import { WinRateStat } from "@/stats/winrateStat";
import { KillStealingStat } from "@/stats/killStealingStat";
import { TotalKillsStat } from "@/stats/totalKillsStat";
import { TotalDamageStat } from "@/stats/totalDamageStat";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string, statName: string }> }
) {
  const { teamId, statName } = await params;

  if (!teamId || !VALID_TEAM_NAMES.includes(teamId)) {
    return NextResponse.json(
      { message: `${teamId} is not a valid team name.` },
      { status: 400 }
    );
  }

  if (!statName || !SUPPORTED_STATS.includes(statName as StatName)) {
    return NextResponse.json(
      { message: `${statName} is not a supported stat.` },
      { status: 400 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const startStr = searchParams.get('start');
  const endStr = searchParams.get('end');

  let statClass;
  switch (statName as StatName) {
    case "avgKills":
      statClass = new AverageKillsStat();
      break;
    case "avgDamage":
      statClass = new AverageDamageStat();
      break;
    case "winRate":
      statClass = new WinRateStat();
      break;
    case "killStealing":
      statClass = new KillStealingStat();
      break;
    case "kills":
      statClass = new TotalKillsStat();
      break;
    case "damage":
      statClass = new TotalDamageStat();
      break;
    case "gameSummary":
      // Re-route them to the dedicated /games endpoint.
      return NextResponse.json(
        { message: `Data for ${statName} should be accessed via /api/team/[teamId]/games or /api/team/[teamId]/overview` },
        { status: 400 }
      );
    default:
      return NextResponse.json(
        { message: `Stat mapping for ${statName} is not implemented.` },
        { status: 501 }
      );
  }

  const stats = await statClass.getStats(teamId as TeamName);

  if (!stats) {
    return NextResponse.json(
      { message: `Failed to load data for stat: ${statName}` },
      { status: 500 }
    );
  }

  /* eslint-disable  @typescript-eslint/no-explicit-any */
  let statData: any[] = stats.data;

  // Apply range slicing if provided
  if (startStr !== null && endStr !== null) {
    const start = parseInt(startStr, 10);
    const end = parseInt(endStr, 10);

    if (!isNaN(start) && !isNaN(end) && start >= 0 && end >= start) {
      statData = statData.slice(start, end);
    }
  }

  // Preserve the chart options that the frontend consumes
  return NextResponse.json({
    chartOptions: stats.chartOptions,
    data: statData,
  }, { status: 200 });
}
