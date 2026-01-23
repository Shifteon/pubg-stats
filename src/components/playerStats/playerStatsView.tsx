"use client";

import { useState } from "react";
import { PlayerAggregatedData } from "@/stats/playerStat";
import { Avatar, Tabs, Tab, Divider } from "@heroui/react";
import OverviewTab from "./OverviewTab";
import ByTeamTab from "./ByTeamTab";
import { usePlayerStatsData } from "@/hooks/usePlayerStatsData";

interface PlayerStatsViewProps {
  data: PlayerAggregatedData;
  playerName: string;
}

export default function PlayerStatsView({ data, playerName }: PlayerStatsViewProps) {
  const [selectedTab, setSelectedTab] = useState<string>("overview");

  const {
    designation,
    avatarSrc,
    aggregatedStats,
    signatureStatConfig,
    signatureStatValue,
    mostPlayedTeamName,
    formatValue
  } = usePlayerStatsData(data, playerName);

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-0 bg-content1 p-6 rounded-lg items-center md:items-start">
          {/* Player Name */}
          <div className="flex flex-col md:flex-row shrink-0 items-center gap-4">
            <Avatar
              src={avatarSrc?.src}
              name={playerName.charAt(0).toUpperCase()}
              className="w-[140px] h-[140px] text-large shrink-0"
            />
            <div className="flex flex-col md:flex-row justify-between text-center md:text-left items-center md:items-start w-full gap-4">
              <div>
                <h2 className="text-3xl font-bold capitalize">{playerName}</h2>
                <p className="text-xl text-primary font-semibold">{designation}</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-4 flex-wrap justify-center md:justify-start self-end">
            <div className="p-4 bg-background/50 rounded-lg inline-block">
              <p className="text-sm text-default-500 uppercase font-bold tracking-wider">Best Stat (Avg)</p>
              <p className="text-2xl font-bold">
                {signatureStatConfig.label}: <span className="text-secondary">{formatValue(signatureStatConfig.key, signatureStatValue)}</span>
              </p>
            </div>

            <div className="p-4 bg-background/50 rounded-lg inline-block">
              <p className="text-sm text-default-500 uppercase font-bold tracking-wider">Most Played Team</p>
              <p className="text-2xl font-bold line-clamp-1">
                {mostPlayedTeamName}
              </p>
            </div>

            <Divider className="h-[80px] hidden lg:block" orientation="vertical" />

            <div className="flex gap-4 flex-wrap justify-center md:justify-end items-center">
              <div className="flex flex-col items-center p-3 bg-background/50 rounded-lg min-w-[100px]">
                <span className="text-xs text-default-500 uppercase font-bold">Games</span>
                <span className="text-2xl font-bold">{aggregatedStats.gamesPlayed}</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-background/50 rounded-lg min-w-[100px]">
                <span className="text-xs text-default-500 uppercase font-bold">Wins</span>
                <span className="text-2xl font-bold text-success">{aggregatedStats.totalWins}</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-background/50 rounded-lg min-w-[100px]">
                <span className="text-xs text-default-500 uppercase font-bold">Losses</span>
                <span className="text-2xl font-bold text-danger">{aggregatedStats.totalLosses}</span>
              </div>
            </div>
          </div>
        </div>

        <Tabs
          aria-label="Player Stats Tabs"
          color="primary"
          selectedKey={selectedTab}
          onSelectionChange={(key) => setSelectedTab(key as string)}
        >
          <Tab key="overview" title="Overview">
            {/* Pass aggregatedStats to avoid recalculation */}
            <OverviewTab aggregatedStats={aggregatedStats} />
          </Tab>
          <Tab key="byteam" title="By Team">
            <ByTeamTab data={data} />
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}
