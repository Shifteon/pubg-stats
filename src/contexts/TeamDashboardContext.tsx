"use client";

import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { format, startOfWeek, endOfWeek, subWeeks, addWeeks, startOfMonth, endOfMonth, subMonths, addMonths, parseISO } from 'date-fns';
import { Game, TeamOverview, TeamHallOfFame, TeamPersonalBest } from '@/types';
import { useTeamDashboardGames } from '@/hooks/useTeamDashboard';
import { 
  getTeamOverviewStats, 
  getTeamCurrentForm, 
  getTeamHallOfFame, 
  getTeamPersonalBests, 
  getTeamKillStealStats 
} from '@/components/dashboard/bento/team/TeamDashboard.utils';
import { getPeriodTrends } from '@/components/dashboard/Dashboard.utils';

interface PlayerTrend {
  player: TeamOverview['players'][0];
  current: ReturnType<typeof getPeriodTrends>;
  past: ReturnType<typeof getPeriodTrends> | null;
}

interface TeamDashboardContextValue {
  teamId: string;
  teamOverview: TeamOverview;
  viewType: string;
  selectedDate: string | null;
  periodRangeStr: string;
  isCurrentOrFuturePeriod: boolean;
  start: string | undefined;
  end: string | undefined;
  
  periodGames: Game[];
  previousPeriodGames: Game[];
  isLoading: boolean;
  isError: boolean;

  // Memoized Derived Stats
  currentOverview: ReturnType<typeof getTeamOverviewStats>;
  pastOverview: ReturnType<typeof getTeamOverviewStats> | null;
  currentForm: ReturnType<typeof getTeamCurrentForm>;
  pastForm: ReturnType<typeof getTeamCurrentForm> | null;
  playerTrends: PlayerTrend[];
  hallOfFame: TeamHallOfFame;
  personalBests: TeamPersonalBest;
  killStealStats: ReturnType<typeof getTeamKillStealStats>;

  // Actions
  handlePrevPeriod: () => void;
  handleNextPeriod: () => void;
  handleViewChange: (key: React.Key) => void;
}

const TeamDashboardContext = createContext<TeamDashboardContextValue | undefined>(undefined);

export function TeamDashboardProvider({ 
  children, 
  teamId, 
  teamOverview 
}: { 
  children: ReactNode; 
  teamId: string; 
  teamOverview: TeamOverview; 
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const dateParam = searchParams.get('date');
  const viewType = searchParams.get('view') || 'all-time';

  // --- Date Logic ---
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

  const { prevStart, prevEnd } = useMemo(() => {
    if (viewType === 'all-time' || !start) {
      return { prevStart: undefined, prevEnd: undefined };
    }
    const s = new Date(start);
    const prevS = viewType === 'monthly' ? subMonths(s, 1) : subWeeks(s, 1);
    const prevE = viewType === 'monthly' ? endOfMonth(prevS) : endOfWeek(prevS, { weekStartsOn: 0 });
    return { prevStart: prevS.toISOString(), prevEnd: prevE.toISOString() };
  }, [start, viewType]);

  // --- Data Fetching ---
  const { periodGames, isLoading, isError } = useTeamDashboardGames(teamId, start, end);
  const { periodGames: previousPeriodGames } = useTeamDashboardGames(teamId, prevStart, prevEnd);

  // --- Derived Stats (Memoized) ---
  const safePeriodGames = periodGames || [];
  const safePrevGames = previousPeriodGames || [];

  const currentOverview = useMemo(() => getTeamOverviewStats(safePeriodGames), [safePeriodGames]);
  const pastOverview = useMemo(() => safePrevGames.length ? getTeamOverviewStats(safePrevGames) : null, [safePrevGames]);

  const currentForm = useMemo(() => getTeamCurrentForm(safePeriodGames), [safePeriodGames]);
  const pastForm = useMemo(() => safePrevGames.length ? getTeamCurrentForm(safePrevGames) : null, [safePrevGames]);

  const hallOfFame = useMemo(() => getTeamHallOfFame(safePeriodGames, teamOverview.players), [safePeriodGames, teamOverview.players]);
  const personalBests = useMemo(() => getTeamPersonalBests(safePeriodGames, teamOverview.players), [safePeriodGames, teamOverview.players]);
  const killStealStats = useMemo(() => getTeamKillStealStats(safePeriodGames, teamOverview.players), [safePeriodGames, teamOverview.players]);

  const playerTrends = useMemo<PlayerTrend[]>(() => {
    return teamOverview.players.map(player => {
      const current = getPeriodTrends(safePeriodGames, player.id);
      const past = safePrevGames.length ? getPeriodTrends(safePrevGames, player.id) : null;
      return { player, current, past };
    });
  }, [teamOverview.players, safePeriodGames, safePrevGames]);

  // --- Navigation Actions ---
  const createQueryString = (name: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null) {
      params.delete(name);
    } else {
      params.set(name, value);
    }
    return params.toString();
  };

  const handlePrevPeriod = () => {
    if (!start || viewType === 'all-time') return;
    const prev = viewType === 'monthly'
      ? subMonths(startOfMonth(new Date(start)), 1)
      : subWeeks(startOfWeek(new Date(start), { weekStartsOn: 0 }), 1);

    router.push(`${pathname}?${createQueryString('date', format(prev, 'yyyy-MM-dd'))}`);
  };

  const handleNextPeriod = () => {
    if (!start || viewType === 'all-time') return;
    const next = viewType === 'monthly'
      ? addMonths(startOfMonth(new Date(start)), 1)
      : addWeeks(startOfWeek(new Date(start), { weekStartsOn: 0 }), 1);

    router.push(`${pathname}?${createQueryString('date', format(next, 'yyyy-MM-dd'))}`);
  };

  const handleViewChange = (key: React.Key) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', key.toString());
    params.delete('date'); // Reset date when switching views
    router.push(`${pathname}?${params.toString()}`);
  };

  const value: TeamDashboardContextValue = {
    teamId,
    teamOverview,
    viewType,
    selectedDate: dateParam,
    periodRangeStr,
    isCurrentOrFuturePeriod,
    start,
    end,
    periodGames: safePeriodGames,
    previousPeriodGames: safePrevGames,
    isLoading,
    isError,
    
    currentOverview,
    pastOverview,
    currentForm,
    pastForm,
    playerTrends,
    hallOfFame,
    personalBests,
    killStealStats,

    handlePrevPeriod,
    handleNextPeriod,
    handleViewChange,
  };

  return (
    <TeamDashboardContext.Provider value={value}>
      {children}
    </TeamDashboardContext.Provider>
  );
}

export function useTeamDashboard() {
  const context = useContext(TeamDashboardContext);
  if (context === undefined) {
    throw new Error('useTeamDashboard must be used within a TeamDashboardProvider');
  }
  return context;
}
