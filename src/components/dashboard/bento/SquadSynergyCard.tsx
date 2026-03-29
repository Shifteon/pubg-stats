import React from 'react';
import { Card, CardHeader, CardBody } from '@heroui/react';
import { getSquadSynergy } from '../Dashboard.utils';
import { Game } from '@/types';
import { capitalize } from '@/utils/stringUtils';

interface SquadSynergyCardProps {
  weekGames: Game[];
  playerId: string;
}

export function SquadSynergyCard({ weekGames, playerId }: SquadSynergyCardProps) {
  const synergy = getSquadSynergy(weekGames, playerId);

  return (
    <Card isBlurred className="col-span-1 md:col-span-2 bg-background/60 dark:bg-default-100/50">
      <CardHeader className="font-bold text-sm pb-0 text-secondary">Squad Synergy</CardHeader>
      <CardBody className="flex items-center justify-center">
        {!synergy ? (
          <div className="text-default-400">Play squad matches to reveal your power combo.</div>
        ) : (
          <div className="text-center">
            <div className="text-lg text-default-500">Power Combo with</div>
            <div className="text-3xl font-bold text-secondary mt-1">{capitalize(synergy.name)}</div>
            <div className="text-sm font-medium mt-2">
              <span className="text-success">{synergy.winRate}% Win Rate</span> ({synergy.games} games together)
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
