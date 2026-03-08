"use client";

import { GameSummaryData, TeamPersonalBest, PlayerMetadata } from "@/types";
import { useState } from "react";
import PlayerStatCard from "./PlayerStatCard";
import { useDisclosure } from "@heroui/react";
import GameModal from "../../GameModal";
import { useTeamGame } from "@/hooks/useTeam";
import { useEffect } from "react";

export interface StatValue {
  value: number;
  game?: string | null; // This is now gameId
}

export interface PersonalBestsProps {
  personalBests: TeamPersonalBest;
  players: PlayerMetadata[];
  teamId?: string; // In case we need it for modal fetching later
}

export default function PersonalBests({ personalBests, players, teamId }: PersonalBestsProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);

  const { game: selectedGame, isLoading: gameIsLoading } = useTeamGame(teamId, selectedGameId);



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
      kills: { value: pb.kills.statValue, game: pb.kills.gameId },
      assists: { value: pb.assists.statValue, game: pb.assists.gameId },
      damage: { value: pb.damage.statValue, game: pb.damage.gameId },
      rescues: { value: pb.rescues.statValue, game: pb.rescues.gameId },
      recalls: { value: pb.recalls.statValue, game: pb.recalls.gameId },
    };
  });

  const handleGameClick = (gameId: string) => {
    setSelectedGameId(gameId);
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
      <GameModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        game={selectedGame}
        isLoading={gameIsLoading}
      />
    </div>
  );
}
