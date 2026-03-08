"use client";

import { TeamHallOfFame, PlayerMetadata } from "@/types";
import { Avatar, Card, CardBody, CardFooter, CardHeader, useDisclosure } from "@heroui/react";
import { useState, useEffect } from "react";
import { AVATAR_SRC_MAP } from "@/constants";
import GameModal from "../../GameModal";
import { useTeamGame } from "@/hooks/useTeam";

export interface HallOfFameProps {
  hallOfFame: TeamHallOfFame;
  players: PlayerMetadata[];
  teamId?: string; // Add teamId so we can fetch the game info
}

export default function HallOfFame({ hallOfFame, players, teamId }: HallOfFameProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);

  const { game: selectedGame, isLoading: gameIsLoading } = useTeamGame(teamId, selectedGameId);



  const getPlayerName = (playerId: string) => {
    const player = players.find((p) => p.id === playerId);
    return player ? player.name : "Unknown";
  };

  const highestStats = Object.values(hallOfFame).map((record) => {
    return {
      stat: record.statPair.stat,
      value: record.statPair.statValue,
      player: getPlayerName(record.playerId),
      gameId: record.gameId
    };
  });

  const handleCardClick = (gameId: string) => {
    if (!gameId || !teamId) return;
    setSelectedGameId(gameId);
    onOpen();
  };

  return (
    <div className="relative w-full">
      <div className={`grid grid-cols-3 gap-2 md:grid-cols-3 lg:grid-cols-5 lg:gap-4 w-full`}>
        {highestStats.map(({ player, value, stat, gameId }) => (
          <Card key={stat} isPressable onPress={() => handleCardClick(gameId)}>
            <CardHeader className="justify-center">
              <h3 className="text-lg font-semibold capitalize">{stat}</h3>
            </CardHeader>
            <CardBody className="text-center text-3xl font-bold">{value}</CardBody>
            <CardFooter className="justify-center text-md capitalize text-gray-500">
              <Avatar
                src={AVATAR_SRC_MAP[player]?.src}
                size="sm"
                name={player}
                showFallback
              />
              <p className="ml-1">{player}</p>
            </CardFooter>
          </Card>
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
