"use client";

import { Select, SelectItem, Tab, Tabs } from "@heroui/react";
import GamePerformanceStat from "./stats/gamePerformance";
import { GAME_SUMMARY_STAT_NAME, SUPPORTED_STATS, TEAM_ALL, TEAM_NO_BEN, TEAM_NO_CODY, TEAM_NO_ISAAC, TEAM_NO_TRENTON } from "@/constants";
import { ChangeEvent, useState } from "react";
import { TeamName } from "@/types";
import React from "react";
import GameSummary from "./stats/gameSummary";

const teamOptions = [
  {key: TEAM_ALL, label: TEAM_ALL},
  {key: TEAM_NO_BEN, label: 'Isaac, Cody, Trenton'},
  {key: TEAM_NO_TRENTON, label: 'Isaac, Cody, Ben'},
  {key: TEAM_NO_CODY, label: 'Isaac, Ben, Trenton'},
  {key: TEAM_NO_ISAAC, label: 'Cody, Ben, Trenton'},
];

const stats = [
  ...SUPPORTED_STATS.filter(stat => stat !== GAME_SUMMARY_STAT_NAME)
];

export default function HomeComponent() {
  const [selectedTeam, setSelectedTeam] = useState<TeamName>(TEAM_ALL);

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedTeam(e.target.value as TeamName);
  };

  return (
    <>
      <div className="mt-2 mr-2 ml-2 mb-10 xl:m-10 lg:m-5 md:m-3">
        <Select 
          label="Select a team"
          selectionMode="single"
          onChange={handleChange}
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
        >
          <Tab key="summary" title="Summary">
            <GameSummary team={selectedTeam} />
          </Tab>
          <Tab key="graphs" title="Graphs">
            <div className="lg:grid lg:grid-cols-2 gap-1">
              {stats.map((statName, index) => (
                <React.Fragment key={index}>
                  <GamePerformanceStat team={selectedTeam} statName={statName}></GamePerformanceStat>
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
