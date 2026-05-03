import React from 'react';
import { Card, CardHeader, CardBody, Avatar, Divider } from '@heroui/react';
import { AVATAR_SRC_MAP } from '@/constants';
import { capitalize } from '@/utils/stringUtils';
import { useTeamDashboard } from '@/contexts/TeamDashboardContext';

export function TeamCurrentFormCard() {
  const { 
    currentForm: current, 
    pastForm: past, 
    currentOverview, 
    pastOverview, 
    playerTrends, 
    viewType,
    previousPeriodGames 
  } = useTeamDashboard();

  const currentWinRate = currentOverview.winRate;
  const currentTeamKills = current.avgKills;
  const currentTeamDamage = current.avgDamage;

  const pastWinRate = pastOverview?.winRate;
  const pastTeamKills = past?.avgKills;
  const pastTeamDamage = past?.avgDamage;

  const renderDelta = (currentVal: number, pastVal: number, decimals = 1) => {
    if (viewType === 'all-time' || !previousPeriodGames.length) return null;
    const diff = currentVal - pastVal;
    if (Math.abs(diff) < 0.01) return null;
    const isUp = diff > 0;
    const color = isUp ? "text-success" : "text-danger";
    return (
      <div className={`flex items-center text-[10px] ${color} ml-1 font-bold whitespace-nowrap`}>
        {isUp ? (
          <svg className="w-2 h-2 mr-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7" /><path d="M12 19V5" /></svg>
        ) : (
          <svg className="w-2 h-2 mr-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m19 12-7 7-7-7" /><path d="M12 5v14" /></svg>
        )}
        {Math.abs(diff).toFixed(decimals)}
      </div>
    );
  };

  return (
    <Card isBlurred className="w-full h-full bg-background/60 dark:bg-default-100/50 flex flex-col">
      <CardHeader className="pb-2">
        <span className="font-bold text-md text-primary">Current Form</span>
      </CardHeader>
      <CardBody className="p-4 flex flex-col gap-4 overflow-hidden">
        {/* Team Summary Row */}
        <div className="grid grid-cols-3 gap-2 place-content-center shrink-0">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-default-500 font-semibold mb-1 uppercase tracking-wider">Win Rate</span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black">{currentWinRate.toFixed(1)}%</span>
              {pastWinRate !== undefined && renderDelta(currentWinRate, pastWinRate)}
            </div>
          </div>

          <div className="flex flex-col items-center border-l border-divider/50">
            <span className="text-[10px] text-default-500 font-semibold mb-1 uppercase tracking-wider">Avg Kills</span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black">{currentTeamKills.toFixed(1)}</span>
              {pastTeamKills !== undefined && renderDelta(currentTeamKills, pastTeamKills)}
            </div>
          </div>

          <div className="flex flex-col items-center border-l border-divider/50">
            <span className="text-[10px] text-default-500 font-semibold mb-1 uppercase tracking-wider">Avg DMG</span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black">{Math.round(currentTeamDamage)}</span>
              {pastTeamDamage !== undefined && renderDelta(currentTeamDamage, pastTeamDamage, 0)}
            </div>
          </div>
        </div>

        <Divider className="opacity-50" />

        {/* Player Detailed Averages */}
        <div className="flex flex-col gap-3 overflow-y-auto pr-1 custom-scrollbar">
          {playerTrends.map(({ player, current: pCurrent, past: pPast }) => (
            <div key={player.id} className="flex items-center gap-3 bg-default-50/50 p-2 rounded-lg border border-divider/20 hover:bg-default-100/50 transition-colors">
              <div className="flex flex-col items-center min-w-[50px]">
                <Avatar
                  src={AVATAR_SRC_MAP[player.name.toLowerCase()]?.src}
                  name={player.name}
                  size="sm"
                  className="mb-1 border-2 border-primary/20"
                />
                <span className="text-[10px] font-bold text-default-600 leading-tight">{capitalize(player.name)}</span>
              </div>

              <div className="grid grid-cols-5 gap-1 grow">
                <div className="flex flex-col items-center">
                  <span className="text-[9px] text-default-400 uppercase font-bold">Kills</span>
                  <div className="flex items-center">
                    <span className="text-sm font-black">{pCurrent.avgKills.toFixed(1)}</span>
                    {pPast && renderDelta(pCurrent.avgKills, pPast.avgKills)}
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[9px] text-default-400 uppercase font-bold">DMG</span>
                  <div className="flex items-center">
                    <span className="text-sm font-black">{Math.round(pCurrent.avgDamage)}</span>
                    {pPast && renderDelta(pCurrent.avgDamage, pPast.avgDamage, 0)}
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[9px] text-default-400 uppercase font-bold">AST</span>
                  <div className="flex items-center">
                    <span className="text-sm font-black">{pCurrent.avgAssists.toFixed(1)}</span>
                    {pPast && renderDelta(pCurrent.avgAssists, pPast.avgAssists)}
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[9px] text-default-400 uppercase font-bold">Res</span>
                  <div className="flex items-center">
                    <span className="text-sm font-black">{pCurrent.avgRescues.toFixed(1)}</span>
                    {pPast && renderDelta(pCurrent.avgRescues, pPast.avgRescues)}
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[9px] text-default-400 uppercase font-bold">Rec</span>
                  <div className="flex items-center">
                    <span className="text-sm font-black">{pCurrent.avgRecalls.toFixed(1)}</span>
                    {pPast && renderDelta(pCurrent.avgRecalls, pPast.avgRecalls)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
