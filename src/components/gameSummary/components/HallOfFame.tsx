"use client";

import { GameSummaryData, TeamName } from "@/types";
import { Avatar, Card, CardBody, CardFooter, CardHeader, useDisclosure } from "@heroui/react";
import { useMemo, useState } from "react";
import { AVATAR_SRC_MAP } from "@/constants";
import { HighestStat, playerMapping, processGameData, statKeys } from "../utils";
import GameModal from "./GameModal";

export interface HallOfFameProps {
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  gameData: any[];
  team: TeamName;
}

export default function HallOfFame({ gameData, team }: HallOfFameProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedGame, setSelectedGame] = useState<GameSummaryData | null>(null);

  const highestStats = useMemo(() => {
    if (gameData.length === 0) {
      return [];
    }

    const players = playerMapping[team] || [];

    return statKeys.map(stat => {
      let highest: HighestStat = { player: "ben", value: -1, stat, gameIndex: -1 };

      gameData.forEach(game => {
        players.forEach(player => {
          const playerStatKey = `${player}_${stat}`;
          const statValue = parseFloat(game[playerStatKey]);
          if (statValue > highest.value) {
            highest = { player, value: statValue, stat, gameIndex: game.gameIndex };
          }
        });
      });

      return highest;
    });
  }, [gameData, team]);

  const handleCardClick = (gameIndex: number) => {
    const game = gameData.find(g => g.gameIndex === gameIndex);
    if (game) {
      setSelectedGame(processGameData(game, team));
      onOpen();
    }
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-2 md:grid-cols-3 lg:grid-cols-5 lg:gap-4 w-full">
        {highestStats.map(({ player, value, stat, gameIndex }) => (
          <Card key={stat} isPressable onPress={() => handleCardClick(gameIndex)}>
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
    </>
  );
}
