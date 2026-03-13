import useSWR from 'swr';
import { TeamStatTimelinePoint, TeamOverview, Game, Teams } from '@/types';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('An error occurred while fetching the data.');
  }
  return res.json();
};

export function useTeamStatsTimeline(teamId: string) {
  const { data, error, isLoading } = useSWR<TeamStatTimelinePoint[]>(
    `/api/team/${teamId}/new/stats`,
    fetcher
  );

  return {
    teamStatsTimeline: data,
    isLoading,
    isError: error
  };
}

export function useTeamGames(teamId: string) {
  const { data, error, isLoading, mutate } = useSWR<Game[]>(`/api/team/${teamId}/new/games`, fetcher);

  return {
    teamGames: data,
    isLoading,
    isError: error,
    mutate
  };
}

export function useTeamOverview(teamId: string) {
  const { data, error, isLoading } = useSWR<TeamOverview>(`/api/team/${teamId}/new/overview`, fetcher);

  return {
    teamOverview: data,
    isLoading,
    isError: error
  };
}

export function useTeamGame(teamId: string | undefined, gameId: string | null) {
  const shouldFetch = teamId && gameId;
  const { data, error, isLoading, mutate } = useSWR<Game>(
    shouldFetch ? `/api/team/${teamId}/new/game/${gameId}` : null,
    fetcher
  );

  return {
    game: data,
    isLoading,
    isError: error,
    mutate
  };
}

export function useTeamsList() {
  const { data, error, isLoading } = useSWR<Teams>(
    '/api/team',
    fetcher
  );

  return {
    teamsList: data,
    isLoading,
    isError: error
  };
}
