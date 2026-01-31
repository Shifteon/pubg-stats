"use client";

import React, { useMemo, useState, useEffect } from "react";
import { AggregatedStats } from "@/utils/statHelpers";
import StatRadarChart, { RadarDataPoint, RadarSeries } from "@/components/charts/statRadarChart";
import { Chip } from "@heroui/react";
import { PLAYER_COLOR_MAP } from "@/constants";
import { TooltipContentProps } from "recharts";

interface PlayerRadarChartProps {
  allPlayersStats: Record<string, AggregatedStats> | null;
  currentPlayerName: string;
}

export default function PlayerRadarChart({ allPlayersStats, currentPlayerName }: PlayerRadarChartProps) {
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);

  useEffect(() => {
    // Determine the correct key for the current player from allPlayersStats
    if (allPlayersStats && selectedPlayers.length === 0) {
      const normalizedName = currentPlayerName.toLowerCase();
      setSelectedPlayers([normalizedName]);
    }
  }, [allPlayersStats, currentPlayerName, selectedPlayers.length]);

  const togglePlayer = (player: string) => {
    setSelectedPlayers(prev => {
      if (prev.includes(player)) {
        // Don't allow deselecting the last player
        return prev.filter(p => p !== player);
      } else {
        return [...prev, player];
      }
    });
  };

  const chartData = useMemo(() => {
    if (!allPlayersStats) return { data: [], series: [] };

    const subjects = [
      { key: "avgKills", label: "Kills" },
      { key: "avgDamage", label: "Damage" },
      { key: "winRate", label: "Win Rate" },
      { key: "avgAssists", label: "Assists" },
      { key: "avgRescues", label: "Rescues" },
      { key: "avgRecalls", label: "Recalls" },
    ];

    const allPlayers = Object.keys(allPlayersStats);

    // Series definition
    const series: RadarSeries[] = selectedPlayers.map(player => ({
      key: player,
      name: player,
      color: PLAYER_COLOR_MAP[player] || "#8884d8",
      opacity: player === currentPlayerName.toLowerCase() ? 0.6 : 0.2
    }));

    // Data Transformation
    const data = subjects.map((subject) => {
      const key = subject.key as keyof AggregatedStats;

      // Calculate max for normalization
      let maxValue = 0;
      allPlayers.forEach((player) => {
        const pVal = Number(allPlayersStats[player][key]) || 0;
        if (pVal > maxValue) maxValue = pVal;
      });
      if (maxValue === 0) maxValue = 1;

      // Construct Data Point
      const dataPoint: RadarDataPoint = {
        subject: subject.label,
        fullMark: maxValue,
      };

      allPlayers.forEach(player => {
        const rawVal = Number(allPlayersStats[player][key]) || 0;
        dataPoint[player] = (rawVal / maxValue) * 100;
        dataPoint[`${player}_raw`] = rawVal; // Store raw for tooltip
      });

      return dataPoint;
    });

    return { data, series };
  }, [allPlayersStats, selectedPlayers, currentPlayerName]);

  if (!allPlayersStats) return null;

  const CustomTooltip = (props: TooltipContentProps<string | number, string>) => {
    const { active, payload } = props;
    if (active && payload && payload.length) {
      const subject = payload[0].payload.subject;
      const fullMark = payload[0].payload.fullMark;

      return (
        <div className="bg-content1 p-3 rounded-lg shadow-md border border-default-200">
          <p className="font-bold text-small mb-2">{subject}</p>
          <div className="flex flex-col gap-1">
            {payload.map((entry, index: number) => {
              const playerKey = entry.name;
              const rawVal = entry.payload[`${playerKey}_raw`];
              return (
                <div key={index} className="flex justify-between items-center gap-4 text-tiny">
                  <span style={{ color: entry.color }} className="font-semibold capitalize">{playerKey}</span>
                  <span>{typeof rawVal === 'number' ? rawVal.toFixed(1) : rawVal}</span>
                </div>
              );
            })}
          </div>
          <p className="text-tiny text-default-400 mt-2 pt-2 border-t border-default-100">
            Best in Group: {typeof fullMark === 'number' ? fullMark.toFixed(1) : fullMark}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-4">
      <StatRadarChart
        data={chartData.data}
        series={chartData.series}
        tooltipContent={CustomTooltip}
        domain={[0, 120]}
      />
      {/* Player Toggles */}
      <div className="flex flex-wrap gap-2 justify-center">
        {Object.keys(allPlayersStats).map(player => (
          <Chip
            key={player}
            variant={selectedPlayers.includes(player) ? "solid" : "bordered"}
            // color="primary"
            onClick={() => togglePlayer(player)}
            className="cursor-pointer capitalize"
            style={{
              backgroundColor: selectedPlayers.includes(player) ? PLAYER_COLOR_MAP[player] : undefined,
              borderColor: PLAYER_COLOR_MAP[player],
              color: selectedPlayers.includes(player) ? "#FFF" : PLAYER_COLOR_MAP[player]
            }}
          >
            {player}
          </Chip>
        ))}
      </div>
    </div>
  );
}
