import React from 'react';
import { Card, CardHeader, CardBody } from '@heroui/react';
import { getClutchScore } from '../Dashboard.utils';
import { Game } from '@/types';

interface ClutchScoreCardProps {
  periodGames: Game[];
  playerId: string;
}

export function ClutchScoreCard({ periodGames, playerId }: ClutchScoreCardProps) {
  const clutchScore = getClutchScore(periodGames, playerId);

  return (
    <Card isBlurred className="w-full h-full bg-background/60 dark:bg-default-100/50">
      <CardHeader className="font-bold text-sm pb-0 text-primary">Clutch Score</CardHeader>
      <CardBody className="flex items-center justify-center flex-col">
        <div className="text-5xl font-black">{clutchScore}</div>
        <div className="text-xs text-default-400 mt-2">(Rescues * 2) + Recalls</div>
      </CardBody>
    </Card>
  );
}
