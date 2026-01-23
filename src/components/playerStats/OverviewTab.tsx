"use client";

import { Card, CardBody } from "@heroui/react";

interface OverviewTabProps {
  aggregatedStats: {
    avgDamage: number;
    avgKills: number;
    winRate: number;
    avgAssists: number;
    avgRescues: number;
    avgRecalls: number;
  };
}

export default function OverviewTab({ aggregatedStats }: OverviewTabProps) {
  const stats = [
    { label: "Average Kills", value: aggregatedStats.avgKills.toFixed(1) },
    { label: "Average Damage", value: aggregatedStats.avgDamage.toFixed(1) },
    { label: "Average Assists", value: aggregatedStats.avgAssists.toFixed(1) },
    { label: "Average Rescues", value: aggregatedStats.avgRescues.toFixed(1) },
    { label: "Average Recalls", value: aggregatedStats.avgRecalls.toFixed(1) },
    { label: "Win Rate", value: `${aggregatedStats.winRate.toFixed(1)}%` },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardBody className="flex flex-col items-center justify-center py-6 gap-2">
            <p className="text-default-500 font-semibold">{stat.label}</p>
            <p className="text-3xl font-bold">{stat.value}</p>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
