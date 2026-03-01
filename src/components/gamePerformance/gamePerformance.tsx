"use client";

import { TeamName, StatName, IndividualName } from "@/types";
import { useEffect, useMemo, useState } from "react";
import StatLineChart from "../charts/statLineChart";
import { BAR_CHART, GAME_INDEX_KEY, LINE_CHART, TEAM_MEMBER_MAP } from "@/constants";
import { Spinner } from "@heroui/react";
import StatBarChart from "../charts/statBarChart";
import { StatData } from "@/stats/statBase";
import { apiService } from "@/services/apiService";

export interface AvgKillsProps {
  team: TeamName;
  statName: StatName;
  selectedMembers: IndividualName[];
}

// Map the statName prop to its user-friendly display name
const STAT_DISPLAY_NAMES: Record<string, string> = {
  avgKills: "Average Kills",
  avgDamage: "Average Damage",
  winRate: "Win Rate",
  killStealing: "Kill Stealing",
  kills: "Total Kills",
  damage: "Total Damage",
};

// Based on the legacy stat classes, map out the default chart type for each stat
const STAT_CHART_TYPES: Record<string, string> = {
  avgKills: LINE_CHART,
  avgDamage: LINE_CHART,
  winRate: LINE_CHART,
  killStealing: LINE_CHART,
  kills: BAR_CHART,
  damage: BAR_CHART,
};

// Based on legacy logic, Kill Stealing & Win Rate don't support individual member filtering because they calculate off the team natively or compare internally
const STATS_WITHOUT_MEMBERS = ["killStealing", "winRate"];

export default function GamePerformanceStat(props: AvgKillsProps) {
  const [statData, setStatData] = useState<StatData>({ data: [], chartOptions: [] });
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(false);

  const statDisplayName = STAT_DISPLAY_NAMES[props.statName] || "Unknown Stat";
  const chartType = STAT_CHART_TYPES[props.statName] || LINE_CHART;
  const hasMembers = !STATS_WITHOUT_MEMBERS.includes(props.statName);

  const loadStats = async () => {
    setLoading(true);
    setLoadingError(false);

    // Fetch the stat data from the new dynamic API endpoint!
    // Output structure mimics the old StatClass.getStats payload: { data: [], chartOptions: [] }
    const url = `/api/team/${props.team}/stats/${props.statName}`;
    const stats = await apiService.fetchWithCache<StatData>(url);

    if (!stats || !stats.data) {
      setLoadingError(true);
      setLoading(false);
      return;
    }

    setStatData(stats);
    setLoading(false);
  }

  // fetch stats from api on load
  useEffect(() => {
    loadStats();
  }, [props.team, props.statName]);

  const filteredStatData = useMemo<StatData>(() => {
    if (!statData || props.selectedMembers.length === TEAM_MEMBER_MAP[props.team].length || !hasMembers) {
      return statData;
    }

    const filteredOptions = statData.chartOptions.filter(option =>
      props.selectedMembers.some(member => option.key.startsWith(member))
    );

    const dataKeys = Object.keys(statData.data[0] || {});

    const filteredData = statData.data.map(data => {
      const filteredDataObj: Record<string, number> = {};
      dataKeys.forEach(key => {
        if (props.selectedMembers.some(member => key.startsWith(member)) || key === GAME_INDEX_KEY) {
          filteredDataObj[key] = data[key];
        }
      });
      return filteredDataObj;
    });

    return {
      data: filteredData,
      chartOptions: filteredOptions,
    };
  }, [statData, props.selectedMembers, props.team, hasMembers]);

  const getChart = () => {
    switch (chartType) {
      case LINE_CHART:
        return <StatLineChart data={filteredStatData} />;
      case BAR_CHART:
        return <StatBarChart data={filteredStatData} />;
      default:
        return <div>View Not Found</div>;
    }
  };

  return (
    <div className="relative mt-2">
      {loading &&
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/10 w-full h-full rounded-lg p-5">
          <Spinner size="lg" label="Loading" labelColor="primary"></Spinner>
        </div>
      }
      {loadingError &&
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/10 w-full h-full rounded-lg p-5">
          <h2 className="text-red-950 text-4xl text-shadow-md">Error loading stats</h2>
        </div>
      }
      <div className="w-full flex flex-col items-center">
        <h2 className="p-2 self-start">{statDisplayName}</h2>
        {getChart()}
      </div>
    </div>
  );
}