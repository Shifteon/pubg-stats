"use client";

import { use, Suspense } from "react";
import PlayerStatsView from "@/components/playerStats/playerStatsView";
import { Spinner } from "@heroui/react";
import { usePlayerStatsData } from "@/hooks/usePlayerStatsData";

interface PlayerPageProps {
  params: Promise<{ name: string }>;
}

export default function PlayerPage({ params }: PlayerPageProps) {
  // Unwrap params using React.use()
  const { name } = use(params);

  const stats = usePlayerStatsData(name);

  if (stats.loading) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <Spinner size="lg" label="Loading Player Stats..." />
      </div>
    );
  }

  if (!stats.data || stats.data.data.length === 0) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <h1 className="text-2xl">No data found for player: {name}</h1>
      </div>
    );
  }

  return (
    <Suspense fallback={<Spinner size="lg" label="Loading Player Stats..." />}>
      <div className="container mx-auto p-4">
        <PlayerStatsView stats={stats} playerName={name} />
      </div>
    </Suspense>
  );
}
