"use client";

import React from 'react';
import { Button, Skeleton, Tabs, Tab } from '@heroui/react';
import { TeamOverview } from '@/types';
import { TeamDashboardProvider, useTeamDashboard } from '@/contexts/TeamDashboardContext';

import { TeamOverviewCard } from '@/components/dashboard/bento/team/TeamOverviewCard';
import { TeamCurrentFormCard } from '@/components/dashboard/bento/team/TeamCurrentFormCard';
import { TeamMatchLogCard } from '@/components/dashboard/bento/team/TeamMatchLogCard';
import { ActivityHeatmapCard } from '@/components/dashboard/bento/ActivityHeatmapCard';
import { TeamHallOfFameCard } from '@/components/dashboard/bento/team/TeamHallOfFameCard';
import { TeamPersonalBestsCard } from '@/components/dashboard/bento/team/TeamPersonalBestsCard';
import { TeamHeadToHeadCard } from '@/components/dashboard/bento/team/TeamHeadToHeadCard';
import { TeamKillStealerCard } from '@/components/dashboard/bento/team/TeamKillStealerCard';

import { PeriodSelector } from './PeriodSelector';

export function TeamDashboard({ teamOverview, teamId }: { teamOverview: TeamOverview; teamId: string }) {
  return (
    <TeamDashboardProvider teamId={teamId} teamOverview={teamOverview}>
      <TeamDashboardContent />
    </TeamDashboardProvider>
  );
}

function TeamDashboardContent() {
  const {
    viewType,
    isCurrentOrFuturePeriod,
    start,
    end,
    periodGames,
    isLoading,
    isError,
    handlePrevPeriod,
    handleNextPeriod,
    handleViewChange
  } = useTeamDashboard();

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
            <Tab key="session" title="Session" />
          </Tabs>
        </div>

        <div className="flex items-center mt-4 md:mt-0 min-h-[40px]">
          {viewType !== 'all-time' && (
            <div className="flex items-center gap-4">
              <Button isIconOnly variant="flat" onPress={handlePrevPeriod}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
              </Button>
              <PeriodSelector />
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
          <TeamOverviewCard />
        </div>
        <div className="col-span-1 md:col-span-2 md:row-span-2 flex flex-col">
          <TeamCurrentFormCard />
        </div>

        {/* Dynamic Space depending on view */}
        {viewType !== 'all-time' ? (
          <>
            <div className="col-span-1 md:col-span-2 flex flex-col">
              <TeamKillStealerCard />
            </div>
            <div className={`col-span-1 ${viewType === 'session' ? 'md:col-span-2' : ''} md:row-span-2 flex flex-col h-full`}>
              <TeamMatchLogCard />
            </div>
            {viewType !== 'session' && (
              <div className="col-span-1 md:row-span-2 flex flex-col">
                <ActivityHeatmapCard periodGames={periodGames} start={start as string} end={end as string} />
              </div>
            )}
          </>
        ) : (
          <>
            <div className="col-span-1 flex flex-col">
              <TeamKillStealerCard />
            </div>
            <div className="col-span-1 flex flex-col h-full">
              <TeamMatchLogCard />
            </div>
          </>
        )}

        {/* Row 3/4 */}
        <div className="col-span-1 md:col-span-2 md:row-span-2 flex flex-col">
          <TeamHeadToHeadCard />
        </div>
        <div className="col-span-1 md:col-span-2 md:row-span-2 flex flex-col">
          <TeamHallOfFameCard />
        </div>
        <div className="col-span-1 md:col-span-2 md:row-span-2 flex flex-col">
          <TeamPersonalBestsCard />
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
