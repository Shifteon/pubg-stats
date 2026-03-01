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
  const [totalGamesCount, setTotalGamesCount] = useState<number>(0);
  // TODO: I am curious about using hooks. If we have a custom hook that all the components utilize, can we check if any of them are still loading in this component?
  // Follow up question, do we care if they are loading? Or can we just let them load in their own components?
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadStats = async () => {
      setLoading(true);
      setLoadingError(false);

      // TODO: Do we really need to do this? Can't we just not load the sliders until the api call in GamesInRange returns?
      const url = `/api/team/${team}/games`;
      const data = await apiService.fetchWithCache<unknown[]>(url);

      if (isMounted) {
        if (!data) {
          setLoadingError(true);
        } else {
          setTotalGamesCount(data.length);
        }
        setLoading(false);
      }
    };

    loadStats();

    return () => {
      isMounted = false;
    };
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

  // Ensure content is not rendered prematurely
  if (totalGamesCount === 0) {
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
          <Overview team={team} />
        </AccordionItem>
        <AccordionItem key="games-in-range" title="Games in Range">
          <GamesInRange totalGamesCount={totalGamesCount} team={team} />
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
