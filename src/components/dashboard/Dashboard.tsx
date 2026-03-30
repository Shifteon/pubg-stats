"use client";

import React, { useMemo } from 'react';
import { Player } from '@/types';
import { useDashboard } from '@/hooks/useDashboard';
import { useSearchParams, useRouter } from 'next/navigation';
import { Chip, Button, Skeleton, Tabs, Tab } from '@heroui/react';
import { format, startOfWeek, endOfWeek, subWeeks, addWeeks, startOfMonth, endOfMonth, subMonths, addMonths, parseISO } from 'date-fns';

// Import newly refactored bento components
import { CurrentFormCard } from './bento/CurrentFormCard';
import { ClutchScoreCard } from './bento/ClutchScoreCard';
import { RivalryCard } from './bento/RivalryCard';
import { ActivityHeatmapCard } from './bento/ActivityHeatmapCard';
import { SquadSynergyCard } from './bento/SquadSynergyCard';
import { MatchLogCard } from './bento/MatchLogCard';
import { DynamicRoleCard } from './bento/DynamicRoleCard';
import { capitalize } from '@/utils/stringUtils';

export default function Dashboard({ player }: { player: Player }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateParam = searchParams.get('date');
  const viewType = searchParams.get('view') || 'weekly';

  const { start, end, periodRangeStr, isCurrentOrFuturePeriod } = useMemo(() => {
    let baseDate = new Date();
    if (dateParam) {
      const parsed = parseISO(dateParam);
      if (!isNaN(parsed.getTime())) {
        baseDate = parsed;
      }
    }

    const s = viewType === 'monthly' ? startOfMonth(baseDate) : startOfWeek(baseDate, { weekStartsOn: 0 }); // Sunday
    const e = viewType === 'monthly' ? endOfMonth(baseDate) : endOfWeek(baseDate, { weekStartsOn: 0 }); // Saturday
    const currentPeriodStart = viewType === 'monthly' ? startOfMonth(new Date()) : startOfWeek(new Date(), { weekStartsOn: 0 });

    return {
      start: s.toISOString(),
      end: e.toISOString(),
      periodRangeStr: viewType === 'monthly'
        ? format(s, 'MMMM yyyy')
        : `${format(s, 'MMM d')} - ${format(e, 'MMM d, yyyy')}`,
      isCurrentOrFuturePeriod: s.getTime() >= currentPeriodStart.getTime()
    };
  }, [dateParam, viewType]);

  const { dashboardData, isLoading, isError } = useDashboard(player.id, start, end);

  const handlePrevPeriod = () => {
    const prev = viewType === 'monthly'
      ? subMonths(startOfMonth(new Date(start)), 1)
      : subWeeks(startOfWeek(new Date(start), { weekStartsOn: 0 }), 1);

    const params = new URLSearchParams(searchParams.toString());
    params.set('date', format(prev, 'yyyy-MM-dd'));
    router.push(`?${params.toString()}`);
  };

  const handleNextPeriod = () => {
    const next = viewType === 'monthly'
      ? addMonths(startOfMonth(new Date(start)), 1)
      : addWeeks(startOfWeek(new Date(start), { weekStartsOn: 0 }), 1);

    const params = new URLSearchParams(searchParams.toString());
    params.set('date', format(next, 'yyyy-MM-dd'));
    router.push(`?${params.toString()}`);
  };

  const handleViewChange = (key: React.Key) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', key.toString());
    router.push(`?${params.toString()}`);
  };

  if (isLoading) {
    return <DashboardLoadingSkeleton />;
  }

  if (isError || !dashboardData) {
    return <div className="text-center text-danger">Failed to load dashboard data.</div>;
  }

  const { periodGames } = dashboardData;

  const lifetime = player.playerAverages;

  const currentWinStreak = player.winStreak || 0;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      {/* Header & Week Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-content1 shadow-sm rounded-xl p-4 md:p-6 backdrop-blur-md bg-opacity-70 dark:bg-opacity-50 border border-content3">
        <div className="flex items-center gap-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Welcome Back, {capitalize(player.name)}</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-default-500">Current Win Streak:</span>
              <Chip color="success" variant="flat" size="sm" className="font-bold">
                {currentWinStreak}
              </Chip>
            </div>
          </div>
          <div className="hidden md:block border-l border-divider h-12 ml-4 pl-6">
            <Tabs
              selectedKey={viewType}
              onSelectionChange={handleViewChange}
              size="sm"
              color="primary"
              variant="bordered"
            >
              <Tab key="weekly" title="Weekly" />
              <Tab key="monthly" title="Monthly" />
            </Tabs>
          </div>
        </div>

        <div className="flex flex-col items-center md:items-end gap-3 mt-4 md:mt-0">
          <div className="block md:hidden">
            <Tabs
              selectedKey={viewType}
              onSelectionChange={handleViewChange}
              size="sm"
              color="primary"
              variant="bordered"
            >
              <Tab key="weekly" title="Weekly" />
              <Tab key="monthly" title="Monthly" />
            </Tabs>
          </div>
          <div className="flex items-center gap-4">
            <Button isIconOnly variant="flat" onPress={handlePrevPeriod}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            </Button>
            <div className="font-medium min-w-[150px] text-center">{periodRangeStr}</div>
            <Button isIconOnly variant="flat" onPress={handleNextPeriod} isDisabled={isCurrentOrFuturePeriod}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
            </Button>
          </div>
        </div>
      </div>

      {/* Bento Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-min md:auto-rows-[180px]">
        <div className="col-span-1 md:col-span-2 md:row-span-2 flex flex-col">
          <CurrentFormCard periodGames={periodGames} playerId={player.id} lifetime={lifetime} lifetimeWinRate={player.winRate} />
        </div>
        <div className="col-span-1 md:row-span-2 flex flex-col">
          <ActivityHeatmapCard periodGames={periodGames} start={start} end={end} />
        </div>
        <div className="col-span-1 flex flex-col">
          <ClutchScoreCard periodGames={periodGames} playerId={player.id} />
        </div>
        <div className="col-span-1 flex flex-col">
          <RivalryCard periodGames={periodGames} playerId={player.id} />
        </div>
        <div className="col-span-1 md:col-span-2 flex flex-col">
          <SquadSynergyCard periodGames={periodGames} playerId={player.id} />
        </div>
        <div className="col-span-1 md:col-span-2 md:row-span-2 flex flex-col h-full">
          <MatchLogCard periodGames={periodGames} playerId={player.id} />
        </div>
        <div className="col-span-1 md:col-span-2 flex flex-col">
          <DynamicRoleCard periodGames={periodGames} playerId={player.id} />
        </div>
      </div>
    </div>
  );
}

export function DashboardLoadingSkeleton() {
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
