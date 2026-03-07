"use client";

import { Tab, Tabs } from "@heroui/react";
import { useCallback, useEffect, useState } from "react";
import { Key } from '@react-types/shared';
import { TeamName, Teams } from "@/types";
import React from "react";
import GameSummary from "@/app/team/[teamId]/components/gameSummary/gameSummary";
import GamesInRange from "@/app/team/[teamId]/components/gamesInRange/GamesInRange";
import GraphsTab from "@/app/team/[teamId]/components/graphsTab/graphsTab";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import LoadingSpinner from "@/components/loadingSpinner";

export default function TeamView({ teamName }: { teamName: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [teams, setTeams] = useState<Teams>([]);
  const [selectedTeam, setSelectedTeam] = useState<TeamName | null>(null);

  const [selectedTab, setSelectedTab] = useState<Key>(() => {
    const tabFromParams = searchParams.get('tab') as Key;
    if (tabFromParams && ['summary', 'graphs', 'games-in-range'].includes(tabFromParams as string)) {
      return tabFromParams;
    }
    return 'summary' as Key;
  });

  useEffect(() => {
    fetch('/api/team')
      .then((res) => res.json())
      .then((data: Teams) => {
        setTeams(data);
        const match = data.find((t) => t.name === teamName);
        if (match) {
          const type = match.teamType as TeamName;
          setSelectedTeam(type);
        }
      })
      .catch((err) => console.error("Error fetching teams:", err));
  }, [teamName]);

  const handleTabChange = (newTab: Key) => {
    setSelectedTab(newTab);
    handleUpdateParam('tab', newTab as string);
  };



  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  const handleUpdateParam = (paramName: string, paramValue: string) => {
    router.push(pathname + '?' + createQueryString(paramName, paramValue));
  };

  useEffect(() => {
    const tabFromParams = searchParams.get('tab') as Key;
    if (tabFromParams && ['summary', 'graphs', 'games-in-range'].includes(tabFromParams as string) && tabFromParams !== selectedTab) {
      setSelectedTab(tabFromParams);
    }
  }, [searchParams]);

  if (!selectedTeam) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <div className="mt-2 mr-2 ml-2 mb-10 xl:m-10 lg:m-5 md:m-3">
        <h1 className="text-3xl font-bold mb-6">{teamName}</h1>
        <Tabs
          className="mt-5"
          destroyInactiveTabPanel={true}
          color="primary"
          onSelectionChange={handleTabChange}
          selectedKey={selectedTab}
        >
          <Tab key="summary" title="Summary">
            <GameSummary team={selectedTeam} />
          </Tab>
          <Tab key="games-in-range" title="Games in Range">
            <div className="mt-4">
              <GamesInRange team={selectedTeam} />
            </div>
          </Tab>
          <Tab key="graphs" title="Graphs">
            <GraphsTab team={selectedTeam} />
          </Tab>
        </Tabs>
      </div>
    </>
  );
}
