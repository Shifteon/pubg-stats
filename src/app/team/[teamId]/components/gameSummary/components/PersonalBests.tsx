"use client";

import { GameSummaryData, TeamPersonalBest, PlayerMetadata } from "@/types";
import { useState } from "react";
import PlayerStatCard from "./PlayerStatCard";
import { useDisclosure } from "@heroui/react";
import GameModal from "../../GameModal";
import { processGameData } from "../utils";

export interface StatValue {
  value: number;
  game?: Record<string, unknown> | null;
}

export interface PersonalBestsProps {
  personalBests: TeamPersonalBest;
  players: PlayerMetadata[];
  teamId?: string; // In case we need it for modal fetching later
}

export default function PersonalBests({ personalBests, players, teamId }: PersonalBestsProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedGame, setSelectedGame] = useState<GameSummaryData | null>(null);

  const getPlayerName = (playerId: string) => {
    const player = players.find((p) => p.id === playerId);
    return player ? player.name : "Unknown";
  };

  // Map the new structured teamPersonalBests payload into the format PlayerStatCard expects: 
  // Record<string, Record<string, StatValue>> where key1=playerName, key2=statName.
  const mappedStats: Record<string, Record<string, StatValue>> = {};

  Object.keys(personalBests).forEach(playerId => {
    const playerName = getPlayerName(playerId);
    const pb = personalBests[playerId];

    // Convert to the exact format PlayerStatCard relies on
    mappedStats[playerName] = {
      kills: { value: pb.kills.statValue, game: null },
      assists: { value: pb.assists.statValue, game: null },
      damage: { value: pb.damage.statValue, game: null },
      rescues: { value: pb.rescues.statValue, game: null },
      recalls: { value: pb.recalls.statValue, game: null },
    };
  });

  const handleGameClick = (game: Record<string, unknown>) => {
    const processedGame = processGameData(game, "any");
    setSelectedGame(processedGame);
    onOpen();
  };

  return (
    <div className="relative w-full">
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full`}>
        {Object.entries(mappedStats).map(([player, stats]) => (
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
