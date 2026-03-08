import { Card, CardBody, CardHeader } from "@heroui/react";

export interface OverviewProps {
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
  winStreak: number;
  longestWinStreak: number;
  start?: number;
  end?: number;
}

export default function Overview({ totalGames, wins, losses, winRate, winStreak, longestWinStreak }: OverviewProps) {
  return (
    <div className="relative w-full">
      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4`}>
        <Card><CardHeader className="justify-center"><h3 className="text-lg font-semibold">Total Games</h3></CardHeader><CardBody className="text-center text-3xl font-bold">{totalGames}</CardBody></Card>
        <Card><CardHeader className="justify-center"><h3 className="text-lg font-semibold">Wins / Losses</h3></CardHeader><CardBody className="text-center text-3xl font-bold">{wins} / {losses}</CardBody></Card>
        <Card><CardHeader className="justify-center"><h3 className="text-lg font-semibold">Win Rate</h3></CardHeader><CardBody className="text-center text-3xl font-bold">{winRate.toFixed(2)}%</CardBody></Card>
        <Card><CardHeader className="justify-center"><h3 className="text-lg font-semibold">Win Streak</h3></CardHeader><CardBody className="text-center text-3xl font-bold">{winStreak}</CardBody></Card>
        <Card><CardHeader className="justify-center"><h3 className="text-lg font-semibold">Longest Win Streak</h3></CardHeader><CardBody className="text-center text-3xl font-bold">{longestWinStreak}</CardBody></Card>
      </div>
    </div>
  );
}