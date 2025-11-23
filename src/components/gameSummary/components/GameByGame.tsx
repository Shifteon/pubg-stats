"use client";

import { TeamName } from "@/types";
import { Pagination } from "@heroui/react";
import { useEffect, useMemo, useState } from "react";
import GameTable from "./GameTable";
import { processGameData } from "../utils";

export interface GameByGameProps {
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  gameData: any[];
  team: TeamName;
}

export default function GameByGame({ gameData, team }: GameByGameProps) {
  const [gameByGamePage, setGameByGamePage] = useState(1);

  const gameTablesData = useMemo(() => {
    if (gameData.length === 0) {
      return [];
    }

    return [...gameData].reverse().map(game => processGameData(game, team));
  }, [gameData, team]);

  const gamesPerPage = 10;
  const totalGamePages = Math.ceil(gameTablesData.length / gamesPerPage);
  const paginatedGameTables = useMemo(() => gameTablesData.slice((gameByGamePage - 1) * gamesPerPage, gameByGamePage * gamesPerPage), [gameTablesData, gameByGamePage]);

  useEffect(() => {
    if (gameByGamePage > totalGamePages) {
      setGameByGamePage(totalGamePages || 1);
    }
  }, [totalGamePages, gameByGamePage]);

  return (
    <>
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 items-start gap-8 mt-4">
        {paginatedGameTables.map((game, index) => (
          <div key={index} className="w-full">
            <h3 className="text-xl font-semibold mb-2">Game {game.gameIndex} - {game.win === 1 ? "🏆 Win" : "❌ Loss"}</h3>
            <GameTable data={game.data} gameIndex={game.gameIndex} />
          </div>
        ))}
      </div>
      {totalGamePages > 1 && (
        <div className="flex justify-center mt-8">
          <Pagination
            total={totalGamePages}
            page={gameByGamePage}
            onChange={setGameByGamePage}
            color="secondary"
          />
        </div>
      )}
    </>
  );
}
