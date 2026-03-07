"use client";

import React, { useMemo, useState } from "react";
import StatRadarChart, { RadarDataPoint, RadarSeries } from "@/components/charts/statRadarChart";
import { Chip, Spinner } from "@heroui/react";
import { PLAYER_COLOR_MAP } from "@/constants";
import { TooltipContentProps } from "recharts";
import { Player } from "@/types";
import { usePlayersList, usePlayers } from "@/hooks/usePlayer";

interface PlayerRadarChartProps {
  player: Player;
}

export default function PlayerRadarChart({ player }: PlayerRadarChartProps) {
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([player.name.toLowerCase()]);

  const currentPlayerNameRaw = player.name.toLowerCase();

  // Fetch list of all players
  const { playersList, isLoading: isListLoading } = usePlayersList();

  // Determine what IDs we need to fetch (all players except the current one)
  const otherPlayerIds = useMemo(() => {
    if (!playersList) return [];
    return playersList.filter(p => p.id !== player.id).map(p => p.id);
  }, [playersList, player.id]);

  // Fetch full stats for all other players
  const { players: otherPlayers, isLoading: isPlayersLoading } = usePlayers(otherPlayerIds);

  const loading = isListLoading || isPlayersLoading;

  const allPlayersStats = useMemo(() => {
    const stats: Record<string, Player> = {
      [currentPlayerNameRaw]: player
    };
    if (otherPlayers && otherPlayers.length > 0) {
      otherPlayers.forEach(p => {
        if (p && p.name) {
          stats[p.name.toLowerCase()] = p;
        }
      });
    }
    return stats;
  }, [currentPlayerNameRaw, player, otherPlayers]);

  const togglePlayer = (pName: string) => {
    setSelectedPlayers(prev => {
      if (prev.includes(pName)) {
        // Don't allow deselecting the last player
        if (prev.length === 1) return prev;
        return prev.filter(p => p !== pName);
      } else {
        return [...prev, pName];
      }
    });
  };

  const chartData = useMemo(() => {
    if (!allPlayersStats || Object.keys(allPlayersStats).length === 0) return { data: [], series: [] };

    const subjects = [
      { key: "kills", label: "Kills", isAverage: true },
      { key: "damage", label: "Damage", isAverage: true },
      { key: "winRate", label: "Win Rate", isAverage: false },
      { key: "assists", label: "Assists", isAverage: true },
      { key: "rescues", label: "Rescues", isAverage: true },
      { key: "recalls", label: "Recalls", isAverage: true },
    ];

    const availablePlayersNames = Object.keys(allPlayersStats);

    // Series definition
    const series: RadarSeries[] = selectedPlayers.map(pName => ({
      key: pName,
      name: pName,
      color: PLAYER_COLOR_MAP[pName] || "#8884d8",
      opacity: pName === currentPlayerNameRaw ? 0.6 : 0.2
    }));

    // Data Transformation
    const data = subjects.map((subject) => {
      // Calculate max for normalization
      let maxValue = 0;
      availablePlayersNames.forEach((pName) => {
        let pVal = 0;
        if (subject.isAverage) {
          pVal = Number(allPlayersStats[pName].playerAverages[subject.key as keyof Player["playerAverages"]]) || 0;
        } else {
          pVal = Number(allPlayersStats[pName][subject.key as keyof Player]) || 0;
        }
        if (pVal > maxValue) maxValue = pVal;
      });
      if (maxValue === 0) maxValue = 1;

      // Construct Data Point
      const dataPoint: RadarDataPoint = {
        subject: subject.label,
        fullMark: maxValue,
      };

      availablePlayersNames.forEach(pName => {
        let rawVal = 0;
        if (subject.isAverage) {
          rawVal = Number(allPlayersStats[pName].playerAverages[subject.key as keyof Player["playerAverages"]]) || 0;
        } else {
          rawVal = Number(allPlayersStats[pName][subject.key as keyof Player]) || 0;
        }

        dataPoint[pName] = (rawVal / maxValue) * 100;
        dataPoint[`${pName}_raw`] = rawVal; // Store raw for tooltip
      });

      return dataPoint;
    });

    return { data, series };
  }, [allPlayersStats, selectedPlayers, currentPlayerNameRaw]);

  if (loading) {
    return (
      <div className="w-full h-[400px] flex justify-center items-center">
        <Spinner label="Loading Radar..." />
      </div>
    );
  }

  if (!allPlayersStats || Object.keys(allPlayersStats).length === 0) return null;

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
              const displayVal = subject === "Win Rate"
                ? `${(typeof rawVal === 'number' ? rawVal.toFixed(1) : rawVal)}%`
                : (typeof rawVal === 'number' ? rawVal.toFixed(1) : rawVal);

              return (
                <div key={index} className="flex justify-between items-center gap-4 text-tiny">
                  <span style={{ color: entry.color }} className="font-semibold capitalize">{playerKey}</span>
                  <span>{displayVal}</span>
                </div>
              );
            })}
          </div>
          <p className="text-tiny text-default-400 mt-2 pt-2 border-t border-default-100">
            Best in Group: {typeof fullMark === 'number' ? fullMark.toFixed(1) : fullMark}{subject === "Win Rate" ? "%" : ""}
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
        {Object.keys(allPlayersStats).map(pName => (
          <Chip
            key={pName}
            variant={selectedPlayers.includes(pName) ? "solid" : "bordered"}
            onClick={() => togglePlayer(pName)}
            className="cursor-pointer capitalize"
            style={{
              backgroundColor: selectedPlayers.includes(pName) ? PLAYER_COLOR_MAP[pName] : undefined,
              borderColor: PLAYER_COLOR_MAP[pName],
              color: selectedPlayers.includes(pName) ? "#FFF" : PLAYER_COLOR_MAP[pName]
            }}
          >
            {pName}
          </Chip>
        ))}
      </div>
    </div>
  );
}
