"use client";

import { Link, Button } from "@heroui/react";
import { usePlayersList, usePlayer } from "@/hooks/usePlayer";
import { useUser } from "@/contexts/UserContext";
import Dashboard from "@/components/dashboard/Dashboard";

export default function HomeComponent() {
  const { playersList, isLoading: playersLoading } = usePlayersList();
  const { user, isLoading: userLoading } = useUser();

  console.log("user", user);

  const players = playersList || [];

  const currentPlayerMetadata = user ? players.find(p => p.userId === user.id) : null;
  const { player: fullPlayer, isLoading: fullPlayerLoading } = usePlayer(currentPlayerMetadata?.id || null);

  const isLoading = playersLoading || userLoading || (currentPlayerMetadata && fullPlayerLoading);

  if (!userLoading && !user) {
    return (
      <div className="mt-10 mx-4 lg:mx-20">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-4">PUBG Stats Tracker</h1>
          <p className="text-xl text-default-500 max-w-2xl mx-auto mb-8">
            Welcome to the PUBG Stats Tracker! Please log in or sign up to view detailed performance metrics, game summaries, and
            player comparisons.
          </p>
          <Button as={Link} href="/login" color="primary" size="lg" variant="shadow">
            Log in or Sign up
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-10 mx-4 lg:mx-20">
      {fullPlayer ? (
        <div className="mb-12">
          <Dashboard player={fullPlayer} />
        </div>
      ) : (
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-4">PUBG Stats Tracker</h1>
          <p className="text-xl text-default-500 max-w-2xl mx-auto">
            Welcome to the PUBG Stats Tracker! View detailed performance metrics, game summaries, and
            player comparisons across different team combinations.
          </p>
        </div>
      )}
    </div>
  );
}
