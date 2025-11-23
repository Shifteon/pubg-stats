"use client";

import { TeamName } from "@/types";
import { useMemo } from "react";
import PlayerStatsGrid, { StatValue } from "./playerStatsGrid";
import { playerMapping, statKeys } from "../utils";

export interface PersonalBestsProps {
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  gameData: any[];
  team: TeamName;
}

export default function PersonalBests({ gameData, team }: PersonalBestsProps) {
  const playerHighestStats = useMemo(() => {
    if (gameData.length === 0) {
      return {};
    }

    const players = playerMapping[team] || [];
    const playerBests: Record<string, Record<string, StatValue>> = {};

    players.forEach(player => {
      playerBests[player] = {};
      statKeys.forEach(stat => {
        playerBests[player][stat] = { value: 0, game: null };
      });
    });

    gameData.forEach(game => {
      players.forEach(player => {
        statKeys.forEach(stat => {
          const playerStatKey = `${player}_${stat}`;
          const statValue = parseFloat(game[playerStatKey]);
          const currentBest = playerBests[player][stat];
          const currentBestValue = typeof currentBest === 'object' && currentBest !== null && 'value' in currentBest ? currentBest.value : currentBest as number;

          if (statValue > currentBestValue) {
            playerBests[player][stat] = { value: statValue, game: game };
          }
        });
      });
    });

    return playerBests;
  }, [gameData, team]);

  return (
    <PlayerStatsGrid playerStats={playerHighestStats} team={team} />
  );
}
