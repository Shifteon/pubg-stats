"use client";

import { Avatar, Chip, Spinner } from "@heroui/react";
import GamePerformanceStat from "@/app/team/[teamId]/components/gamePerformance/gamePerformance";
import { AVATAR_SRC_MAP, GAME_SUMMARY_STAT_NAME, KILL_STEALING_STAT_NAME, SUPPORTED_STATS } from "@/constants";
import { useState, useEffect } from "react";
import { StatName, PlayerMetadata } from "@/types";
import React from "react";
import { useTeamOverview, useTeamStatsTimeline } from "../../../../../hooks/useTeam";

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

export default function GraphsTab({ teamId }: { teamId: string }) {
  const { teamOverview, isLoading: overviewLoading } = useTeamOverview(teamId);
  const { teamStatsTimeline, isLoading: timelineLoading } = useTeamStatsTimeline(teamId);

  const initStatsToGraph = (playerCount: number) => {
    if (playerCount === 2) {
      // Two man teams don't have kill stealing stat
      return [...SUPPORTED_STATS.filter(stat => stat !== GAME_SUMMARY_STAT_NAME && stat !== KILL_STEALING_STAT_NAME)];
    }
    return [...SUPPORTED_STATS.filter(stat => stat !== GAME_SUMMARY_STAT_NAME)];
  };

  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [statsToGraph, setStatsToGraph] = useState<StatName[]>([]);

  useEffect(() => {
    if (teamOverview?.players) {
      const playerIds = teamOverview.players.map((p: PlayerMetadata) => p.id);
      setSelectedMembers(playerIds);
      setStatsToGraph(initStatsToGraph(playerIds.length) as StatName[]);
    }
  }, [teamOverview]);

  const handleMemberSelectionChange = (memberId: string) => {
    setSelectedMembers(prevSelected => {
      if (prevSelected.includes(memberId)) {
        return prevSelected.filter(m => m !== memberId);
      } else {
        return [...prevSelected, memberId];
      }
    });
  };

  const isLoading = overviewLoading || timelineLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-10">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <>
      {teamOverview && teamOverview.players.length > 0 && (
        <div className="p-2 mt-2">
          <p className="text-sm text-gray-500 mb-2">Filter Members</p>
          <div className="flex flex-wrap gap-2">
            {teamOverview.players.map((member: PlayerMetadata) => {
              const memberId = member.id;
              const isSelected = selectedMembers.includes(memberId);
              return (
                <Chip
                  key={memberId}
                  variant={isSelected ? "solid" : "bordered"}
                  color={isSelected ? "primary" : "default"}
                  avatar={<Avatar name={member.name.charAt(0).toUpperCase()} src={AVATAR_SRC_MAP[member.name.toLowerCase()]?.src} />}
                  endContent={isSelected ? <CloseIcon /> : <PlusIcon />}
                  onClick={() => handleMemberSelectionChange(memberId)}
                  className="cursor-pointer"
                >
                  {member.name.charAt(0).toUpperCase() + member.name.slice(1)}
                </Chip>
              );
            })}
          </div>
        </div>
      )}
      <div className="lg:grid lg:grid-cols-2 gap-1">
        {statsToGraph.map((statName, index) => (
          <React.Fragment key={index}>
            <GamePerformanceStat
              statName={statName}
              selectedMembers={selectedMembers}
              teamStatsTimeline={teamStatsTimeline || []}
              players={teamOverview?.players || []}
            />
          </React.Fragment>
        ))}
      </div>
    </>
  );
}
