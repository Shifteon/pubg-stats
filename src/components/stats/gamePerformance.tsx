"use client";

import { FrontendStatArray, TeamName, StatName } from "@/types";
import { useEffect, useState } from "react";
import StatLineChart from "../charts/statLineChart";
import { BAR_CHART, LINE_CHART, STAT_CHART_MAP, STAT_DISPLAY_NAME_MAP } from "@/constants";
import { Skeleton, Spinner } from "@heroui/react";
import StatBarChart from "../charts/statBarChart";

export interface AvgKillsProps {
  team: TeamName;
  statName: StatName;
}

export default function GamePerformanceStat(props: AvgKillsProps) {
  const [stats, setStats] = useState([] as FrontendStatArray);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(false);

  // fetch stats from api
  const fetchStats = async () => {
    try {
      if (!loading) {
        setLoading(true);
      }
      const results = await fetch(`/api/stats?team=${props.team}&stat=${props.statName}`);
      console.log(results.ok);
      if (!results.ok) {
        setLoadingError(true);
        return;
      }

      const json = await results.json();
      setStats(json.frontendStatArray as FrontendStatArray);
      setLoadingError(false);
    } catch (error) {
      setLoadingError(true);
    } finally {
      setLoading(false);
    }
  };

  // fetch stats from api on load
  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchStats();
  }, [props.team]);

  const getChart = () => {
    switch (STAT_CHART_MAP[props.statName]) {
      case LINE_CHART:
        return <StatLineChart data={stats} statName={props.statName} />;
        break;
      case BAR_CHART:
        return <StatBarChart data={stats} statName={props.statName} />;
        break;
      default:
        <div>View Not Found</div>;
        break;
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
        <h2 className="p-2 self-start">{STAT_DISPLAY_NAME_MAP[props.statName]}</h2>
        
        {getChart()}
      </div>
    </div>
  );
}