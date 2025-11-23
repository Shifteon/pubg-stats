"use client";

import { TeamName } from "@/types";
import { Accordion, AccordionItem } from "@heroui/react";
import { useEffect, useMemo, useState } from "react";
import { GameSummaryStat } from "@/stats/gameSummaryStat";
import Overview from "./components/overview";
import LoadingSpinner from "../loadingSpinner";
import HallOfFame from "./components/HallOfFame";
import PersonalBests from "./components/PersonalBests";
import GamesInRange from "./components/GamesInRange";

export interface GameSummaryProps {
  team: TeamName;
}

export default function GameSummary({ team }: GameSummaryProps) {
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  const [allGameData, setAllGameData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(false);

  const statClass = useMemo(() => new GameSummaryStat(), []);

  const loadStats = async () => {
    setLoading(true);
    setLoadingError(false);

    const stats = await statClass.getStats(team);
    if (!stats || !stats.data) {
      setLoadingError(true);
      setLoading(false);
      return;
    }
    setAllGameData(stats.data);
    setLoading(false);
  };

  useEffect(() => {
    loadStats();
  }, [team, statClass]);

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
          <Overview gameData={allGameData} />
        </AccordionItem>
        <AccordionItem key="games-in-range" title="Games in Range">
          <GamesInRange allGameData={allGameData} team={team} />
        </AccordionItem>
        <AccordionItem key="hall-of-fame" title="Hall of Fame">
          <HallOfFame gameData={allGameData} team={team} />
        </AccordionItem>
        <AccordionItem key="personal-bests" title="Personal Bests">
          <PersonalBests gameData={allGameData} team={team} />
        </AccordionItem>
      </Accordion>
    </div>
  );
}
