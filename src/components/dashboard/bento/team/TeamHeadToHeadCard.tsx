"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Avatar, Tooltip } from '@heroui/react';
import { capitalize } from '@/utils/stringUtils';
import { AVATAR_SRC_MAP } from '@/constants';
import { getHeadToHead } from '../../Dashboard.utils';
import { HeadToHeadChart } from '../HeadToHeadChart';
import { useTeamDashboard } from '@/contexts/TeamDashboardContext';

export function TeamHeadToHeadCard() {
  const { periodGames, teamOverview } = useTeamDashboard();
  const players = teamOverview.players;
  const [focusedPlayerId, setFocusedPlayerId] = useState<string>(players[0]?.id || '');

  useEffect(() => {
    if (!focusedPlayerId && players.length > 0) {
      setFocusedPlayerId(players[0].id);
    }
  }, [players, focusedPlayerId]);

  if (periodGames.length === 0 || players.length === 0) {
    return (
      <Card isBlurred className="w-full h-full bg-background/60 dark:bg-default-100/50 flex flex-col min-h-[300px]">
        <CardHeader className="font-bold text-sm pb-2 border-b border-divider text-primary">Internal Comparison</CardHeader>
        <CardBody className="flex items-center justify-center text-xs text-default-400">
          No shared games recorded in this period.
        </CardBody>
      </Card>
    );
  }

  const data = getHeadToHead(periodGames, focusedPlayerId);

  return (
    <Card isBlurred className="w-full h-full bg-background/60 dark:bg-default-100/50 flex flex-col min-h-[300px]">
      <CardHeader className="font-bold text-sm pb-2 text-primary shrink-0 flex justify-between items-center">
        <span>Head to Head</span>

        <div className="flex gap-2">
          {players.map(player => {
            const isFocused = player.id === focusedPlayerId;
            return (
              <Tooltip key={player.id} content={`Focus: ${capitalize(player.name)}`} placement="bottom">
                <Avatar
                  src={AVATAR_SRC_MAP[player.name]?.src}
                  size="sm"
                  isBordered={isFocused}
                  color={isFocused ? "primary" : "default"}
                  className={`cursor-pointer transition-transform hover:scale-110 ${!isFocused && 'opacity-60 grayscale'}`}
                  onClick={() => setFocusedPlayerId(player.id)}
                />
              </Tooltip>
            );
          })}
        </div>
      </CardHeader>

      <CardBody className="p-0 mb-4 flex flex-col">
        <div className="grow p-4 min-h-[300px]">
          {data.teammates.length === 0 ? (
            <div className="flex items-center justify-center h-full text-xs text-default-400">
              No shared games found with teammates in this period.
            </div>
          ) : (
            <HeadToHeadChart player={data.player} teammates={data.teammates} playerId={focusedPlayerId} />
          )}
        </div>
      </CardBody>
    </Card>
  );
}
