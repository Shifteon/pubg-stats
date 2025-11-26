"use client";

import { AVATAR_SRC_MAP } from "@/constants";
import { Avatar, Card, CardBody, CardHeader, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/react";
import { useState } from "react";
import GameModal from "./GameModal";
import { GameSummaryData, TeamName } from "@/types";
import { processGameData } from "../utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type StatValue = number | { value: number; game?: any | null };

export interface PlayerStatsGridProps {
  playerStats: Record<string, Record<string, StatValue>>;
  valueFormatter?: (value: number) => string;
  team: TeamName;
}

const defaultFormatter = (value: number) => value.toString();

export default function PlayerStatsGrid({ playerStats, valueFormatter = defaultFormatter, team }: PlayerStatsGridProps) {
  const [selectedGame, setSelectedGame] = useState<GameSummaryData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleRowClick = (game: any) => {
    const processedGame = processGameData(game, team);
    setSelectedGame(processedGame);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {Object.entries(playerStats).map(([player, stats]) => {
          const tableData = Object.entries(stats).map(([stat, val]) => {
            // TODO: this is really messy
            const value = typeof val === 'object' && val !== null && 'value' in val ? val.value : val as number;
            const game = typeof val === 'object' && val !== null && 'game' in val ? val.game : null;
            return {
              stat: stat.charAt(0).toUpperCase() + stat.slice(1),
              value: valueFormatter(value),
              game
            };
          });
          return (
            <Card key={player}>
              <CardHeader>
                <Avatar
                  src={AVATAR_SRC_MAP[player]?.src}
                  size="lg"
                  name={player}
                  showFallback
                  radius="sm"
                />
                <h2 className="text-2xl font-semibold capitalize ml-1">{player}</h2>
              </CardHeader>
              <CardBody>
                <Table aria-label={`${player}'s stats`} selectionMode="none">
                  <TableHeader columns={[{ key: 'stat', label: 'Stat' }, { key: 'value', label: 'Value' }]}>{(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}</TableHeader>
                  <TableBody items={tableData}>
                    {(item) => (
                      <TableRow
                        key={item.stat}
                        className={item.game ? "cursor-pointer hover:bg-default-100" : ""}
                        onClick={() => item.game && handleRowClick(item.game)}
                      >
                        {(columnKey) => <TableCell>{item[columnKey as 'stat' | 'value']}</TableCell>}
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardBody>
            </Card>
          );
        })}
      </div>
      {selectedGame && (
        <GameModal
          isOpen={isModalOpen}
          onOpenChange={() => setIsModalOpen(!isModalOpen)}
          game={selectedGame}
        />
      )}
    </>
  );
}