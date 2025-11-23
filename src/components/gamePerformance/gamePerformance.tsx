"use client";

import { TeamName, StatName, IndividualName } from "@/types";
import { useEffect, useMemo, useState } from "react";
import StatLineChart from "../charts/statLineChart";
import { AVERAGE_DAMAGE_STAT_NAME, AVERAGE_KILLS_STAT_NAME, BAR_CHART, DAMAGE_STAT_NAME, GAME_INDEX_KEY, KILL_STEALING_STAT_NAME, KILLS_STAT_NAME, LINE_CHART, TEAM_MEMBER_MAP, WIN_RATE_STAT_NAME } from "@/constants";
import { Spinner } from "@heroui/react";
import StatBarChart from "../charts/statBarChart";
import { StatData } from "@/stats/statBase";
import { AverageKillsStat } from "@/stats/averageKillsStat";
import { AverageDamageStat } from "@/stats/averageDamageStat";
import { TotalKillsStat } from "@/stats/totalKillsStat";
import { TotalDamageStat } from "@/stats/totalDamageStat";
import { WinRateStat } from "@/stats/winrateStat";
import { KillStealingStat } from "@/stats/killStealingStat";

export interface AvgKillsProps {
  team: TeamName;
  statName: StatName;
  selectedMembers: IndividualName[];
}

export default function GamePerformanceStat(props: AvgKillsProps) {
  const [statData, setStatData] = useState<StatData>({ data: [], chartOptions: [] });
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(false);

  const statClass = useMemo(() => {
    switch (props.statName) {
      case AVERAGE_KILLS_STAT_NAME:
        return new AverageKillsStat();
      case AVERAGE_DAMAGE_STAT_NAME:
        return new AverageDamageStat();
      case KILLS_STAT_NAME:
        return new TotalKillsStat();
      case DAMAGE_STAT_NAME:
        return new TotalDamageStat();
      case WIN_RATE_STAT_NAME:
        return new WinRateStat();
      case KILL_STEALING_STAT_NAME:
        return new KillStealingStat();
      default:
        return null;
    }
  }, [props.statName]);

  const loadStats = async () => {
    setLoading(true);
    setLoadingError(false);
    if (!statClass) return;

    const stats = await statClass.getStats(props.team);
    if (!stats) {
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
  }, [props.team, statClass]);

  const filteredStatData = useMemo<StatData>(() => {
    if (!statData || props.selectedMembers.length === TEAM_MEMBER_MAP[props.team].length || !statClass?.hasMembers) {
      return statData;
    }

    const filteredOptions = statData.chartOptions.filter(option =>
      props.selectedMembers.some(member => option.key.startsWith(member))
    );

    const dataKeys = Object.keys(statData.data[0]);

    const filteredData = statData.data.map(data => {
      const filteredData: Record<string, number> = {};
      dataKeys.forEach(key => {
        if (props.selectedMembers.some(member => key.startsWith(member)) || key === GAME_INDEX_KEY) {
          filteredData[key] = data[key];
        }
      });
      return filteredData;
    });
    // console.log("Filtered options: ", filteredOptions);
    // console.log("Filtered data: ", filteredData);

    return {
      data: filteredData,
      chartOptions: filteredOptions,
    };
  }, [statData, props.selectedMembers, props.team]);

  const getChart = () => {
    switch (statClass?.chartType || LINE_CHART) {
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
        <h2 className="p-2 self-start">{statClass?.statDisplayName}</h2>
        {getChart()}
      </div>
    </div>
  );
}