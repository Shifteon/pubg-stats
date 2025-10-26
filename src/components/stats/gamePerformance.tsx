"use client";

import { FrontendStatArray, TeamName, StatName } from "@/types";
import { useEffect, useMemo, useState } from "react";
import StatLineChart from "../charts/statLineChart";
import { AVERAGE_DAMAGE_STAT_NAME, AVERAGE_KILLS_STAT_NAME, BAR_CHART, DAMAGE_STAT_NAME, KILLS_STAT_NAME, LINE_CHART, WIN_RATE_STAT_NAME } from "@/constants";
import { Spinner } from "@heroui/react";
import StatBarChart from "../charts/statBarChart";
import { StatBase, StatData } from "@/stats/statBase";
import { AverageKillsStat } from "@/stats/averageKillsStat";
import { AverageDamageStat } from "@/stats/averageDamageStat";
import { TotalKillsStat } from "@/stats/totalKillsStat";
import { TotalDamageStat } from "@/stats/totalDamageStat";
import { WinRateStat } from "@/stats/winrateStat";

export interface AvgKillsProps {
  team: TeamName;
  statName: StatName;
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

  const getChart = () => {
    switch (statClass?.chartType || LINE_CHART) {
      case LINE_CHART:
        return <StatLineChart data={statData} />;
      case BAR_CHART:
        return <StatBarChart data={statData} />;
      default:
        return <div>View Not Found</div>;
    }
  };

  return (
    <div className="relative flex flex-col items-center" style={{ marginTop: 5 }}>
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