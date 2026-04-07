import useSWR from 'swr';
import { Game } from '@/types';

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
