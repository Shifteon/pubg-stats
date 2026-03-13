"use client";

import { Pagination, Accordion, AccordionItem, Button } from "@heroui/react";
import { useEffect, useMemo, useState } from "react";
import GameTable from "../app/team/[teamId]/components/GameTable";
import GameSort, { SortConfig } from "./GameSort";
import { statKeys } from "../app/team/[teamId]/components/gameSummary/utils";
import GameFilter, { Filter } from "./GameFilter";
import { Game } from "@/types";

export interface GameByGameProps {
  gameData: Game[];
  hideFilters?: boolean;
  onEditGame?: (game: Game) => void;
}

export default function GameByGame({ gameData, hideFilters, onEditGame }: GameByGameProps) {
  const [gameByGamePage, setGameByGamePage] = useState(1);
  const [filters, setFilters] = useState<Filter[]>([]);
  const [filterResult, setFilterResult] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  // Extract players dynamically from the first game
  const players = useMemo(() => {
    if (gameData.length === 0 || !gameData[0].stats) return [];
    return [...gameData[0].stats.map((p: Game["stats"][0]) => p.playerName.charAt(0).toUpperCase() + p.playerName.slice(1)), "Total"];
  }, [gameData]);

  const filteredGameData = useMemo(() => {
    return gameData.filter((game: Game) => {
      // Filter by Result
      if (filterResult === 'win' && !game.isWin) return false;
      if (filterResult === 'loss' && game.isWin) return false;

      const totalStats: Record<string, number> = { kills: 0, assists: 0, damage: 0, rescues: 0, recalls: 0 };
      const playerStatsMap: Record<string, Record<string, number>> = {};

      game.stats.forEach(s => {
        const pName = s.playerName.toLowerCase();
        playerStatsMap[pName] = {
          kills: s.kills, assists: s.assists, damage: s.damage, rescues: s.rescues, recalls: s.recalls
        };
        totalStats.kills += s.kills;
        totalStats.assists += s.assists;
        totalStats.damage += s.damage;
        totalStats.rescues += s.rescues;
        totalStats.recalls += s.recalls;
      });

      return filters.every((filter: Filter) => {
        let gameValue = 0;
        if (filter.player === 'Total') {
          gameValue = totalStats[filter.stat] || 0;
        } else {
          gameValue = playerStatsMap[filter.player.toLowerCase()]?.[filter.stat] || 0;
        }

        switch (filter.operator) {
          case '>=': return gameValue >= filter.value;
          case '<=': return gameValue <= filter.value;
          case '=': return gameValue === filter.value;
          default: return true;
        }
      });
    });
  }, [gameData, filters, filterResult]);

  const gameTablesData = useMemo(() => {
    if (filteredGameData.length === 0) {
      return [];
    }

    let dataToSort = [...filteredGameData];

    if (sortConfig) {
      dataToSort.sort((a, b) => {
        let valA = 0;
        let valB = 0;

        if (sortConfig.player === 'Total') {
          valA = a.stats.reduce((acc, s) => acc + (s[sortConfig.stat as keyof typeof s] as number || 0), 0);
          valB = b.stats.reduce((acc, s) => acc + (s[sortConfig.stat as keyof typeof s] as number || 0), 0);
        } else {
          valA = a.stats.find(s => s.playerName.toLowerCase() === sortConfig.player.toLowerCase())?.[sortConfig.stat as keyof typeof a.stats[0]] as number || 0;
          valB = b.stats.find(s => s.playerName.toLowerCase() === sortConfig.player.toLowerCase())?.[sortConfig.stat as keyof typeof b.stats[0]] as number || 0;
        }

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    } else {
      // Default reverse chronological order if no sort is applied
      dataToSort = dataToSort.reverse();
    }

    return dataToSort.map((game: Game) => {
      const gamePlayerData: Game["stats"] = game.stats.map(s => ({
        playerId: s.playerId,
        playerName: s.playerName.charAt(0).toUpperCase() + s.playerName.slice(1),
        kills: s.kills,
        assists: s.assists,
        damage: s.damage,
        rescues: s.rescues,
        recalls: s.recalls,
      }));

      const totalRow: Game["stats"][0] = {
        playerId: 'total',
        playerName: 'Total',
        kills: game.stats.reduce((acc, s) => acc + s.kills, 0),
        assists: game.stats.reduce((acc, s) => acc + s.assists, 0),
        damage: game.stats.reduce((acc, s) => acc + s.damage, 0),
        rescues: game.stats.reduce((acc, s) => acc + s.rescues, 0),
        recalls: game.stats.reduce((acc, s) => acc + s.recalls, 0),
      };

      return {
        win: game.isWin ? 1 : 0,
        gameIndex: game.gameNumber,
        data: [...gamePlayerData, totalRow]
      };
    });
  }, [filteredGameData, sortConfig]);

  const gamesPerPage = 10;
  const totalGamePages = Math.ceil(gameTablesData.length / gamesPerPage);
  const paginatedGameTables = useMemo(() => gameTablesData.slice((gameByGamePage - 1) * gamesPerPage, gameByGamePage * gamesPerPage), [gameTablesData, gameByGamePage]);

  useEffect(() => {
    if (gameByGamePage > totalGamePages) {
      setGameByGamePage(totalGamePages || 1);
    }
  }, [totalGamePages, gameByGamePage]);

  const handleAddFilter = (filter: Filter) => {
    setFilters(prevFilters => {
      const existingIndex = prevFilters.findIndex(
        f => f.player === filter.player && f.stat === filter.stat
      );

      if (existingIndex >= 0) {
        const newFilters = [...prevFilters];
        newFilters[existingIndex] = filter;
        return newFilters;
      }

      return [...prevFilters, filter];
    });
    setGameByGamePage(1);
  };

  const handleRemoveFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
    setGameByGamePage(1);
  };

  return (
    <>
      {!hideFilters && (
        <Accordion variant="bordered">
          <AccordionItem key="1" aria-label="Filter and Sort" title="Filter and Sort">
            <GameFilter
              players={players}
              stats={statKeys}
              onAddFilter={handleAddFilter}
              activeFilters={filters}
              onRemoveFilter={handleRemoveFilter}
              filterResult={filterResult}
              onFilterResultChange={(value) => {
                setFilterResult(value);
                setGameByGamePage(1);
              }}
            />
            <GameSort
              players={players}
              stats={statKeys}
              sortConfig={sortConfig}
              onSortChange={(config) => {
                setSortConfig(config);
                setGameByGamePage(1);
              }}
            />
          </AccordionItem>
        </Accordion>
      )}
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 items-start gap-8 mt-4">
        {paginatedGameTables.map((game, index) => (
          <div key={index} className="w-full">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-semibold">Game {game.gameIndex} - {game.win === 1 ? "🏆 Win" : "❌ Loss"}</h3>
              {onEditGame && (
                <Button
                  onPress={() => {
                    const originalGame = gameData.find(g => g.gameNumber === game.gameIndex);
                    if (originalGame) onEditGame(originalGame);
                  }}
                  color="primary"
                  variant="bordered"
                >
                  Edit Game
                </Button>
              )}
            </div>
            <GameTable data={game.data} gameIndex={game.gameIndex} />
          </div>
        ))}
        {paginatedGameTables.length === 0 && (
          <div className="col-span-1 lg:col-span-2 text-center text-gray-500 py-8">
            No games match the selected filters.
          </div>
        )}
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
