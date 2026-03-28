"use client";

import React, { useMemo } from 'react';
import { Player } from '@/types';
import { useDashboard } from '@/hooks/useDashboard';
import { useSearchParams, useRouter } from 'next/navigation';
import { Chip, Button, Skeleton } from '@heroui/react';
import { format, startOfWeek, endOfWeek, subWeeks, addWeeks, parseISO } from 'date-fns';

// Import newly refactored bento components
import { WeeklyTrendsCard } from './bento/WeeklyTrendsCard';
import { ClutchScoreCard } from './bento/ClutchScoreCard';
import { RivalryCard } from './bento/RivalryCard';
import { ActivityHeatmapCard } from './bento/ActivityHeatmapCard';
import { SquadSynergyCard } from './bento/SquadSynergyCard';
import { MatchLogCard } from './bento/MatchLogCard';
import { DynamicRoleCard } from './bento/DynamicRoleCard';

export default function Dashboard({ player }: { player: Player }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const weekParam = searchParams.get('week');

  const { start, end, weekRangeStr } = useMemo(() => {
    let baseDate = new Date();
    if (weekParam) {
      const parsed = parseISO(weekParam);
      if (!isNaN(parsed.getTime())) {
        baseDate = parsed;
      }
    }

    const s = startOfWeek(baseDate, { weekStartsOn: 0 }); // Sunday
    const e = endOfWeek(baseDate, { weekStartsOn: 0 }); // Saturday
    return {
      start: s.toISOString(),
      end: e.toISOString(),
      weekRangeStr: `${format(s, 'MMM d')} - ${format(e, 'MMM d, yyyy')}`,
      baseDate: s
    };
  }, [weekParam]);

  const { dashboardData, isLoading, isError } = useDashboard(player.id, start, end);

  const handlePrevWeek = () => {
    const s = startOfWeek(new Date(start), { weekStartsOn: 0 });
    const prev = subWeeks(s, 1);
    router.push(`?week=${format(prev, 'yyyy-MM-dd')}`);
  };

  const handleNextWeek = () => {
    const s = startOfWeek(new Date(start), { weekStartsOn: 0 });
    const next = addWeeks(s, 1);
    router.push(`?week=${format(next, 'yyyy-MM-dd')}`);
  };

  if (isLoading) {
    return <DashboardLoadingSkeleton />;
  }

  if (isError || !dashboardData) {
    return <div className="text-center text-danger">Failed to load dashboard data.</div>;
  }

  const { weekGames, currentWinStreak, heatmapDates } = dashboardData;

  const lifetime = player.playerAverages;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      {/* Header & Week Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-content1 shadow-sm rounded-xl p-4 md:p-6 backdrop-blur-md bg-opacity-70 dark:bg-opacity-50 border border-content3">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Welcome Back, {player.name}</h2>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-default-500">Current Win Streak:</span>
            <Chip color="success" variant="flat" size="sm" className="font-bold">
              {currentWinStreak}
            </Chip>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <Button isIconOnly variant="flat" onPress={handlePrevWeek}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          </Button>
          <div className="font-medium min-w-[150px] text-center">{weekRangeStr}</div>
          <Button isIconOnly variant="flat" onPress={handleNextWeek}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
          </Button>
        </div>
      </div>

      {/* Bento Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-min md:auto-rows-[180px]">
        <WeeklyTrendsCard weekGames={weekGames} playerId={player.id} lifetime={lifetime} />
        <ClutchScoreCard weekGames={weekGames} playerId={player.id} />
        <RivalryCard weekGames={weekGames} playerId={player.id} />
        <ActivityHeatmapCard weekGames={weekGames} start={start} end={end} />
        <SquadSynergyCard weekGames={weekGames} playerId={player.id} />
        <MatchLogCard weekGames={weekGames} playerId={player.id} />
        <DynamicRoleCard weekGames={weekGames} playerId={player.id} />
      </div>
    </div>
  );
}

function DashboardLoadingSkeleton() {
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      <Skeleton className="h-[88px] w-full rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[160px]">
        <Skeleton className="col-span-1 md:col-span-2 md:row-span-2 rounded-xl" />
        <Skeleton className="col-span-1 border rounded-xl" />
        <Skeleton className="col-span-1 rounded-xl" />
        <Skeleton className="col-span-1 md:col-span-2 rounded-xl" />
      </div>
    </div>
  );
}
