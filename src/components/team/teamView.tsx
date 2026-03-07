"use client";

import { Avatar, Chip, Tab, Tabs } from "@heroui/react";
import GamePerformanceStat from "@/components/gamePerformance/gamePerformance";
import { AVATAR_SRC_MAP, GAME_SUMMARY_STAT_NAME, KILL_STEALING_STAT_NAME, SUPPORTED_STATS, TEAM_ALL, TEAM_DISPLAY_NAMES, TEAM_MEMBER_MAP, TWO_MAN_TEAMS } from "@/constants";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { Key } from '@react-types/shared';
import { IndividualName, StatName, TeamName, Teams } from "@/types";
import React from "react";
import GameSummary from "@/components/gameSummary/gameSummary";
import GamesInRange from "@/components/gameSummary/components/GamesInRange";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import LoadingSpinner from "@/components/loadingSpinner";

const CloseIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    aria-hidden="true"
    focusable="false"
    height="1em"
    role="presentation"
    viewBox="0 0 24 24"
    width="1em"
    {...props}
  >
    <path
      d="M12 2a10 10 0 1010 10A10.011 10.011 0 0012 2zm4.3 14.3a.996.996 0 01-1.41 0L12 13.41l-2.89 2.89a.996.996 0 11-1.41-1.41L10.59 12 7.7 9.11a.996.996 0 111.41-1.41L12 10.59l2.89-2.89a.996.996 0 111.41 1.41L13.41 12l2.89 2.89a.996.996 0 010 1.41z"
      fill="currentColor"
    />
  </svg>
);

const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg aria-hidden="true" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
    <path d="M12 2a10 10 0 1010 10A10.011 10.011 0 0012 2zm5 11h-4v4a1 1 0 01-2 0v-4H7a1 1 0 010-2h4V7a1 1 0 012 0v4h4a1 1 0 010 2z" fill="currentColor" />
  </svg>
);

export default function TeamView({ teamName }: { teamName: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [teams, setTeams] = useState<Teams>([]);
  const [selectedTeam, setSelectedTeam] = useState<TeamName | null>(null);

  const [selectedMembers, setSelectedMembers] = useState<IndividualName[]>([]);
  const [selectedTab, setSelectedTab] = useState<Key>(() => {
    const tabFromParams = searchParams.get('tab') as Key;
    if (tabFromParams && ['summary', 'graphs', 'games-in-range'].includes(tabFromParams as string)) {
      return tabFromParams;
    }
    return 'summary' as Key;
  });

  const initStatsToGraph = (team: TeamName) => {
    if (TWO_MAN_TEAMS.includes(team)) {
      // Two man teams don't have kill stealing stat
      return [...SUPPORTED_STATS.filter(stat => stat !== GAME_SUMMARY_STAT_NAME && stat !== KILL_STEALING_STAT_NAME)];
    }
    return [...SUPPORTED_STATS.filter(stat => stat !== GAME_SUMMARY_STAT_NAME)];
  };

  const [statsToGraph, setStatsToGraph] = useState<StatName[]>([]);

  useEffect(() => {
    fetch('/api/team')
      .then((res) => res.json())
      .then((data: Teams) => {
        setTeams(data);
        const match = data.find((t) => t.name === teamName);
        if (match) {
          const type = match.teamType as TeamName;
          setSelectedTeam(type);
          setSelectedMembers(TEAM_MEMBER_MAP[type] as IndividualName[]);
          setStatsToGraph(initStatsToGraph(type));
        }
      })
      .catch((err) => console.error("Error fetching teams:", err));
  }, [teamName]);

  const handleTabChange = (newTab: Key) => {
    setSelectedTab(newTab);
    handleUpdateParam('tab', newTab as string);
  };

  const handleMemberSelectionChange = (memberName: IndividualName) => {
    setSelectedMembers(prevSelected => {
      if (prevSelected.includes(memberName)) {
        return prevSelected.filter(m => m !== memberName);
      } else {
        return [...prevSelected, memberName];
      }
    });
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
            <div className="p-2 mt-2">
              <p className="text-sm text-gray-500 mb-2">Filter Members</p>
              <div className="flex flex-wrap gap-2">
                {TEAM_MEMBER_MAP[selectedTeam]?.map((member) => {
                  const isSelected = selectedMembers.includes(member as IndividualName);
                  return (
                    <Chip
                      key={member}
                      variant={isSelected ? "solid" : "bordered"}
                      color={isSelected ? "primary" : "default"}
                      avatar={<Avatar name={member.charAt(0).toUpperCase()} src={AVATAR_SRC_MAP[member]?.src} />}
                      endContent={isSelected ? <CloseIcon /> : <PlusIcon />}
                      onClick={() => handleMemberSelectionChange(member as IndividualName)}
                      className="cursor-pointer"
                    >
                      {member.charAt(0).toUpperCase() + member.slice(1)}
                    </Chip>
                  );
                })}
              </div>
            </div>
            <div className="lg:grid lg:grid-cols-2 gap-1">
              {statsToGraph.map((statName, index) => (
                <React.Fragment key={index}>
                  <GamePerformanceStat team={selectedTeam} statName={statName} selectedMembers={selectedMembers}></GamePerformanceStat>
                </React.Fragment>
              ))
              }
            </div>
          </Tab>
        </Tabs>
      </div>
    </>
  );
}
