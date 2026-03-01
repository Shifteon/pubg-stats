import { NextRequest, NextResponse } from "next/server";
import { TEAM_MEMBER_MAP, VALID_TEAM_NAMES } from "@/constants";
import { TeamName } from "@/types";
import { GameSummaryStat } from "@/stats/gameSummaryStat";
import { IndividualName } from "@/types";

export interface HighestStat {
  player: IndividualName;
  value: number;
  stat: string;
  gameIndex: number;
}

const statKeys = ["kills", "assists", "damage", "rescues", "recalls"];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const startParam = searchParams.get("start");
    const endParam = searchParams.get("end");

    if (!VALID_TEAM_NAMES.includes(teamId)) {
      return NextResponse.json({ error: "Invalid team name" }, { status: 400 });
    }

    const statClass = new GameSummaryStat();
    const stats = await statClass.getStats(teamId as TeamName);
    let data = stats?.data;

    if (!data) {
      return NextResponse.json({ error: "Failed to fetch game summary stats" }, { status: 500 });
    }

    if (startParam !== null && endParam !== null) {
      const start = parseInt(startParam, 10);
      const end = parseInt(endParam, 10);
      if (!isNaN(start) && !isNaN(end)) {
        data = data.slice(start, end);
      }
    }

    const players = TEAM_MEMBER_MAP[teamId] || [];

    const highestStats = statKeys.map(stat => {
      let highest: HighestStat = { player: players[0] as IndividualName || "ben", value: -1, stat, gameIndex: -1 };

      data.forEach((game: Record<string, unknown>) => {
        players.forEach(player => {
          const playerStatKey = `${player}_${stat}`;
          const rawStatValue = game[playerStatKey];
          const statValue = typeof rawStatValue === "string" ? parseFloat(rawStatValue) : (typeof rawStatValue === "number" ? rawStatValue : 0);
          if (statValue > highest.value) {
            highest = { player: player as IndividualName, value: statValue, stat, gameIndex: game.gameIndex as number };
          }
        });
      });

      return highest;
    });

    return NextResponse.json(highestStats);
  } catch (error) {
    console.error("Error fetching hall of fame stats:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
