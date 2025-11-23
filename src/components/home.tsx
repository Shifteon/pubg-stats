"use client";

import { Avatar, Chip, Select, SelectItem, Tab, Tabs } from "@heroui/react";
import GamePerformanceStat from "./stats/gamePerformance";
import { AVATAR_SRC_MAP, GAME_SUMMARY_STAT_NAME, KILL_STEALING_STAT_NAME, SUPPORTED_STATS, TEAM_ALL, TEAM_ISAAC_BEN, TEAM_ISAAC_CODY, TEAM_ISAAC_TRENTON, TEAM_MEMBER_MAP, TEAM_NO_BEN, TEAM_NO_CODY, TEAM_NO_ISAAC, TEAM_NO_TRENTON, TWO_MAN_TEAMS } from "@/constants";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { Key } from '@react-types/shared';
import { IndividualName, StatName, TeamName } from "@/types";
import React from "react";
import GameSummary from "./stats/gameSummary";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const teamOptions = [
  { key: TEAM_ALL, label: TEAM_ALL },
  { key: TEAM_NO_BEN, label: 'Isaac, Cody, Trenton' },
  { key: TEAM_NO_TRENTON, label: 'Isaac, Cody, Ben' },
  { key: TEAM_NO_CODY, label: 'Isaac, Ben, Trenton' },
  { key: TEAM_NO_ISAAC, label: 'Cody, Ben, Trenton' },
  { key: TEAM_ISAAC_BEN, label: 'Isaac, Ben' },
  { key: TEAM_ISAAC_CODY, label: 'Isaac, Cody' },
  { key: TEAM_ISAAC_TRENTON, label: 'Isaac, Trenton' },
];

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

export default function HomeComponent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [selectedTeam, setSelectedTeam] = useState<TeamName>(() => {
    const teamFromParams = searchParams.get('team') as TeamName;
    if (teamFromParams && teamOptions.some(o => o.key === teamFromParams)) {
      return teamFromParams;
    }
    return TEAM_ALL;
  });
  const [selectedMembers, setSelectedMembers] = useState<IndividualName[]>(TEAM_MEMBER_MAP[selectedTeam] as IndividualName[]);
  const [selectedTab, setSelectedTab] = useState<Key>(() => {
    const tabFromParams = searchParams.get('tab') as Key;
    if (tabFromParams && ['summary', 'graphs'].includes(tabFromParams as string)) {
      return tabFromParams;
    }
    return 'summary' as Key;
  });

  const initStatsToGraph = () => {
    if (TWO_MAN_TEAMS.includes(selectedTeam)) {
      // Two man teams don't have kill stealing stat
      return [...SUPPORTED_STATS.filter(stat => stat !== GAME_SUMMARY_STAT_NAME && stat !== KILL_STEALING_STAT_NAME)];
    }
    return [...SUPPORTED_STATS.filter(stat => stat !== GAME_SUMMARY_STAT_NAME)];
  };

  const [statsToGraph, setStatsToGraph] = useState<StatName[]>(initStatsToGraph());

  const handleTeamChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newTeam = e.target.value as TeamName;
    if (!newTeam || newTeam === selectedTeam) {
      return;
    }
    setSelectedTeam(newTeam);
    handleUpdateParam('team', newTeam);
  };

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
    const teamFromParams = searchParams.get('team') as TeamName;
    const tabFromParams = searchParams.get('tab') as Key;
    if (teamFromParams && teamOptions.some(o => o.key === teamFromParams) && teamFromParams !== selectedTeam) {
      setSelectedTeam(teamFromParams);
    }
    if (tabFromParams && ['summary', 'graphs'].includes(tabFromParams as string) && tabFromParams !== selectedTab) {
      setSelectedTab(tabFromParams);
    }
  }, [searchParams]);

  useEffect(() => {
    setSelectedMembers(TEAM_MEMBER_MAP[selectedTeam] as IndividualName[]);
    setStatsToGraph(initStatsToGraph());
  }, [selectedTeam]);

  return (
    <>
      <div className="mt-2 mr-2 ml-2 mb-10 xl:m-10 lg:m-5 md:m-3">
        <Select
          label="Select a team"
          selectionMode="single"
          onChange={handleTeamChange}
          selectedKeys={[selectedTeam]}
        >
          {teamOptions.map((team) => (
            <SelectItem key={team.key}>{team.label}</SelectItem>
          ))
          }
        </Select>
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
          <Tab key="graphs" title="Graphs">
            <div className="p-2 mt-2">
              <p className="text-sm text-gray-500 mb-2">Filter Members</p>
              <div className="flex flex-wrap gap-2">
                {TEAM_MEMBER_MAP[selectedTeam].map((member) => {
                  const isSelected = selectedMembers.includes(member as IndividualName);
                  return (
                    <Chip
                      key={member}
                      variant={isSelected ? "solid" : "bordered"}
                      color={isSelected ? "primary" : "default"}
                      avatar={<Avatar name={member.charAt(0).toUpperCase()} src={AVATAR_SRC_MAP[member]} />}
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
