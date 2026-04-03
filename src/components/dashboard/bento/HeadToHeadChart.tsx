"use client";

import React, { useMemo } from 'react';
import ButterflyBarChart from '@/components/charts/butterflyBarChart';
import { capitalize } from '@/utils/stringUtils';
import { usePlayersList } from '@/hooks/usePlayer';

interface HeadToHeadChartProps {
  player: {
    avgKills: number;
    avgDamage: number;
    totalKills: number;
    totalDamage: number;
    games: number;
  };
  teammates: {
    id: string;
    name: string;
    avgKills: number;
    avgDamage: number;
    totalKills: number;
    totalDamage: number;
    games: number;
    diff: number;
  }[];
  playerId?: string;
}

export function HeadToHeadChart({ player, teammates, playerId }: HeadToHeadChartProps) {
  const { playersList } = usePlayersList();

  // Pre-calculate common properties and determine colors
  const mappedInfo = useMemo(() => {
    const mainPlayerInfo = playersList?.find(p => p.id === playerId);
    const mainPlayerColor = mainPlayerInfo?.color || "hsl(var(--heroui-primary))";
    const mainPlayerName = mainPlayerInfo?.name ? capitalize(mainPlayerInfo.name) : "You";

    const mappedTeammates = teammates.map(t => {
      const teammateInfo = playersList?.find(p => p.id === t.id);
      const teammateColor = teammateInfo?.color || "hsl(var(--heroui-warning))";

      return {
        ...t,
        label: capitalize(t.name),
        playerColor: mainPlayerColor,
        teammateColor: teammateColor,
      };
    });

    return { mappedTeammates, mainPlayerName };
  }, [teammates, playersList, playerId]);

  // Format data specifically for Kills
  const killsData = useMemo(() => {
    return mappedInfo.mappedTeammates.map(t => ({
      leftLabel: mappedInfo.mainPlayerName,
      leftValue: player.avgKills,
      rightLabel: t.label,
      rightValue: t.avgKills,
      leftColor: t.playerColor,
      rightColor: t.teammateColor,
    }));
  }, [mappedInfo, player.avgKills]);

  // Format data specifically for Damage
  const damageData = useMemo(() => {
    return mappedInfo.mappedTeammates.map(t => ({
      leftLabel: mappedInfo.mainPlayerName,
      leftValue: player.avgDamage,
      rightLabel: t.label,
      rightValue: t.avgDamage,
      leftColor: t.playerColor,
      rightColor: t.teammateColor,
    }));
  }, [mappedInfo, player.avgDamage]);

  if (teammates.length === 0) return null;

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="w-full">
        <h4 className="text-center font-bold text-sm text-default-600 mb-2">Average Kills</h4>
        <ButterflyBarChart 
          data={killsData}
        />
      </div>
      
      <div className="w-full border-t border-divider pt-4">
        <h4 className="text-center font-bold text-sm text-default-600 mb-2">Average Damage</h4>
        <ButterflyBarChart 
          data={damageData}
        />
      </div>
    </div>
  );
}
