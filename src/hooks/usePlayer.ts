import useSWR from 'swr';
import { Player, Players } from '@/types';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('An error occurred while fetching the data.');
  }
  return res.json();
};

const multiFetcher = async (urls: string[]) => {
  return Promise.all(urls.map(fetcher));
};

export function usePlayer(id: string | null) {
  const { data, error, isLoading } = useSWR<Player>(
    id ? `/api/player/${id}` : null,
    fetcher
  );

  return {
    player: data,
    isLoading,
    isError: error
  };
}

export function usePlayersList() {
  const { data, error, isLoading } = useSWR<Players>(
    '/api/player',
    fetcher
  );

  return {
    playersList: data,
    isLoading,
    isError: error
  };
}

// Accepts an array of player IDs to fetch their full stats concurrently
export function usePlayers(ids: string[]) {
  // We use the array of URLs as the SWR key. 
  // SWR will pass this array to the multiFetcher.
  const urls = ids.length > 0 ? ids.map(id => `/api/player/${id}`) : null;

  const { data, error, isLoading } = useSWR<Player[]>(
    urls,
    multiFetcher
  );

  return {
    players: data || [],
    isLoading,
    isError: error
  };
}
