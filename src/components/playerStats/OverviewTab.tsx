"use client";

import { Card, CardBody } from "@heroui/react";
import PlayerRadarChart from "./PlayerRadarChart";
import { Player } from "@/types";

interface OverviewTabProps {
  player: Player;
}

export default function OverviewTab({ player }: OverviewTabProps) {
  const stats = [
    { label: "Average Kills", value: player.playerAverages.kills.toFixed(1) },
    { label: "Average Damage", value: player.playerAverages.damage.toFixed(1) },
    { label: "Average Assists", value: player.playerAverages.assists.toFixed(1) },
    { label: "Average Rescues", value: player.playerAverages.rescues.toFixed(1) },
    { label: "Average Recalls", value: player.playerAverages.recalls.toFixed(1) },
    { label: "Win Rate", value: `${player.winRate.toFixed(1)}%` },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-5 lg:grid-rows-2 gap-4">
        <div className="lg:col-span-2 lg:row-span-2">
          <PlayerRadarChart player={player} />
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
