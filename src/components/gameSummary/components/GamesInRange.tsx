"use client";

import { TeamName } from "@/types";
import { Slider, Tab, Tabs } from "@heroui/react";
import { useEffect, useMemo, useState } from "react";
import Overview from "./overview";
import PlayerStatsGrid from "./playerStatsGrid";
import GameByGame from "./GameByGame";
import { playerMapping, statKeys } from "../utils";

export interface GamesInRangeProps {
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  allGameData: any[];
  team: TeamName;
}

export default function GamesInRange({ allGameData, team }: GamesInRangeProps) {
  const [gameRange, setGameRange] = useState<number[]>([0, 0]);

  useEffect(() => {
    if (allGameData.length > 0) {
      setGameRange([Math.max(0, allGameData.length - 10), allGameData.length]);
    }
  }, [allGameData]);

  const gamesInRange = useMemo(() => allGameData.slice(gameRange[0], gameRange[1]), [allGameData, gameRange]);

  const playerAvgsInRange = useMemo(() => {
    if (gamesInRange.length === 0) {
      return {};
    }

    const players = playerMapping[team] || [];
    const playerTotals: Record<string, Record<string, number>> = {};

    players.forEach(player => {
      playerTotals[player] = {};
      statKeys.forEach(stat => {
        playerTotals[player][stat] = 0;
      });
    });

    gamesInRange.forEach(game => {
      players.forEach(player => {
        statKeys.forEach(stat => {
          const playerStatKey = `${player}_${stat}`;
          playerTotals[player][stat] += parseFloat(game[playerStatKey]) || 0;
        });
      });
    });

    Object.keys(playerTotals).forEach(player => {
      Object.keys(playerTotals[player]).forEach(stat => {
        playerTotals[player][stat] /= gamesInRange.length;
      });
    });

    return playerTotals;
  }, [gamesInRange, team]);

  return (
    <>
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">Overview</h3>
        <Overview gameData={gamesInRange} />
      </div>
      {allGameData.length > 10 && (
        <div className="w-full md:w-1/2 mb-4 px-4">
          <Slider
            label="Game Range"
            value={gameRange}
            onChange={(value) => setGameRange(value as number[])}
            minValue={0}
            maxValue={allGameData.length}
            step={1}
            color="secondary"
          />
        </div>
      )}
      <Tabs aria-label={`Games ${gameRange[0] + 1} - ${gameRange[1]} Details`} color="secondary">
        <Tab key="game-by-game" title="Game by Game">
          <GameByGame gameData={gamesInRange} team={team} />
        </Tab>
        <Tab key="player-avgs" title="Player Averages">
          <PlayerStatsGrid playerStats={playerAvgsInRange} valueFormatter={(v) => v.toFixed(2)} />
        </Tab>
      </Tabs>
    </>
  );
}
