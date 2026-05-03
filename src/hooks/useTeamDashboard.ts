import useSWR from 'swr';
import { Game } from '@/types';
import { useMemo } from 'react';
import { format } from 'date-fns';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('An error occurred while fetching the data.');
  }
  return res.json();
};

export function useTeamDashboardGames(teamId: string | null, startDate?: string, endDate?: string) {
  let url = teamId ? `/api/team/${teamId}/new/games` : null;
  
  if (url && startDate && endDate) {
    url += `?startDate=${startDate}&endDate=${endDate}`;
  }

  const { data, error, isLoading } = useSWR<Game[]>(url, fetcher);

  return {
    periodGames: data,
    isLoading,
    isError: error
  };
}

export function useTeamSessions(teamId: string | null) {
  const url = teamId ? `/api/team/${teamId}/sessions` : null;
  const { data, error, isLoading } = useSWR<string[]>(url, fetcher);

  const sessions = useMemo(() => {
    if (!data) return [];
    const dates = new Set<string>();
    data.forEach(timestamp => {
      dates.add(format(new Date(timestamp), 'yyyy-MM-dd'));
    });
    return Array.from(dates);
  }, [data]);

  return {
    sessions,
    isLoading,
    isError: error
  };
}
