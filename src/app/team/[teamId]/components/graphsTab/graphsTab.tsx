"use client";

import { Avatar, Chip } from "@heroui/react";
import GamePerformanceStat from "@/app/team/[teamId]/components/gamePerformance/gamePerformance";
import { AVATAR_SRC_MAP, GAME_SUMMARY_STAT_NAME, KILL_STEALING_STAT_NAME, SUPPORTED_STATS, TEAM_MEMBER_MAP, TWO_MAN_TEAMS } from "@/constants";
import { useState, useEffect } from "react";
import { IndividualName, StatName, TeamName } from "@/types";
import React from "react";

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

export default function GraphsTab({ team }: { team: TeamName }) {
  const initStatsToGraph = (teamName: TeamName) => {
    if (TWO_MAN_TEAMS.includes(teamName)) {
      // Two man teams don't have kill stealing stat
      return [...SUPPORTED_STATS.filter(stat => stat !== GAME_SUMMARY_STAT_NAME && stat !== KILL_STEALING_STAT_NAME)];
    }
    return [...SUPPORTED_STATS.filter(stat => stat !== GAME_SUMMARY_STAT_NAME)];
  };

  const [selectedMembers, setSelectedMembers] = useState<IndividualName[]>(
    () => (TEAM_MEMBER_MAP[team] as IndividualName[]) || []
  );
  const [statsToGraph, setStatsToGraph] = useState<StatName[]>(() => initStatsToGraph(team));

  useEffect(() => {
    setSelectedMembers((TEAM_MEMBER_MAP[team] as IndividualName[]) || []);
    setStatsToGraph(initStatsToGraph(team));
  }, [team]);

  const handleMemberSelectionChange = (memberName: IndividualName) => {
    setSelectedMembers(prevSelected => {
      if (prevSelected.includes(memberName)) {
        return prevSelected.filter(m => m !== memberName);
      } else {
        return [...prevSelected, memberName];
      }
    });
  };

  return (
    <>
      <div className="p-2 mt-2">
        <p className="text-sm text-gray-500 mb-2">Filter Members</p>
        <div className="flex flex-wrap gap-2">
          {TEAM_MEMBER_MAP[team]?.map((member) => {
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
            <GamePerformanceStat team={team} statName={statName} selectedMembers={selectedMembers}></GamePerformanceStat>
          </React.Fragment>
        ))}
      </div>
    </>
  );
}
