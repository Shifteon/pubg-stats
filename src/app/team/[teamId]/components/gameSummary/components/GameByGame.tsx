"use client";

import { TeamName } from "@/types";
import { Pagination, Accordion, AccordionItem } from "@heroui/react";
import { useEffect, useMemo, useState } from "react";
import GameTable from "./GameTable";
import GameSort, { SortConfig } from "./GameSort";
import { playerMapping, statKeys, processGameData } from "../utils";
import GameFilter, { Filter } from "./GameFilter";

export interface GameByGameProps {
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  gameData: any[];
  team: TeamName;
}

export default function GameByGame({ gameData, team }: GameByGameProps) {
  const [gameByGamePage, setGameByGamePage] = useState(1);
  const [filters, setFilters] = useState<Filter[]>([]);
  const [filterResult, setFilterResult] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  const players = useMemo(() => {
    const teamPlayers = playerMapping[team] || [];
    return [...teamPlayers.map(p => p.charAt(0).toUpperCase() + p.slice(1)), "Total"];
  }, [team]);

  const filteredGameData = useMemo(() => {
    return gameData.filter(game => {
      // Filter by Result
      if (filterResult === 'win' && game.win !== 1) return false;
      if (filterResult === 'loss' && game.win !== 0) return false;

      return filters.every(filter => {
        const key = filter.player === 'Total'
          ? `total_${filter.stat}`
          : `${filter.player.toLowerCase()}_${filter.stat}`;
        const gameValue = game[key] || 0;

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
        const key = sortConfig.player === 'Total'
          ? `total_${sortConfig.stat}`
          : `${sortConfig.player.toLowerCase()}_${sortConfig.stat}`;

        const valA = a[key] || 0;
        const valB = b[key] || 0;

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    } else {
      // Default reverse chronological order if no sort is applied
      dataToSort = dataToSort.reverse();
    }

    return dataToSort.map(game => processGameData(game, team));
  }, [filteredGameData, team, sortConfig]);

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
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 items-start gap-8 mt-4">
        {paginatedGameTables.map((game, index) => (
          <div key={index} className="w-full">
            <h3 className="text-xl font-semibold mb-2">Game {game.gameIndex} - {game.win === 1 ? "🏆 Win" : "❌ Loss"}</h3>
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
