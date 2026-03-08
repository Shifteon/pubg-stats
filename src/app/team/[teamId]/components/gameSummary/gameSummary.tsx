"use client";

import { Accordion, AccordionItem } from "@heroui/react";
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
    <div className="w-full flex flex-col items-center mt-4">
      <Accordion
        selectionMode="multiple"
        className="w-full mt-4"
        defaultExpandedKeys="all"
        variant="bordered"
      >
        <AccordionItem key="overview" title="Overview">
          <Overview
            totalGames={teamOverview.totalGames}
            wins={teamOverview.totalWins}
            losses={teamOverview.totalLosses}
            winRate={teamOverview.winRate}
            winStreak={teamOverview.winStreak}
            longestWinStreak={teamOverview.longestWinStreak}
          />
        </AccordionItem>
        <AccordionItem key="hall-of-fame" title="Hall of Fame">
          <HallOfFame hallOfFame={teamOverview.hallOfFame} players={teamOverview.players} teamId={teamId} />
        </AccordionItem>
        <AccordionItem key="personal-bests" title="Personal Bests">
          <PersonalBests personalBests={teamOverview.teamPersonalBests} players={teamOverview.players} teamId={teamId} />
        </AccordionItem>
      </Accordion>
    </div>
  );
}
