"use client";

import React, { useMemo } from "react";
import { TeamStatTimelinePoint, PlayerMetadata, StatData } from "@/types";
import { GAME_INDEX_KEY } from "@/constants";
import StatScatterChart from "@/components/charts/statScatterChart";

export interface KillsVsDamageScatterChartProps {
  selectedMembers: string[];
  teamStatsTimeline: TeamStatTimelinePoint[];
  players: PlayerMetadata[];
  aspectRatio?: number;
}

export default function KillsVsDamageScatterChart({
  selectedMembers,
  teamStatsTimeline,
  players,
  aspectRatio = 2,
}: KillsVsDamageScatterChartProps) {
  const filteredStatData = useMemo<StatData>(() => {
    if (!teamStatsTimeline || teamStatsTimeline.length === 0) {
      return { data: [], chartOptions: [] };
    }

    const optionKeys = new Set<string>();
    const data: Record<string, number>[] = [];

    teamStatsTimeline.forEach((point) => {
      const dataObj: Record<string, number> = {
        [GAME_INDEX_KEY]: point.gameIndex,
      };

      selectedMembers.forEach((playerId) => {
        const kill = point.rawKills?.[playerId];
        const dmg = point.rawDamage?.[playerId];

        if (kill !== undefined && dmg !== undefined) {
          const xKey = `${playerId}_kills`;
          const yKey = `${playerId}_damage`;
          dataObj[xKey] = kill;
          dataObj[yKey] = dmg;
          optionKeys.add(playerId);
        }
      });
      data.push(dataObj);
    });

    const chartOptions = Array.from(optionKeys).map((playerId) => {
      const playerMeta = players.find((p) => p.id === playerId);
      const color = playerMeta?.color || "#cccccc";
      const name = playerMeta
        ? playerMeta.name.charAt(0).toUpperCase() + playerMeta.name.slice(1)
        : playerId;

      return {
        key: playerId,
        name: name,
        displayName: name,
        color: color,
      };
    });

    return { data, chartOptions };
  }, [teamStatsTimeline, selectedMembers, players]);

  // console.log(filteredStatData.data);

  const maxKills = useMemo(() => {
    const data = filteredStatData.data;
    let maxKills = 0;
    for (const record of data) {
      Object.entries(record)
        .filter(([key, value]) => key.includes("kills"))
        .forEach((d) => {
          if (d[1] > maxKills) maxKills = d[1];
        });
    }

    return maxKills;
  }, [filteredStatData]);

  if (filteredStatData.data.length === 0) {
    return (
      <div className="relative mt-2">
        <div className="w-full flex flex-col items-center">
          <h2 className="p-2 self-start font-medium text-lg">
            Kills vs. Damage
          </h2>
          <div className="w-full flex items-center justify-center p-8 text-default-400 text-sm">
            No Data Available
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mt-2">
      <div className="w-full flex flex-col items-center">
        <h2 className="p-2 self-start font-medium text-lg">Kills vs. Damage</h2>
        <StatScatterChart
          data={filteredStatData}
          xAxisKey={(key) => `${key}_kills`}
          yAxisKey={(key) => `${key}_damage`}
          xDisplayName="Kills"
          yDisplayName="Damage"
          xAllowDecimals={false}
          yAllowDecimals={false}
          aspectRatio={aspectRatio}
          referenceSegment={[
            { x: 0, y: 0 },
            { x: maxKills + 1, y: (maxKills + 1) * 100 },
          ]}
        />
      </div>
    </div>
  );
}
