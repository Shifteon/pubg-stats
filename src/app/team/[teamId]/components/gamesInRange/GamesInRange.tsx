"use client";

import { TeamName } from "@/types";
import { Slider, Tab, Tabs, Spinner } from "@heroui/react";
import { useEffect, useMemo, useState } from "react";
import Overview from "../gameSummary/components/overview";
import PlayerStatCard from "../gameSummary/components/PlayerStatCard";
import GameByGame from "./components/GameByGame";
import { playerMapping, statKeys } from "../gameSummary/utils";
import { apiService } from "@/services/apiService";

export interface GamesInRangeProps {
  team: TeamName;
}

export default function GamesInRange({ team }: GamesInRangeProps) {
  const [totalGamesCount, setTotalGamesCount] = useState<number>(0);
  const [visualGameRange, setVisualGameRange] = useState<number[]>([0, 0]);
  const [gameRange, setGameRange] = useState<number[]>([0, 0]);
  const [gamesInRange, setGamesInRange] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (totalGamesCount > 0) {
      setVisualGameRange([Math.max(0, totalGamesCount - 10), totalGamesCount]);
      setGameRange([Math.max(0, totalGamesCount - 10), totalGamesCount]);
    }
  }, [totalGamesCount]);

  useEffect(() => {
    let isMounted = true;
    const fetchRange = async () => {
      setLoading(true);

      // Fetch total games count to determine bounds
      const allGamesUrl = `/api/team/${team}/games`;
      const allData = await apiService.fetchWithCache<unknown[]>(allGamesUrl);

      if (isMounted && allData) {
        const count = allData.length;
        setTotalGamesCount(count);

        if (count > 0) {
          const start = Math.max(0, count - 10);
          const end = count;

          if (gameRange[0] === 0 && gameRange[1] === 0) {
            setVisualGameRange([start, end]);
            setGameRange([start, end]);
            // Use these new bounds for the fetch
            const url = `/api/team/${team}/games?start=${start}&end=${end}`;
            const data = await apiService.fetchWithCache<Record<string, unknown>[]>(url);
            if (isMounted && data) {
              setGamesInRange(data);
            }
          } else {
            const url = `/api/team/${team}/games?start=${gameRange[0]}&end=${gameRange[1]}`;
            const data = await apiService.fetchWithCache<Record<string, unknown>[]>(url);
            if (isMounted && data) {
              setGamesInRange(data);
            }
          }
        }
      }
      if (isMounted) setLoading(false);
    };

    fetchRange();

    return () => {
      isMounted = false;
    };
  }, [team, gameRange, totalGamesCount]);

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
          const rawVal = game[playerStatKey];
          playerTotals[player][stat] += parseFloat(typeof rawVal === 'string' ? rawVal : String(rawVal)) || 0;
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
    <div className="relative w-full">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/5 rounded-lg">
          <Spinner />
        </div>
      )}
      <div className={`mb-8 ${loading ? 'opacity-50' : ''}`}>
        <h3 className="text-xl font-semibold mb-2">Overview</h3>
        <Overview team={team} start={gameRange[0]} end={gameRange[1]} />
      </div>
      {totalGamesCount > 10 && (
        <div className="w-full md:w-1/2 mb-4 px-4">
          <Slider
            label="Game Range"
            value={visualGameRange}
            onChange={(value) => setVisualGameRange(value as number[])}
            onChangeEnd={(value) => setGameRange(value as number[])}
            minValue={0}
            maxValue={totalGamesCount}
            step={1}
            color="secondary"
          />
        </div>
      )}
      <div className={loading ? 'opacity-50' : ''}>
        <Tabs aria-label={`Games ${gameRange[0] + 1} - ${gameRange[1]} Details`} color="secondary">
          <Tab key="game-by-game" title="Game by Game">
            <GameByGame gameData={gamesInRange} team={team} />
          </Tab>
          <Tab key="player-avgs" title="Player Averages">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
              {Object.entries(playerAvgsInRange).map(([player, stats]) => (
                <PlayerStatCard
                  key={player}
                  player={player}
                  stats={stats}
                  valueFormatter={(v) => v.toFixed(2)}
                />
              ))}
            </div>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}
