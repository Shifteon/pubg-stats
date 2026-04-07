import React from 'react';
import { Card, CardHeader, CardBody } from '@heroui/react';
import { Game, TeamOverview } from '@/types';
import { getTeamCurrentForm, getTeamOverviewStats } from './TeamDashboard.utils';

interface TeamCurrentFormCardProps {
  periodGames: Game[];
  teamOverview: TeamOverview;
}

export function TeamCurrentFormCard({ periodGames, teamOverview }: TeamCurrentFormCardProps) {
  const current = getTeamCurrentForm(periodGames);
  const currentOverview = getTeamOverviewStats(periodGames);
  
  const lifetimeWinRate = teamOverview.winRate;
  const currentWinRate = currentOverview.winRate;

  const currentTeamKills = current.avgKills;
  const currentTeamDamage = current.avgDamage;

  const getTrendIcon = (current: number, past: number, invert = false) => {
    if (Math.abs(current - past) < 0.01) return <span className="text-default-400 font-bold">-</span>;
    const isUp = current > past;
    const isGood = invert ? !isUp : isUp;
    return isGood ? (
      <svg className="w-3 h-3 text-success inline mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
    ) : (
      <svg className="w-3 h-3 text-danger inline mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 12-7 7-7-7"/><path d="M12 5v14"/></svg>
    );
  };

  const getTrendColor = (current: number, past: number, invert = false) => {
    if (Math.abs(current - past) < 0.01) return "text-default-400";
    const isUp = current > past;
    const isGood = invert ? !isUp : isUp;
    return isGood ? "text-success" : "text-danger";
  };

  return (
    <Card isBlurred className="w-full h-full bg-background/60 dark:bg-default-100/50 flex flex-col">
      <CardHeader className="pb-2">
        <span className="font-bold text-md text-primary">Current Form</span>
      </CardHeader>
      <CardBody className="p-4 grid grid-cols-3 gap-2 place-content-center">
        <div className="flex flex-col items-center">
          <span className="text-xs text-default-500 font-semibold mb-1 uppercase tracking-wider">Win Rate</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black">{currentWinRate.toFixed(1)}%</span>
            <div className="hidden sm:flex items-center text-xs">
              {getTrendIcon(currentWinRate, lifetimeWinRate)}
              <span className={getTrendColor(currentWinRate, lifetimeWinRate)}>
                {(currentWinRate - lifetimeWinRate).toFixed(1)}%
              </span>
            </div>
          </div>
          <span className="text-[10px] text-default-400 mt-1">vs {lifetimeWinRate.toFixed(1)}% all-time</span>
        </div>
        
        <div className="flex flex-col items-center border-l border-divider/50">
          <span className="text-xs text-default-500 font-semibold mb-1 uppercase tracking-wider">Avg Kills / Player</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black">{currentTeamKills.toFixed(1)}</span>
          </div>
          <span className="text-[10px] text-default-400 mt-1">in selected period</span>
        </div>

        <div className="flex flex-col items-center border-l border-divider/50">
          <span className="text-xs text-default-500 font-semibold mb-1 uppercase tracking-wider">Avg DMG / Player</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black">{Math.round(currentTeamDamage)}</span>
          </div>
          <span className="text-[10px] text-default-400 mt-1">in selected period</span>
        </div>
      </CardBody>
    </Card>
  );
}
