"use client";

import { useEffect, useState, use, Suspense } from "react";
import { PlayerStat, PlayerAggregatedData } from "@/stats/playerStat";
import PlayerStatsView from "@/components/playerStats/playerStatsView";
import { Spinner } from "@heroui/react";

interface PlayerPageProps {
  params: Promise<{ name: string }>;
}

export default function PlayerPage({ params }: PlayerPageProps) {
  // Unwrap params using React.use()
  const { name } = use(params);
  const [data, setData] = useState<PlayerAggregatedData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const statService = new PlayerStat();
        const result = await statService.getStats(name);
        setData(result);
      } catch (e) {
        console.error("Failed to load player stats", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [name]);

  if (loading) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <Spinner size="lg" label="Loading Player Stats..." />
      </div>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <h1 className="text-2xl">No data found for player: {name}</h1>
      </div>
    );
  }

  return (
    <Suspense fallback={<Spinner size="lg" label="Loading Player Stats..." />}>
      <div className="container mx-auto p-4">
        <PlayerStatsView data={data} playerName={name} />
      </div>
    </Suspense>
  );
}
