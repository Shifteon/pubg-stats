"use client";

import { Pagination, Accordion, AccordionItem } from "@heroui/react";
import { useEffect, useMemo, useState } from "react";
import GameTable from "../../GameTable";
import GameSort, { SortConfig } from "./GameSort";
import { statKeys } from "../../gameSummary/utils";
import GameFilter, { Filter } from "./GameFilter";
import { Game, PlayerGameStat, GameSummaryData } from "@/types";

export interface GameByGameProps {
  gameData: Game[];
}

export default function GameByGame({ gameData }: GameByGameProps) {
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

    return dataToSort.map((game: Game): GameSummaryData => {
      const gamePlayerData: PlayerGameStat[] = game.stats.map(s => ({
        player: s.playerName.charAt(0).toUpperCase() + s.playerName.slice(1),
        kills: s.kills,
        assists: s.assists,
        damage: s.damage,
        rescues: s.rescues,
        recalls: s.recalls,
      }));

      const totalRow: PlayerGameStat = {
        player: 'Total',
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
