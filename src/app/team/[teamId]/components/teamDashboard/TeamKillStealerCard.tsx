"use client";

import React from 'react';
import { Card, CardHeader, CardBody, User, Tooltip } from '@heroui/react';
import { capitalize } from '@/utils/stringUtils';
import { AVATAR_SRC_MAP } from '@/constants';
import { useTeamDashboard } from '@/contexts/TeamDashboardContext';

export function TeamKillStealerCard() {
  const { killStealStats, teamOverview, periodGames } = useTeamDashboard();
  const players = teamOverview.players;

  if (periodGames.length === 0 || killStealStats.length === 0) {
    return (
      <Card isBlurred className="w-full h-full bg-background/60 dark:bg-default-100/50 flex flex-col min-h-[160px]">
        <CardHeader className="font-bold text-sm pb-2 border-b border-divider text-primary">Biggest Kill Stealer</CardHeader>
        <CardBody className="flex items-center justify-center text-xs text-default-400">
          Not enough data in this period.
        </CardBody>
      </Card>
    );
  }

  const biggestStealer = killStealStats[0];
  const stealerPlayer = players.find((p) => p.id === biggestStealer.playerId);
  if (!stealerPlayer) return null;

  const others = killStealStats.slice(1);

  return (
    <Card isBlurred className="w-full h-full bg-background/60 dark:bg-default-100/50 flex flex-col justify-between p-4 relative overflow-hidden min-h-[160px]">
      <div className="flex justify-between items-start z-10 relative">
        <div className="flex items-center gap-1">
          <div className="font-bold text-sm text-primary">Biggest Kill Stealer</div>
          <Tooltip content="Calculated as (Player Kills / Team Kills) - (Player Damage / Team Damage). A positive percentage indicates more kills compared to their damage output." placement="right" className="max-w-[200px]">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-default-400 cursor-help"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
          </Tooltip>
        </div>
      </div>

      <div className="flex flex-col grow my-2 z-10 w-full mt-2">
        {/* Top: Biggest Kill Stealer */}
        <div className="flex items-center justify-start md:pl-2 mb-3 shrink-0">
          <User
            name={capitalize(stealerPlayer.name)}
            description={`${biggestStealer.ksPercentage > 0 ? '+' : ''}${biggestStealer.ksPercentage.toFixed(1)}% ks rate`}
            avatarProps={{
              src: AVATAR_SRC_MAP[stealerPlayer.name]?.src,
              size: "md",
              isBordered: true,
              color: "danger"
            }}
            classNames={{
              name: "text-base font-bold",
              description: "text-sm text-default-500 font-medium"
            }}
          />
        </div>

        {/* Bottom: List of everyone else */}
        {others.length > 0 && (
          <div className="flex flex-col gap-1 border-t border-divider pt-2 w-full shrink-0">
            {others.map((stat) => {
              const player = players.find(p => p.id === stat.playerId);
              if (!player) return null;

              const isPositive = stat.ksPercentage > 0;

              return (
                <div key={stat.playerId} className="flex justify-between items-center w-full px-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-default-700">{capitalize(player.name)}</span>
                  </div>
                  <span className={`text-[10px] font-semibold ${isPositive ? 'text-danger' : 'text-default-500'}`}>
                    {isPositive ? '+' : ''}{stat.ksPercentage.toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Background decoration */}
      <div className="absolute right-0 top-1/4 opacity-5 translate-x-1/4 -translate-y-1/4 pointer-events-none text-danger">
        <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="22" y1="12" x2="18" y2="12" /><line x1="6" y1="12" x2="2" y2="12" /><line x1="12" y1="6" x2="12" y2="2" /><line x1="12" y1="22" x2="12" y2="18" /></svg>
      </div>
    </Card>
  );
}
