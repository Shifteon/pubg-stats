"use client";

import { Select, SelectItem } from "@heroui/react";
import GamePerformanceStat from "./stats/gamePerformance";
import { SUPPORTED_STATS, TEAM_ALL, TEAM_NO_BEN, TEAM_NO_CODY, TEAM_NO_ISAAC, TEAM_NO_TRENTON } from "@/constants";
import { ChangeEvent, useState } from "react";
import { TeamName } from "@/types";
import React from "react";

const teamOptions = [
  {key: TEAM_ALL, label: TEAM_ALL},
  {key: TEAM_NO_BEN, label: 'Isaac, Cody, Trenton'},
  {key: TEAM_NO_TRENTON, label: 'Isaac, Cody, Ben'},
  {key: TEAM_NO_CODY, label: 'Isaac, Ben, Trenton'},
  {key: TEAM_NO_ISAAC, label: 'Cody, Ben, Trenton'},
];

export default function HomeComponent() {
  const [selectedTeam, setSelectedTeam] = useState<TeamName>(TEAM_ALL);

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedTeam(e.target.value as TeamName);
  };

  return (
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
      <div className="lg:grid lg:grid-cols-2">
        {SUPPORTED_STATS.map((statName, index) => (
          <React.Fragment key={index}>
            <GamePerformanceStat team={selectedTeam} statName={statName}></GamePerformanceStat>
          </React.Fragment>
        ))
        }
      </div>
    </div>
  );
}