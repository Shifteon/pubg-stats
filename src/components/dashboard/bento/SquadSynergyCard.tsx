import React from 'react';
import { Card, CardHeader, CardBody } from '@heroui/react';
import { getTeamsPlayedWith } from '../Dashboard.utils';
import { Game, PlayerTeamStats } from '@/types';
import { capitalize } from '@/utils/stringUtils';
import Link from 'next/link';

interface SquadSynergyCardProps {
  periodGames: Game[];
  playerTeamStats: PlayerTeamStats[];
  viewType: string;
  dateParam: string | null;
}

export function SquadSynergyCard({
  periodGames,
  playerTeamStats,
  viewType,
  dateParam
}: SquadSynergyCardProps) {
  const teams = getTeamsPlayedWith(periodGames, playerTeamStats);

  return (
    <Card isBlurred className="w-full h-full bg-background/60 dark:bg-default-100/50 flex flex-col">
      <CardHeader className="font-bold text-sm pb-2 border-b border-divider text-secondary shrink-0">
        Teams Played With
      </CardHeader>
      <CardBody className="p-0 overflow-y-auto">
        {teams.length === 0 ? (
          <div className="flex items-center justify-center h-full text-default-400 p-4 text-center">
            No team games played in this period.
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-divider">
            {teams.map((team) => (
              <Link
                key={team.teamId}
                href={`/team/${team.teamId}?view=${viewType}${dateParam ? `&date=${dateParam}` : ''}`}
                className="p-3 hover:bg-default-100/50 transition-colors flex justify-between items-center group"
              >
                <div className="flex flex-col gap-0.5">
                  <div className="font-bold text-sm group-hover:text-primary transition-colors">
                    {capitalize(team.name)}
                  </div>
                  <div className="text-xs text-default-500">
                    {team.games} {team.games === 1 ? 'game' : 'games'} played
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <div className={`text-sm font-bold ${team.winRate >= 50 ? 'text-success' : 'text-default-600'}`}>
                    {team.winRate}%
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-default-400 font-semibold leading-none">
                    Win Rate
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
