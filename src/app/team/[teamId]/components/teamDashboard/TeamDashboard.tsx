"use client";

import React, { useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button, Skeleton, Tabs, Tab } from '@heroui/react';
import { format, startOfWeek, endOfWeek, subWeeks, addWeeks, startOfMonth, endOfMonth, subMonths, addMonths, parseISO } from 'date-fns';
import { TeamOverview } from '@/types';
import { useTeamDashboardGames } from '@/hooks/useTeamDashboard';

import { TeamOverviewCard } from '@/components/dashboard/bento/team/TeamOverviewCard';
import { TeamCurrentFormCard } from '@/components/dashboard/bento/team/TeamCurrentFormCard';
import { TeamMatchLogCard } from '@/components/dashboard/bento/team/TeamMatchLogCard';
import { ActivityHeatmapCard } from '@/components/dashboard/bento/ActivityHeatmapCard';
import { TeamHallOfFameCard } from '@/components/dashboard/bento/team/TeamHallOfFameCard';
import { TeamPersonalBestsCard } from '@/components/dashboard/bento/team/TeamPersonalBestsCard';
import { TeamHeadToHeadCard } from '@/components/dashboard/bento/team/TeamHeadToHeadCard';
import { TeamKillStealerCard } from '@/components/dashboard/bento/team/TeamKillStealerCard';

export function TeamDashboard({ teamOverview, teamId }: { teamOverview: TeamOverview; teamId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateParam = searchParams.get('date');
  const viewType = searchParams.get('view') || 'all-time';

  const { start, end, periodRangeStr, isCurrentOrFuturePeriod } = useMemo(() => {
    if (viewType === 'all-time') {
      return { start: undefined, end: undefined, periodRangeStr: 'All Time', isCurrentOrFuturePeriod: true };
    }

    let baseDate = new Date();
    if (dateParam) {
      const parsed = parseISO(dateParam);
      if (!isNaN(parsed.getTime())) {
        baseDate = parsed;
      }
    }

    const s = viewType === 'monthly' ? startOfMonth(baseDate) : startOfWeek(baseDate, { weekStartsOn: 0 });
    const e = viewType === 'monthly' ? endOfMonth(baseDate) : endOfWeek(baseDate, { weekStartsOn: 0 });
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

  const { periodGames, isLoading, isError } = useTeamDashboardGames(teamId, start, end);

  const { prevStart, prevEnd } = useMemo(() => {
    if (viewType === 'all-time' || !start) {
      return { prevStart: undefined, prevEnd: undefined };
    }
    const s = new Date(start);
    const prevS = viewType === 'monthly' ? subMonths(s, 1) : subWeeks(s, 1);
    const prevE = viewType === 'monthly' ? endOfMonth(prevS) : endOfWeek(prevS, { weekStartsOn: 0 });
    return { prevStart: prevS.toISOString(), prevEnd: prevE.toISOString() };
  }, [start, viewType]);

  const { periodGames: previousPeriodGames } = useTeamDashboardGames(teamId, prevStart, prevEnd);

  const handlePrevPeriod = () => {
    if (!start || viewType === 'all-time') return;
    const prev = viewType === 'monthly'
      ? subMonths(startOfMonth(new Date(start)), 1)
      : subWeeks(startOfWeek(new Date(start), { weekStartsOn: 0 }), 1);

    const params = new URLSearchParams(searchParams.toString());
    params.set('date', format(prev, 'yyyy-MM-dd'));
    router.push(`?${params.toString()}`);
  };

  const handleNextPeriod = () => {
    if (!start || viewType === 'all-time') return;
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
    params.delete('date'); // Reset date when switching views
    router.push(`?${params.toString()}`);
  };

  if (isLoading) {
    return <TeamDashboardSkeleton />;
  }

  if (isError || !periodGames) {
    return <div className="text-center text-danger">Failed to load team dashboard data.</div>;
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-content1 shadow-sm rounded-xl p-4 md:p-6 backdrop-blur-md bg-opacity-70 dark:bg-opacity-50 border border-content3">
        <div className="flex items-center gap-6">
          <Tabs
            selectedKey={viewType}
            onSelectionChange={handleViewChange}
            size="sm"
            color="primary"
            variant="bordered"
          >
            <Tab key="all-time" title="All-Time" />
            <Tab key="monthly" title="Monthly" />
            <Tab key="weekly" title="Weekly" />
          </Tabs>
        </div>

        <div className="flex items-center mt-4 md:mt-0 min-h-[40px]">
          {viewType !== 'all-time' && (
            <div className="flex items-center gap-4">
              <Button isIconOnly variant="flat" onPress={handlePrevPeriod}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
              </Button>
              <div className="font-medium min-w-[150px] text-center">{periodRangeStr}</div>
              <Button isIconOnly variant="flat" onPress={handleNextPeriod} isDisabled={isCurrentOrFuturePeriod}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-min md:auto-rows-[180px]">
        {/* Row 1 & 2 */}
        <div className="col-span-1 md:col-span-2 md:row-span-2 flex flex-col">
          <TeamOverviewCard periodGames={periodGames} />
        </div>
        <div className="col-span-1 md:col-span-2 md:row-span-2 flex flex-col">
          <TeamCurrentFormCard 
            periodGames={periodGames} 
            previousPeriodGames={previousPeriodGames}
            teamOverview={teamOverview} 
            viewType={viewType}
          />
        </div>

        {/* Dynamic Space depending on view */}
        {viewType !== 'all-time' ? (
          <>
            <div className="col-span-1 md:col-span-2 flex flex-col">
              <TeamKillStealerCard periodGames={periodGames} players={teamOverview.players} />
            </div>
            <div className="col-span-1 md:row-span-2 flex flex-col h-full">
              <TeamMatchLogCard periodGames={periodGames} />
            </div>
            <div className="col-span-1 md:row-span-2 flex flex-col">
              <ActivityHeatmapCard periodGames={periodGames} start={start as string} end={end as string} />
            </div>
          </>
        ) : (
          <>
            <div className="col-span-1 flex flex-col">
              <TeamKillStealerCard periodGames={periodGames} players={teamOverview.players} />
            </div>
            <div className="col-span-1 flex flex-col h-full">
              <TeamMatchLogCard periodGames={periodGames} />
            </div>
          </>
        )}

        {/* Row 3/4 */}
        <div className="col-span-1 md:col-span-2 md:row-span-2 flex flex-col">
          <TeamHeadToHeadCard periodGames={periodGames} players={teamOverview.players} />
        </div>
        <div className="col-span-1 md:col-span-2 md:row-span-2 flex flex-col">
          <TeamHallOfFameCard periodGames={periodGames} players={teamOverview.players} />
        </div>
        <div className="col-span-1 md:col-span-2 md:row-span-2 flex flex-col">
          <TeamPersonalBestsCard periodGames={periodGames} players={teamOverview.players} />
        </div>
      </div>
    </div>
  );
}

function TeamDashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full mt-4">
      <Skeleton className="h-[88px] w-full rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[160px]">
        <Skeleton className="col-span-1 md:col-span-2 md:row-span-2 rounded-xl" />
        <Skeleton className="col-span-1 md:col-span-2 rounded-xl" />
        <Skeleton className="col-span-1 md:row-span-2 rounded-xl" />
        <Skeleton className="col-span-1 md:row-span-2 rounded-xl" />
        <Skeleton className="col-span-1 md:col-span-2 rounded-xl" />
      </div>
    </div>
  );
}
