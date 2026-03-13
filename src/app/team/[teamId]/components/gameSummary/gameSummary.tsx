"use client";

import { Divider } from "@heroui/react";
import Overview from "./components/overview";
import LoadingSpinner from "../../../../../components/loadingSpinner";
import HallOfFame from "./components/HallOfFame";
import PersonalBests from "./components/PersonalBests";
import { useTeamOverview } from "../../../../../hooks/useTeam";

export interface GameSummaryProps {
  teamId: string;
}

export default function GameSummary({ teamId }: GameSummaryProps) {
  const { teamOverview, isLoading, isError } = useTeamOverview(teamId);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center w-full h-full p-5 mt-2">
        <h2 className="text-red-950 text-4xl text-shadow-md">Error loading stats</h2>
      </div>
    );
  }

  // Ensure content is not rendered prematurely
  if (!teamOverview || teamOverview.totalGames === 0) {
    return null;
  }

  return (
    <div className="w-full flex flex-col items-center mt-6 space-y-8">
      <section className="w-full">
        <h2 className="text-2xl font-bold mb-4 ml-1">Overview</h2>
        <Overview
          totalGames={teamOverview.totalGames}
          wins={teamOverview.totalWins}
          losses={teamOverview.totalLosses}
          winRate={teamOverview.winRate}
          winStreak={teamOverview.winStreak}
          longestWinStreak={teamOverview.longestWinStreak}
        />
      </section>

      <Divider />

      <section className="w-full">
        <h2 className="text-2xl font-bold mb-4 ml-1">Hall of Fame</h2>
        <HallOfFame hallOfFame={teamOverview.hallOfFame} players={teamOverview.players} teamId={teamId} />
      </section>

      <Divider />

      <section className="w-full">
        <h2 className="text-2xl font-bold mb-4 ml-1">Personal Bests</h2>
        <PersonalBests personalBests={teamOverview.teamPersonalBests} players={teamOverview.players} teamId={teamId} />
      </section>
    </div>
  );
}
