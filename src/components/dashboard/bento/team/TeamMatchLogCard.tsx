import React, { useState } from 'react';
import { Card, CardHeader, CardBody, useDisclosure, Chip } from '@heroui/react';
import { format } from 'date-fns';
import { Game } from '@/types';
import GameModal from '@/components/game/GameModal';

interface TeamMatchLogCardProps {
  periodGames: Game[];
}

export function TeamMatchLogCard({ periodGames }: TeamMatchLogCardProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  const handleGameClick = (game: Game) => {
    setSelectedGame(game);
    onOpen();
  };

  const reversedGames = [...periodGames].reverse();

  return (
    <Card isBlurred className="w-full h-full bg-background/60 dark:bg-default-100/50 flex flex-col">
      <CardHeader className="font-bold text-sm pb-2">
        Match Log
        <Chip size="sm" color="primary" className="ml-2">
          {periodGames.length} games
        </Chip>
      </CardHeader>
      <CardBody className="p-0 overflow-y-auto max-h-[300px] md:max-h-full">
        {periodGames.length === 0 ? (
          <div className="p-4 text-center text-default-400">No recent matches found.</div>
        ) : (
          <div className="flex flex-col divide-y divide-divider">
            {reversedGames.map((game) => {
              const teamKills = game.stats.reduce((acc, s) => acc + (s.kills || 0), 0);
              const teamAssists = game.stats.reduce((acc, s) => acc + (s.assists || 0), 0);
              const teamDamage = game.stats.reduce((acc, s) => acc + (s.damage || 0), 0);

              return (
                <div
                  key={game.id}
                  className="p-4 hover:bg-default-100/50 transition-colors flex justify-between items-center cursor-pointer"
                  onClick={() => handleGameClick(game)}
                >
                  <div>
                    <div className="font-semibold text-sm">
                      {game.isWin ? <span className="text-success">VICTORY</span> : <span className="text-danger">DEFEAT</span>}
                    </div>
                    <div className="text-xs text-default-500">
                      {game.playedAt ? format(new Date(game.playedAt), 'EEE, MMM d • h:mm a') : 'Unknown time'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm">{teamKills} K / {teamAssists} A</div>
                    <div className="text-xs text-default-500">{Math.round(teamDamage)} DMG</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardBody>
      <GameModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        game={selectedGame}
      />
    </Card>
  );
}
