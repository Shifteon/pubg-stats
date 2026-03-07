"use client";

import { GameSummaryData, TeamName } from "@/types";
import { Avatar, Card, CardBody, CardFooter, CardHeader, Spinner, useDisclosure } from "@heroui/react";
import { useEffect, useState } from "react";
import { AVATAR_SRC_MAP } from "@/constants";
import { HighestStat, processGameData } from "../utils";
import GameModal from "./GameModal";
import { apiService } from "@/services/apiService";

export interface HallOfFameProps {
  team: TeamName;
  start?: number;
  end?: number;
}

export default function HallOfFame({ team, start, end }: HallOfFameProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedGame, setSelectedGame] = useState<GameSummaryData | null>(null);

  const [highestStats, setHighestStats] = useState<HighestStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchHallOfFame = async () => {
      setLoading(true);
      let url = `/api/team/${team}/hall-of-fame`;
      if (start !== undefined && end !== undefined) {
        url += `?start=${start}&end=${end}`;
      }

      const data = await apiService.fetchWithCache<HighestStat[]>(url);

      if (isMounted && data) {
        setHighestStats(data);
      }
      if (isMounted) setLoading(false);
    };

    fetchHallOfFame();

    return () => {
      isMounted = false;
    };
  }, [team, start, end]);

  const handleCardClick = async (gameIndex: number) => {
    if (gameIndex === -1) return;
    const url = `/api/team/${team}/games/${gameIndex}`;
    const game = await apiService.fetchWithCache<Record<string, unknown>>(url);
    if (game) {
      setSelectedGame(processGameData(game, team));
      onOpen();
    }
  };

  return (
    <div className="relative w-full">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/5 rounded-lg">
          <Spinner />
        </div>
      )}
      <div className={`grid grid-cols-3 gap-2 md:grid-cols-3 lg:grid-cols-5 lg:gap-4 w-full ${loading ? 'opacity-50' : ''}`}>
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
    </div>
  );
}
