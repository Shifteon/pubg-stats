import React from 'react';
import { Card, CardHeader, CardBody } from '@heroui/react';
import { getRivalry } from '../Dashboard.utils';
import { Game } from '@/types';
import { capitalize } from '@/utils/stringUtils';

interface RivalryCardProps {
  weekGames: Game[];
  playerId: string;
}

export function RivalryCard({ weekGames, playerId }: RivalryCardProps) {
  const rivalry = getRivalry(weekGames, playerId);

  return (
    <Card isBlurred className="col-span-1 bg-background/60 dark:bg-default-100/50">
      <CardHeader className="font-bold text-sm pb-0 text-warning">The Rivalry</CardHeader>
      <CardBody className="flex items-center justify-center flex-col text-center p-2">
        {!rivalry ? (
          <div className="text-xs text-default-400">Play with friends to establish a rivalry.</div>
        ) : (
          <>
            <div className="text-lg font-bold">{capitalize(rivalry.name)}</div>
            <div className="text-xs text-default-500 mt-1">
              Closest match this week (Diff: {rivalry.diff.toFixed(2)})
            </div>
            <div className="text-xs mt-2 text-default-400">
              {rivalry.avgKills.toFixed(1)} K / {rivalry.avgDamage.toFixed(0)} D
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
}
