"use client";

import { GameSummaryData, TeamName } from "@/types";
import { useEffect, useState } from "react";
import PlayerStatCard from "./PlayerStatCard";
import { apiService } from "@/services/apiService";
import { Spinner, useDisclosure } from "@heroui/react";
import GameModal from "../../GameModal";
import { processGameData } from "../utils";

export interface StatValue {
  value: number;
  game: Record<string, unknown> | null;
}

export interface PersonalBestsProps {
  team: TeamName;
  start?: number;
  end?: number;
}

export default function PersonalBests({ team, start, end }: PersonalBestsProps) {
  const [playerHighestStats, setPlayerHighestStats] = useState<Record<string, Record<string, StatValue>>>({});
  const [loading, setLoading] = useState(true);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedGame, setSelectedGame] = useState<GameSummaryData | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchPersonalBests = async () => {
      setLoading(true);
      let url = `/api/team/${team}/personal-bests`;
      if (start !== undefined && end !== undefined) {
        url += `?start=${start}&end=${end}`;
      }

      const data = await apiService.fetchWithCache<Record<string, Record<string, StatValue>>>(url);

      if (isMounted && data) {
        setPlayerHighestStats(data);
      }
      if (isMounted) setLoading(false);
    };

    fetchPersonalBests();

    return () => {
      isMounted = false;
    };
  }, [team, start, end]);

  const handleGameClick = (game: Record<string, unknown>) => {
    const processedGame = processGameData(game, team);
    setSelectedGame(processedGame);
    onOpen();
  };

  return (
    <div className="relative w-full">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/5 rounded-lg">
          <Spinner />
        </div>
      )}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full ${loading ? 'opacity-50' : ''}`}>
        {Object.entries(playerHighestStats).map(([player, stats]) => (
          <PlayerStatCard
            key={player}
            player={player}
            stats={stats}
            onGameClick={handleGameClick}
          />
        ))}
      </div>
      {selectedGame && (
        <GameModal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          game={selectedGame}
        />
      )}
    </div>
  );
}
