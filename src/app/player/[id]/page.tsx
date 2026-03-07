"use client";

import { use, Suspense } from "react";
import PlayerStatsView from "./components/playerStatsView";
import { Spinner } from "@heroui/react";
import { usePlayer } from "@/hooks/usePlayer";

interface PlayerPageProps {
  params: Promise<{ id: string }>;
}

export default function PlayerPage({ params }: PlayerPageProps) {
  // Unwrap params using React.use()
  const { id } = use(params);

  const { player, isLoading, isError } = usePlayer(id);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <Spinner size="lg" label="Loading Player Stats..." />
      </div>
    );
  }

  if (isError || !player) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <h1 className="text-2xl text-danger">No data found for player: {id}</h1>
      </div>
    );
  }

  return (
    <Suspense fallback={<Spinner size="lg" label="Loading Player Stats..." />}>
      <div className="container mx-auto p-4">
        <PlayerStatsView player={player} />
      </div>
    </Suspense>
  );
}
