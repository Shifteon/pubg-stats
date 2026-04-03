import React from 'react';
import { Card, CardHeader, CardBody, Chip, ScrollShadow } from '@heroui/react';
import { getHeadToHead } from '../Dashboard.utils';
import { Game } from '@/types';
import { HeadToHeadChart } from './HeadToHeadChart';

interface HeadToHeadCardProps {
  periodGames: Game[];
  playerId: string;
}

export function HeadToHeadCard({ periodGames, playerId }: HeadToHeadCardProps) {
  const data = getHeadToHead(periodGames, playerId);
  const { player, teammates } = data;

  if (periodGames.length === 0) {
    return (
      <Card isBlurred className="w-full h-full bg-background/60 dark:bg-default-100/50">
        <CardHeader className="font-bold text-sm pb-0 text-primary">Head to Head</CardHeader>
        <CardBody className="flex items-center justify-center text-xs text-default-400">
          No data for this period.
        </CardBody>
      </Card>
    );
  }

  return (
    <Card isBlurred className="w-full h-full bg-background/60 dark:bg-default-100/50 flex flex-col">
      <CardHeader className="pb-2">
        <span className="font-bold text-md text-primary">Head to Head</span>
      </CardHeader>

      <CardBody className="p-0 mb-4 flex flex-col">
        <div className="grow p-4 min-h-[300px]">
          {teammates.length === 0 ? (
            <div className="flex items-center justify-center h-full text-xs text-default-400">No teammates recorded.</div>
          ) : (
            <HeadToHeadChart player={player} teammates={teammates} playerId={playerId} />
          )}
        </div>
      </CardBody>
    </Card>
  );
}
