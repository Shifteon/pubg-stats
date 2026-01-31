"use client";

import { Card, CardBody } from "@heroui/react";
import PlayerRadarChart from "./PlayerRadarChart";
import { AggregatedStats } from "@/utils/statHelpers";

interface OverviewTabProps {
  aggregatedStats: AggregatedStats;
  allPlayersStats: Record<string, AggregatedStats> | null;
  playerName: string;
}

export default function OverviewTab({ aggregatedStats, allPlayersStats, playerName }: OverviewTabProps) {
  const stats = [
    { label: "Average Kills", value: aggregatedStats.avgKills.toFixed(1) },
    { label: "Average Damage", value: aggregatedStats.avgDamage.toFixed(1) },
    { label: "Average Assists", value: aggregatedStats.avgAssists.toFixed(1) },
    { label: "Average Rescues", value: aggregatedStats.avgRescues.toFixed(1) },
    { label: "Average Recalls", value: aggregatedStats.avgRecalls.toFixed(1) },
    { label: "Win Rate", value: `${aggregatedStats.winRate.toFixed(1)}%` },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-5 lg:grid-rows-2 gap-4">
        <div className="lg:col-span-2 lg:row-span-2">
          <PlayerRadarChart
            allPlayersStats={allPlayersStats}
            currentPlayerName={playerName}
          />
        </div>
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardBody className="flex flex-col items-center justify-center py-6 gap-2">
              <p className="text-default-500 font-semibold">{stat.label}</p>
              <p className="text-3xl font-bold">{stat.value}</p>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
