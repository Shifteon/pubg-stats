import React from 'react';
import { Card, CardHeader, CardBody, CircularProgress } from '@heroui/react';
import ButterflyBarChart from '@/components/charts/butterflyBarChart';
import { useTeamDashboard } from '@/contexts/TeamDashboardContext';

// Custom icons
const GameIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="6" x2="10" y1="12" y2="12" /><line x1="8" x2="8" y1="10" y2="14" /><line x1="15" x2="15.01" y1="13" y2="13" /><line x1="18" x2="18.01" y1="11" y2="11" /><rect width="20" height="12" x="2" y="6" rx="2" />
  </svg>
);

const FlameIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);

const TrophyIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);

export function TeamOverviewCard() {
  const { currentOverview: stats, periodGames } = useTeamDashboard();

  // Extract up to 10 most recent games for the sparkline
  const recentGames = periodGames.slice(-10);

  // Determine win rate color
  const winRateColor: "success" | "warning" | "danger" = stats.winRate >= 50 ? "success" : stats.winRate >= 35 ? "warning" : "danger";
  const bgColorClass = winRateColor === "success" ? "bg-success" : winRateColor === "warning" ? "bg-warning" : "bg-danger";

  return (
    <Card isBlurred className="w-full h-full bg-background/60 dark:bg-default-100/50 flex flex-col">
      <CardHeader className="flex justify-between items-center pb-0 px-4 pt-4">
        <span className="font-bold text-sm text-primary">Overview</span>
        {/* Sparkline placed in header for quick context */}
        {recentGames.length > 0 && (
          <div className="flex gap-1 items-center">
            <span className="text-[10px] text-default-400 mr-1 uppercase tracking-wider font-semibold">Form</span>
            <div className="flex gap-0.5">
              {recentGames.map((game, i) => (
                <div
                  key={i}
                  className={`w-2 h-3 rounded-sm opacity-80 ${game.isWin ? 'bg-success' : 'bg-danger'}`}
                  title={game.isWin ? "Win" : "Loss"}
                />
              ))}
            </div>
          </div>
        )}
      </CardHeader>

      <CardBody className="p-4 grid grid-cols-12 gap-3 h-full items-stretch">
        {/* Left: Hero Win Rate (spans 4 cols on md, 12 on mobile) */}
        <div className="col-span-12 sm:col-span-4 flex flex-col items-center justify-center p-4 rounded-xl bg-default-100/30 border border-default-200/50 shadow-sm relative overflow-hidden">
          {/* Subtle background glow based on win rate */}
          <div className={`absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl opacity-20 ${bgColorClass}`}></div>

          <CircularProgress
            classNames={{
              svg: "w-24 h-24 drop-shadow-md",
              value: "text-2xl font-black text-foreground",
            }}
            value={stats.winRate}
            color={winRateColor}
            showValueLabel={true}
            valueLabel={`${stats.winRate.toFixed(0)}%`}
            strokeWidth={3}
          />
          <span className="text-xs text-default-500 font-semibold uppercase tracking-wider mt-3 text-center">Win Rate</span>
        </div>

        {/* Right: Butterfly Chart & Details (spans 8 cols) */}
        <div className="col-span-12 sm:col-span-8 flex flex-col gap-3">

          {/* Win/Loss Butterfly Chart */}
          <div className="flex flex-col grow justify-center p-3 rounded-xl bg-default-100/30 border border-default-200/50 min-h-[90px]">
            <ButterflyBarChart
              data={[{
                leftLabel: "Wins",
                leftValue: stats.wins,
                rightLabel: "Losses",
                rightValue: stats.losses,
                leftColor: "hsl(var(--heroui-success))",
                rightColor: "hsl(var(--heroui-danger))"
              }]}
            />
          </div>

          {/* Mini Bento Grid for other stats */}
          <div className="grid grid-cols-3 gap-3 grow">
            {/* Total Games */}
            <div className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-default-100/30 border border-default-200/50">
              <GameIcon className="w-5 h-5 text-default-400 mb-1" />
              <span className="text-lg md:text-xl font-bold leading-none">{stats.totalGames}</span>
              <span className="text-[9px] md:text-[10px] text-default-500 font-semibold uppercase text-center mt-1">Games</span>
            </div>

            {/* Current Streak */}
            <div className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border relative overflow-hidden group ${stats.winStreak >= 3 ? 'bg-warning/10 border-warning/30' : 'bg-default-100/30 border-default-200/50'}`}>
              {stats.winStreak >= 3 && (
                <div className="absolute inset-0 bg-warning/5 animate-pulse"></div>
              )}
              <FlameIcon className={`w-5 h-5 mb-1 ${stats.winStreak >= 3 ? 'text-warning fill-warning/20' : 'text-default-400'}`} />
              <span className={`text-lg md:text-xl font-bold leading-none ${stats.winStreak >= 3 ? 'text-warning drop-shadow-sm' : ''}`}>{stats.winStreak}</span>
              <span className={`text-[9px] md:text-[10px] font-semibold uppercase text-center mt-1 ${stats.winStreak >= 3 ? 'text-warning/80' : 'text-default-500'}`}>Streak</span>
            </div>

            {/* Best Streak */}
            <div className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-default-100/30 border border-default-200/50">
              <TrophyIcon className="w-5 h-5 text-primary mb-1" />
              <span className="text-lg md:text-xl font-bold leading-none text-primary">{stats.longestWinStreak}</span>
              <span className="text-[9px] md:text-[10px] text-primary/80 font-semibold uppercase text-center mt-1">Best</span>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
