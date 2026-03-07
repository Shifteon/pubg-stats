"use client";

import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/react";
import { PlayerGameStat } from "@/types";

interface GameTableProps {
  data: PlayerGameStat[];
  gameIndex: number;
}

import { statKeys } from "../utils";

export default function GameTable({ data, gameIndex }: GameTableProps) {
  const gameTableColumns = [
    { key: 'player', label: 'Player' }, ...statKeys.map(stat => ({ key: stat, label: stat.charAt(0).toUpperCase() + stat.slice(1) }))
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
        {(item) => (<TableRow key={item.player}>{(columnKey) => <TableCell>{item[columnKey as keyof typeof item]}</TableCell>}</TableRow>)}
      </TableBody>
    </Table>
  );
}
