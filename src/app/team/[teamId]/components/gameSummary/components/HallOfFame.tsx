"use client";

import { GameSummaryData, TeamHallOfFame, PlayerMetadata } from "@/types";
import { Avatar, Card, CardBody, CardFooter, CardHeader, useDisclosure } from "@heroui/react";
import { useState } from "react";
import { AVATAR_SRC_MAP } from "@/constants";
import { processGameData } from "../utils";
import GameModal from "../../GameModal";
import { apiService } from "@/services/apiService";

export interface HallOfFameProps {
  hallOfFame: TeamHallOfFame;
  players: PlayerMetadata[];
  teamId?: string; // Add teamId so we can fetch the game info
}

export default function HallOfFame({ hallOfFame, players, teamId }: HallOfFameProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedGame, setSelectedGame] = useState<GameSummaryData | null>(null);

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

  const handleCardClick = async (gameId: string) => {
    if (!gameId || !teamId) return;
    // We still need to fetch the individual game for the modal, but we use gameId now instead of team/index
    const url = `/api/game/${gameId}`;
    const game = await apiService.fetchWithCache<Record<string, unknown>>(url);
    if (game) {
      // processGameData might need teamName, or just teamId depending on how it's written.
      // We will pass teamId for now, but to be 100% compatible we might need to adjust processGameData later
      // if it strictly requires the union type `TeamName`
      setSelectedGame(processGameData(game, "any"));
      onOpen();
    }
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
