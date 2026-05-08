import React from 'react';
import { Card, CardHeader, CardBody, Avatar, Divider, Tooltip } from '@heroui/react';
import { AVATAR_SRC_MAP } from '@/constants';
import { capitalize } from '@/utils/stringUtils';
import { useTeamDashboard } from '@/contexts/TeamDashboardContext';

const StatWithTooltip = ({
  currentVal,
  pastVal,
  decimals = 1,
  viewType,
  label,
  valueClassName = "text-xl font-black",
  hasPreviousGames,
  children
}: {
  currentVal: number;
  pastVal?: number;
  decimals?: number;
  viewType: string;
  label: string;
  valueClassName?: string;
  hasPreviousGames: boolean;
  children: React.ReactNode;
}) => {
  if (viewType === 'all-time' || !hasPreviousGames || pastVal === undefined) {
    return (
      <div className="flex items-center gap-2">
        <span className={valueClassName}>{children}</span>
      </div>
    );
  }

  const diff = currentVal - pastVal;
  const isUp = diff > 0;
  const color = isUp ? "text-success" : "text-danger";
  const comparisonLabel = viewType === 'monthly' ? 'vs last month'
    : viewType === 'weekly' ? 'vs last week'
      : viewType === 'session' ? 'vs last session'
        : 'vs previous period';

  const tooltipContent = (
    <div className="flex flex-col gap-1 p-1">
      <div className="text-tiny font-bold text-default-500 mb-1">
        {label} <span className="font-normal">{comparisonLabel}</span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-small">
        <span className="text-default-500">Current:</span>
        <span className="font-medium text-right">{currentVal.toFixed(decimals)}</span>

        <span className="text-default-500">Previous:</span>
        <span className="font-medium text-right">{pastVal.toFixed(decimals)}</span>

        <span className="text-default-500">Change:</span>
        <span className={`font-bold text-right ${isUp ? 'text-success' : diff < 0 ? 'text-danger' : 'text-default-500'}`}>
          {isUp ? '+' : ''}{diff.toFixed(decimals)}
        </span>
      </div>
    </div>
  );

  return (
    <Tooltip content={tooltipContent} placement="top" className="bg-content1 border border-default-200" delay={0} closeDelay={0}>
      <div className="flex items-center md:gap-2 cursor-help transition-opacity hover:opacity-80">
        <span className={valueClassName}>{children}</span>
        {Math.abs(diff) >= 0.01 && (
          <div className={`flex items-center text-[10px] ${color} ml-1 font-bold whitespace-nowrap`}>
            {isUp ? (
              <svg className="w-2 h-2 mr-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7" /><path d="M12 19V5" /></svg>
            ) : (
              <svg className="w-2 h-2 mr-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m19 12-7 7-7-7" /><path d="M12 5v14" /></svg>
            )}
            {Math.abs(diff).toFixed(decimals)}
          </div>
        )}
      </div>
    </Tooltip>
  );
};

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

  const hasPastGames = previousPeriodGames.length > 0;

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
            <StatWithTooltip currentVal={currentWinRate} pastVal={pastWinRate} viewType={viewType} hasPreviousGames={hasPastGames} label="Win Rate" decimals={1}>
              {currentWinRate.toFixed(1)}%
            </StatWithTooltip>
          </div>

          <div className="flex flex-col items-center border-l border-divider/50">
            <span className="text-[10px] text-default-500 font-semibold mb-1 uppercase tracking-wider">Avg Kills</span>
            <StatWithTooltip currentVal={currentTeamKills} pastVal={pastTeamKills} viewType={viewType} hasPreviousGames={hasPastGames} label="Avg Kills" decimals={1}>
              {currentTeamKills.toFixed(1)}
            </StatWithTooltip>
          </div>

          <div className="flex flex-col items-center border-l border-divider/50">
            <span className="text-[10px] text-default-500 font-semibold mb-1 uppercase tracking-wider">Avg DMG</span>
            <StatWithTooltip currentVal={currentTeamDamage} pastVal={pastTeamDamage} viewType={viewType} hasPreviousGames={hasPastGames} label="Avg DMG" decimals={0}>
              {Math.round(currentTeamDamage)}
            </StatWithTooltip>
          </div>
        </div>

        <Divider className="opacity-50" />

        {/* Player Detailed Averages */}
        <div className="flex flex-col gap-3 overflow-y-auto w-full pr-1 custom-scrollbar">
          {playerTrends.map(({ player, current: pCurrent, past: pPast }) => (
            <div key={player.id} className="flex items-center gap-3 min-w-fit bg-default-50/50 p-2 rounded-lg border border-divider/20 hover:bg-default-100/50 transition-colors">
              <div className="flex flex-col items-center min-w-[50px]">
                <Avatar
                  src={AVATAR_SRC_MAP[player.name.toLowerCase()]?.src}
                  name={player.name}
                  size="sm"
                  className="mb-1 border-2 border-primary/20"
                />
                <span className="text-[10px] font-bold text-default-600 leading-tight">{capitalize(player.name)}</span>
              </div>

              <div className="grid grid-cols-5 gap-1 grow min-w-[400px] overflow-x-auto">
                <div className="flex flex-col">
                  <span className="text-[9px] text-default-400 uppercase font-bold">Kills</span>
                  <StatWithTooltip currentVal={pCurrent.avgKills} pastVal={pPast?.avgKills} viewType={viewType} hasPreviousGames={hasPastGames} label="Kills" decimals={1} valueClassName="text-sm font-black">
                    {pCurrent.avgKills.toFixed(1)}
                  </StatWithTooltip>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-default-400 uppercase font-bold">DMG</span>
                  <StatWithTooltip currentVal={pCurrent.avgDamage} pastVal={pPast?.avgDamage} viewType={viewType} hasPreviousGames={hasPastGames} label="Damage" decimals={0} valueClassName="text-sm font-black">
                    {Math.round(pCurrent.avgDamage)}
                  </StatWithTooltip>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-default-400 uppercase font-bold">AST</span>
                  <StatWithTooltip currentVal={pCurrent.avgAssists} pastVal={pPast?.avgAssists} viewType={viewType} hasPreviousGames={hasPastGames} label="Assists" decimals={1} valueClassName="text-sm font-black">
                    {pCurrent.avgAssists.toFixed(1)}
                  </StatWithTooltip>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-default-400 uppercase font-bold">Res</span>
                  <StatWithTooltip currentVal={pCurrent.avgRescues} pastVal={pPast?.avgRescues} viewType={viewType} hasPreviousGames={hasPastGames} label="Rescues" decimals={1} valueClassName="text-sm font-black">
                    {pCurrent.avgRescues.toFixed(1)}
                  </StatWithTooltip>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-default-400 uppercase font-bold">Rec</span>
                  <StatWithTooltip currentVal={pCurrent.avgRecalls} pastVal={pPast?.avgRecalls} viewType={viewType} hasPreviousGames={hasPastGames} label="Recalls" decimals={1} valueClassName="text-sm font-black">
                    {pCurrent.avgRecalls.toFixed(1)}
                  </StatWithTooltip>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
