const CACHE_DURATION = 24 * 60 * 60 * 1000; // 1 day in milliseconds

interface CacheItem<T> {
  timestamp: number;
  data: T;
}

async function fetchWithCache<T>(url: string): Promise<T | null> {
  const cacheKey = `cache_${url}`;

  // 1. Try to get from cache
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const cachedItemString = localStorage.getItem(cacheKey);
      if (cachedItemString) {
        const cachedItem: CacheItem<T> = JSON.parse(cachedItemString);
        const now = new Date().getTime();

        if (now - cachedItem.timestamp < CACHE_DURATION) {
          console.log("Using cached data");
          return cachedItem.data;
        }
        // remove if stale
        localStorage.removeItem(cacheKey);
      }
    }
  } catch (error) {
    console.error("Error reading from cache", error);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(cacheKey);
    }
  }

  // 2. Fetch from network if not in cache or stale
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }
    const data: T = await response.json();

    // 3. Store in cache
    if (typeof window !== 'undefined' && window.localStorage) {
      const cacheItem: CacheItem<T> = { timestamp: new Date().getTime(), data };
      localStorage.setItem(cacheKey, JSON.stringify(cacheItem));
    }
    return data;
  } catch (error) {
    console.error("Error fetching data", error);
    return null;
  }
}

export const apiService = {
  fetchWithCache,
};