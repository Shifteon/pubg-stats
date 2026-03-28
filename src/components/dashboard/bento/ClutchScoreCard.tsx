import React from 'react';
import { Card, CardHeader, CardBody } from '@heroui/react';
import { getClutchScore } from '../Dashboard.utils';
import { Game } from '@/types';

interface ClutchScoreCardProps {
  weekGames: Game[];
  playerId: string;
}

export function ClutchScoreCard({ weekGames, playerId }: ClutchScoreCardProps) {
  const clutchScore = getClutchScore(weekGames, playerId);

  return (
    <Card isBlurred className="col-span-1 bg-background/60 dark:bg-default-100/50">
      <CardHeader className="font-bold text-sm pb-0 text-primary">Clutch Score</CardHeader>
      <CardBody className="flex items-center justify-center flex-col">
        <div className="text-5xl font-black">{clutchScore}</div>
        <div className="text-xs text-default-400 mt-2">(Rescues * 2) + Recalls</div>
      </CardBody>
    </Card>
  );
}
