import useSWR from 'swr';
import { Game } from '@/types';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('An error occurred while fetching the data.');
  }
  return res.json();
};

export interface HeatmapDate {
  date: string;
  count: number;
}

export interface DashboardPayload {
  periodGames: Game[];
  heatmapDates: HeatmapDate[];
}

export function useDashboard(playerId: string | null, startDate: string, endDate: string) {
  const url = playerId ? `/api/player/${playerId}/dashboard?startDate=${startDate}&endDate=${endDate}` : null;
  
  const { data, error, isLoading } = useSWR<DashboardPayload>(url, fetcher);

  return {
    dashboardData: data,
    isLoading,
    isError: error
  };
}
