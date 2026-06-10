import React, { useState } from 'react';
import { Card, CardHeader, CardBody, User, useDisclosure } from '@heroui/react';
import { Game } from '@/types';
import { capitalize } from '@/utils/stringUtils';
import { AVATAR_SRC_MAP } from '@/constants';
import GameModal from '@/components/game/GameModal';
import { useTeamDashboard } from '@/contexts/TeamDashboardContext';

export function TeamPersonalBestsCard() {
  const { personalBests, teamOverview, periodGames } = useTeamDashboard();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  const handleGameClick = (gameId: string) => {
    if (!gameId) return;
    const game = periodGames.find(g => g.id === gameId);
    if (game) {
      setSelectedGame(game);
      onOpen();
    }
  };

  if (periodGames.length === 0) {
    return (
      <Card isBlurred className="w-full h-full bg-background/60 dark:bg-default-100/50 flex flex-col">
         <CardHeader className="font-bold text-sm pb-2 text-primary">Personal Bests</CardHeader>
         <CardBody className="flex items-center justify-center text-xs text-default-400">
           No games recorded.
         </CardBody>
      </Card>
    );
  }

  return (
    <Card isBlurred className="w-full h-full bg-background/60 dark:bg-default-100/50 flex flex-col">
      <CardHeader className="font-bold text-sm pb-2 text-primary px-4 pt-4">
        Personal Bests
      </CardHeader>
      <CardBody className="p-0 overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-default-100/50 text-default-600 text-xs uppercase">
            <tr>
              <th className="px-4 py-2 font-medium">Player</th>
              <th className="px-4 py-2 font-medium text-center">Kills</th>
              <th className="px-4 py-2 font-medium text-center">Damage</th>
              <th className="px-4 py-2 font-medium text-center">Assists</th>
              <th className="px-4 py-2 font-medium text-center">Res</th>
              <th className="px-4 py-2 font-medium text-center">Rec</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-divider/50">
            {teamOverview.players.map(player => {
              const pb = personalBests[player.id];
              if (!pb) return null;
              
              return (
                <tr key={player.id} className="hover:bg-default-100/30 transition-colors group">
                  <td className="px-4 py-2">
                    <User
                      name={capitalize(player.name)}
                      avatarProps={{
                        src: AVATAR_SRC_MAP[player.name]?.src,
                        size: "sm",
                        className: "group-hover:scale-110 transition-transform"
                      }}
                      classNames={{ name: "text-xs font-bold" }}
                    />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <span 
                      className={`font-semibold ${pb.kills.gameId ? 'cursor-pointer hover:text-primary transition-colors' : ''}`}
                      onClick={() => handleGameClick(pb.kills.gameId)}
                    >
                      {pb.kills.statValue > -1 ? pb.kills.statValue : '-'}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center text-warning-600">
                    <span 
                      className={`font-semibold ${pb.damage.gameId ? 'cursor-pointer hover:text-primary transition-colors' : ''}`}
                      onClick={() => handleGameClick(pb.damage.gameId)}
                    >
                      {pb.damage.statValue > -1 ? Math.round(pb.damage.statValue) : '-'}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <span 
                      className={`font-semibold ${pb.assists.gameId ? 'cursor-pointer hover:text-primary transition-colors' : ''}`}
                      onClick={() => handleGameClick(pb.assists.gameId)}
                    >
                      {pb.assists.statValue > -1 ? pb.assists.statValue : '-'}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center text-success-600">
                    <span 
                      className={`font-semibold ${pb.rescues.gameId ? 'cursor-pointer hover:text-primary transition-colors' : ''}`}
                      onClick={() => handleGameClick(pb.rescues.gameId)}
                    >
                      {pb.rescues.statValue > -1 ? pb.rescues.statValue : '-'}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center text-secondary-600">
                    <span 
                      className={`font-semibold ${pb.recalls.gameId ? 'cursor-pointer hover:text-primary transition-colors' : ''}`}
                      onClick={() => handleGameClick(pb.recalls.gameId)}
                    >
                      {pb.recalls.statValue > -1 ? pb.recalls.statValue : '-'}
                    </span>
                  </td>
                </tr>
              );
            })}

          </tbody>
        </table>
      </CardBody>
      <GameModal 
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        game={selectedGame}
      />
    </Card>
  );
}
