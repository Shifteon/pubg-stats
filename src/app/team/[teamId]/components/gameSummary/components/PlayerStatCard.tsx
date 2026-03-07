"use client";

import { AVATAR_SRC_MAP } from "@/constants";
import { Avatar, Card, CardBody, CardHeader, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/react";

export interface PlayerStatCardProps {
  player: string;
  // stat to value OR stat to { value: number, game: any } mapping
  stats: Record<string, number | { value: number; game?: Record<string, unknown> | null }>;
  valueFormatter?: (value: number) => string;
  onGameClick?: (game: Record<string, unknown>) => void;
}

const defaultFormatter = (value: number) => value.toString();

export default function PlayerStatCard({ player, stats, valueFormatter = defaultFormatter, onGameClick }: PlayerStatCardProps) {
  const tableData = Object.entries(stats).map(([stat, val]) => {
    const value = typeof val === 'object' && val !== null && 'value' in val ? val.value : val as number;
    const game = typeof val === 'object' && val !== null && 'game' in val ? val.game : null;
    return {
      stat: stat.charAt(0).toUpperCase() + stat.slice(1),
      value: valueFormatter(value),
      game
    };
  });

  return (
    <Card>
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
          <TableHeader columns={[{ key: 'stat', label: 'Stat' }, { key: 'value', label: 'Value' }]}>
            {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
          </TableHeader>
          <TableBody items={tableData}>
            {(item) => (
              <TableRow
                key={item.stat}
                className={item.game && onGameClick ? "cursor-pointer hover:bg-default-100" : ""}
                onClick={() => item.game && onGameClick && onGameClick(item.game)}
              >
                {(columnKey) => <TableCell>{item[columnKey as 'stat' | 'value']}</TableCell>}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardBody>
    </Card>
  );
}
