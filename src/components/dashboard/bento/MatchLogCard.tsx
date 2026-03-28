import React from 'react';
import { Card, CardHeader, CardBody } from '@heroui/react';
import { format } from 'date-fns';
import { Game } from '@/types';

interface MatchLogCardProps {
  weekGames: Game[];
  playerId: string;
}

export function MatchLogCard({ weekGames, playerId }: MatchLogCardProps) {
  return (
    <Card isBlurred className="col-span-1 md:col-span-2 md:row-span-2 bg-background/60 dark:bg-default-100/50 flex flex-col h-full">
      <CardHeader className="font-bold text-sm pb-2 border-b border-divider">Match Log</CardHeader>
      <CardBody className="p-0 overflow-y-auto max-h-[300px] md:max-h-full">
        {weekGames.length === 0 ? (
          <div className="p-4 text-center text-default-400">No recent matches found.</div>
        ) : (
          <div className="flex flex-col divide-y divide-divider">
            {weekGames.map((game) => {
              const myStats = game.stats.find((s: Game["stats"][0]) => s.playerId === playerId);
              return (
                <div key={game.id} className="p-4 hover:bg-default-100/50 transition-colors flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-sm">
                      {game.isWin ? <span className="text-success">VICTORY</span> : <span className="text-danger">DEFEAT</span>}
                    </div>
                    <div className="text-xs text-default-500">
                      {format(new Date(game.playedAt || new Date()), 'EEE, MMM d • h:mm a')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm">{myStats?.kills || 0} K / {myStats?.assists || 0} A</div>
                    <div className="text-xs text-default-500">{myStats?.damage || 0} DMG</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
