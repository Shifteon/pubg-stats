"use client";

import { TeamName } from "@/types";
import { useMemo } from "react";
import PlayerStatsGrid from "./playerStatsGrid";
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
    const playerBests: Record<string, Record<string, number>> = {};

    players.forEach(player => {
      playerBests[player] = {};
      statKeys.forEach(stat => {
        playerBests[player][stat] = 0;
      });
    });

    gameData.forEach(game => {
      players.forEach(player => {
        statKeys.forEach(stat => {
          const playerStatKey = `${player}_${stat}`;
          const statValue = parseFloat(game[playerStatKey]);
          if (statValue > playerBests[player][stat]) {
            playerBests[player][stat] = statValue;
          }
        });
      });
    });

    return playerBests;
  }, [gameData, team]);

  return (
    <PlayerStatsGrid playerStats={playerHighestStats} />
  );
}
