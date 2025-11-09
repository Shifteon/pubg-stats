"use client";

import { Card, CardBody, CardHeader } from "@heroui/react";
import { useMemo } from "react";

export interface OverviewProps {
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  gameData: any[];
}

export default function Overview({ gameData }: OverviewProps) {
  const { wins, losses, winRate, winStreak, longestWinStreak } = useMemo(() => {
    if (!gameData || gameData.length === 0) {
      return { wins: 0, losses: 0, winRate: 0, winStreak: 0, longestWinStreak: 0 };
    }

    const summary = gameData.reduce(
      (acc, game) => {
        if (game.win === 1) {
          acc.wins++;
          acc.currentStreak++;
        } else {
          acc.losses++;
          acc.longestStreak = Math.max(acc.longestStreak, acc.currentStreak);
          acc.currentStreak = 0;
        }
        return acc;
      },
      { wins: 0, losses: 0, currentStreak: 0, longestStreak: 0 }
    );

    const finalLongestStreak = Math.max(summary.longestStreak, summary.currentStreak);

    const totalGames = gameData.length;
    const calculatedWinRate = totalGames > 0 ? (summary.wins / totalGames) * 100 : 0;

    return {
      wins: summary.wins,
      losses: summary.losses,
      winRate: calculatedWinRate,
      winStreak: summary.currentStreak,
      longestWinStreak: finalLongestStreak,
    };
  }, [gameData]);

  return (
    <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <Card><CardHeader className="justify-center"><h3 className="text-lg font-semibold">Total Games</h3></CardHeader><CardBody className="text-center text-3xl font-bold">{gameData.length}</CardBody></Card>
      <Card><CardHeader className="justify-center"><h3 className="text-lg font-semibold">Wins / Losses</h3></CardHeader><CardBody className="text-center text-3xl font-bold">{wins} / {losses}</CardBody></Card>
      <Card><CardHeader className="justify-center"><h3 className="text-lg font-semibold">Win Rate</h3></CardHeader><CardBody className="text-center text-3xl font-bold">{winRate.toFixed(2)}%</CardBody></Card>
      <Card><CardHeader className="justify-center"><h3 className="text-lg font-semibold">Win Streak</h3></CardHeader><CardBody className="text-center text-3xl font-bold">{winStreak}</CardBody></Card>
      <Card><CardHeader className="justify-center"><h3 className="text-lg font-semibold">Longest Win Streak</h3></CardHeader><CardBody className="text-center text-3xl font-bold">{longestWinStreak}</CardBody></Card>
    </div>
  );
}