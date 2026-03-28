import React from 'react';
import { Card, CardHeader, CardBody, Chip } from '@heroui/react';
import { getWeeklyTrends } from '../Dashboard.utils';
import { Game } from '@/types';

interface WeeklyTrendsCardProps {
  weekGames: Game[];
  playerId: string;
  lifetime: {
    kills: number;
    damage: number;
  };
}

export function WeeklyTrendsCard({ weekGames, playerId, lifetime }: WeeklyTrendsCardProps) {
  const trends = getWeeklyTrends(weekGames, playerId);
  const killsDelta = trends.avgKills - lifetime.kills;
  const damageDelta = trends.avgDamage - lifetime.damage;

  return (
    <Card isBlurred className="col-span-1 md:col-span-2 md:row-span-2 bg-background/60 dark:bg-default-100/50">
      <CardHeader className="font-bold text-lg pb-0">Weekly Trends</CardHeader>
      <CardBody className="flex flex-col gap-6 justify-center">
        {weekGames.length === 0 ? (
          <div className="text-center text-default-400">No games played this week.</div>
        ) : (
          <>
            <div className="flex justify-between items-center border-b border-divider pb-4">
              <div>
                <h4 className="text-default-500 text-sm font-medium">Avg Kills</h4>
                <div className="text-4xl font-black">{trends.avgKills.toFixed(1)}</div>
              </div>
              <div>
                <Chip
                  color={killsDelta >= 0 ? "success" : "danger"}
                  variant="flat"
                >
                  {killsDelta > 0 ? "+" : ""}{killsDelta.toFixed(1)} vs Lifetime
                </Chip>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-default-500 text-sm font-medium">Avg Damage</h4>
                <div className="text-4xl font-black">{trends.avgDamage.toFixed(0)}</div>
              </div>
              <div>
                <Chip
                  color={damageDelta >= 0 ? "success" : "danger"}
                  variant="flat"
                >
                  {damageDelta > 0 ? "+" : ""}{damageDelta.toFixed(0)} vs Lifetime
                </Chip>
              </div>
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
}
