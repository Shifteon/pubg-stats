"use client";

import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/react";
import { Game } from "@/types";
import { statKeys } from "./gameSummary/utils";
import { capitalize } from "@/utils/stringUtils";

interface GameTableProps {
  data: Game["stats"];
  gameIndex: number;
}

export default function GameTable({ data, gameIndex }: GameTableProps) {
  const gameTableColumns = [
    { key: 'playerName', label: 'Player' }, ...statKeys.map(stat => ({ key: stat, label: capitalize(stat) }))
  ];

  return (
    <Table
      aria-label={`Game ${gameIndex} Summary`}
      color="primary"
    >
      <TableHeader columns={gameTableColumns}>
        {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
      </TableHeader>
      <TableBody items={data}>
        {(item) => (
          <TableRow key={item.playerId}>
            {(columnKey) => (
              <TableCell>
                {columnKey === "playerName"
                  ? capitalize(item[columnKey as keyof typeof item] as string)
                  : item[columnKey as keyof typeof item]}
              </TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
