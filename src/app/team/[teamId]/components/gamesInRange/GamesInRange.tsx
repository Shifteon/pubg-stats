"use client";

import { Slider, Tab, Tabs, Spinner } from "@heroui/react";
import { useEffect, useMemo, useState } from "react";
import Overview from "../gameSummary/components/overview";
import PlayerStatCard from "../gameSummary/components/PlayerStatCard";
import GameByGame from "./components/GameByGame";
import { statKeys } from "../gameSummary/utils";
import { useTeamGames } from "../../../../../hooks/useTeam";
import { Game } from "@/types";

export interface GamesInRangeProps {
  teamId: string;
}

export default function GamesInRange({ teamId }: GamesInRangeProps) {
  const { teamGames, isLoading } = useTeamGames(teamId);

  const [visualGameRange, setVisualGameRange] = useState<number[]>([0, 0]);
  const [gameRange, setGameRange] = useState<number[]>([0, 0]);

  useEffect(() => {
    if (teamGames && teamGames.length > 0) {
      setVisualGameRange([Math.max(0, teamGames.length - 10), teamGames.length]);
      setGameRange([Math.max(0, teamGames.length - 10), teamGames.length]);
    }
  }, [teamGames]);

  // Use the local slice from the already fetched teamGames
  const gamesInRange = useMemo(() => {
    if (!teamGames) return [];
    return teamGames.slice(gameRange[0], gameRange[1]);
  }, [teamGames, gameRange]);

  // Derive stats for Overview component natively
  const overviewStats = useMemo(() => {
    let wins = 0;
    let losses = 0;
    let currentWinStreak = 0;
    let winStreak = 0;
    let longestWinStreak = 0;

    gamesInRange.forEach((game: Game) => {
      if (game.isWin) {
        wins++;
        currentWinStreak++;
        if (currentWinStreak > longestWinStreak) longestWinStreak = currentWinStreak;
      } else {
        losses++;
        currentWinStreak = 0;
      }
    });

    // Determine final current win streak
    if (gamesInRange.length > 0) {
      winStreak = currentWinStreak;
    }

    const winRate = gamesInRange.length > 0 ? (wins / gamesInRange.length) * 100 : 0;

    return {
      wins,
      losses,
      winRate,
      winStreak,
      longestWinStreak,
      totalGames: gamesInRange.length,
    };
  }, [gamesInRange]);

  const playerAvgsInRange = useMemo(() => {
    if (gamesInRange.length === 0) {
      return {};
    }

    // Since we don't have teamName statically anymore to use `playerMapping`, we can dynamically
    // extract players from the game data itself!
    const playerTotals: Record<string, Record<string, number>> = {};

    gamesInRange.forEach((game: Game) => {
      game.stats.forEach((playerStat: Game["stats"][0]) => {
        const player = playerStat.playerName.toLowerCase();

        if (!playerTotals[player]) {
          playerTotals[player] = {};
          statKeys.forEach(stat => {
            playerTotals[player][stat] = 0;
          });
        }

        statKeys.forEach(stat => {
          playerTotals[player][stat] += (playerStat[stat as keyof typeof playerStat] as number) || 0;
        });
      });
    });

    Object.keys(playerTotals).forEach(player => {
      Object.keys(playerTotals[player]).forEach(stat => {
        playerTotals[player][stat] /= gamesInRange.length;
      });
    });

    return playerTotals;
  }, [gamesInRange]);

  return (
    <div className="relative w-full">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/5 rounded-lg">
          <Spinner />
        </div>
      )}
      <div className={`mb-8 ${isLoading ? 'opacity-50' : ''}`}>
        <h3 className="text-xl font-semibold mb-2">Overview</h3>
        {teamGames && teamGames.length > 0 && (
          <Overview
            wins={overviewStats.wins}
            losses={overviewStats.losses}
            winRate={overviewStats.winRate}
            winStreak={overviewStats.winStreak}
            longestWinStreak={overviewStats.longestWinStreak}
            totalGames={overviewStats.totalGames}
          />
        )}
      </div>
      {teamGames && teamGames.length > 10 && (
        <div className="w-full md:w-1/2 mb-4 px-4">
          <Slider
            label="Game Range"
            value={visualGameRange}
            onChange={(value) => setVisualGameRange(value as number[])}
            onChangeEnd={(value) => setGameRange(value as number[])}
            minValue={0}
            maxValue={teamGames.length}
            step={1}
            color="secondary"
          />
        </div>
      )}
      <div className={isLoading ? 'opacity-50' : ''}>
        <Tabs aria-label={`Games ${gameRange[0] + 1} - ${gameRange[1]} Details`} color="secondary">
          <Tab key="game-by-game" title="Game by Game">
            <GameByGame gameData={gamesInRange} />
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
