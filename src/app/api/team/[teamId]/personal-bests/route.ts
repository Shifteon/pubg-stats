import { NextRequest, NextResponse } from "next/server";
import { TEAM_MEMBER_MAP, VALID_TEAM_NAMES } from "@/constants";
import { TeamName } from "@/types";
import { GameSummaryStat } from "@/stats/gameSummaryStat";

export interface StatValue {
  value: number;
  game: Record<string, unknown> | null;
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

    const players = TEAM_MEMBER_MAP[teamId].filter((player) => player !== "team") || [];
    const playerBests: Record<string, Record<string, StatValue>> = {};

    players.forEach((player) => {
      playerBests[player] = {};
      statKeys.forEach((stat) => {
        playerBests[player][stat] = { value: 0, game: null };
      });
    });

    data.forEach((game: Record<string, unknown>) => {
      players.forEach((player) => {
        statKeys.forEach((stat) => {
          const playerStatKey = `${player}_${stat}`;
          const rawStatValue = game[playerStatKey];
          const statValue = typeof rawStatValue === "string" ? parseFloat(rawStatValue) : (typeof rawStatValue === "number" ? rawStatValue : 0);

          const currentBest = playerBests[player][stat];
          if (statValue > currentBest.value) {
            playerBests[player][stat] = { value: statValue, game };
          }
        });
      });
    });

    return NextResponse.json(playerBests);
  } catch (error) {
    console.error("Error fetching personal best stats:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
