"use client";

import { Avatar, Card, CardBody, CardHeader, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/react";

export interface PlayerStatsGridProps {
  playerStats: Record<string, Record<string, number>>;
  valueFormatter?: (value: number) => string;
}

const defaultFormatter = (value: number) => value.toString();

const avatarSrcMap: Record<string, string> = {
  isaac: "https://5xbmuxxl0mrwzkji.public.blob.vercel-storage.com/avatars/isaac.jpg",
  cody: "https://5xbmuxxl0mrwzkji.public.blob.vercel-storage.com/avatars/cody.jpg",
  trenton: "https://5xbmuxxl0mrwzkji.public.blob.vercel-storage.com/avatars/trenton.jpg",
  ben: "https://5xbmuxxl0mrwzkji.public.blob.vercel-storage.com/avatars/ben.jpg",
};


export default function PlayerStatsGrid({ playerStats, valueFormatter = defaultFormatter }: PlayerStatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {Object.entries(playerStats).map(([player, stats]) => {
        const tableData = Object.entries(stats).map(([stat, value]) => ({
          stat: stat.charAt(0).toUpperCase() + stat.slice(1),
          value: valueFormatter(value),
        }));
        return (
          <Card key={player}>
            <CardHeader>
              <Avatar 
                src={avatarSrcMap[player]} 
                size="lg" 
                name={player} 
                showFallback
                radius="sm"
              />
              <h2 className="text-2xl font-semibold capitalize ml-1">{player}</h2>
            </CardHeader>
            <CardBody>
              <Table aria-label={`${player}'s stats`}>
                <TableHeader columns={[{ key: 'stat', label: 'Stat' }, { key: 'value', label: 'Value' }]}>{(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}</TableHeader>
                <TableBody items={tableData}>{(item) => (<TableRow key={item.stat}>{(columnKey) => <TableCell>{item[columnKey as keyof typeof item]}</TableCell>}</TableRow>)}</TableBody>
              </Table>
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
}