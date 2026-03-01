"use client";

import { TeamName } from "@/types";
import { Accordion, AccordionItem } from "@heroui/react";
import { useEffect, useState } from "react";
import Overview from "./components/overview";
import LoadingSpinner from "../loadingSpinner";
import HallOfFame from "./components/HallOfFame";
import PersonalBests from "./components/PersonalBests";
import GamesInRange from "./components/GamesInRange";
import { apiService } from "@/services/apiService";

export interface GameSummaryProps {
  team: TeamName;
}

export default function GameSummary({ team }: GameSummaryProps) {
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  const [allGameData, setAllGameData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(false);

  const loadStats = async () => {
    setLoading(true);
    setLoadingError(false);

    // Fetch the raw game array from the new API
    const url = `/api/team/${team}/games`;
    const data = await apiService.fetchWithCache<any[]>(url);

    if (!data) {
      setLoadingError(true);
      setLoading(false);
      return;
    }
    setAllGameData(data);
    setLoading(false);
  };

  useEffect(() => {
    loadStats();
  }, [team]);

  if (loading) {
    return (
      <LoadingSpinner />
    );
  }

  if (loadingError) {
    return (
      <div className="flex items-center justify-center w-full h-full p-5 mt-2">
        <h2 className="text-red-950 text-4xl text-shadow-md">Error loading stats</h2>
      </div>
    );
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
          <Overview team={team} />
        </AccordionItem>
        <AccordionItem key="games-in-range" title="Games in Range">
          <GamesInRange allGameData={allGameData} team={team} />
        </AccordionItem>
        <AccordionItem key="hall-of-fame" title="Hall of Fame">
          <HallOfFame team={team} />
        </AccordionItem>
        <AccordionItem key="personal-bests" title="Personal Bests">
          <PersonalBests team={team} />
        </AccordionItem>
      </Accordion>
    </div>
  );
}
