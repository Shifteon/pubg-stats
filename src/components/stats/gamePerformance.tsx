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
  const [reloading, setReloading] = useState(false);
  const [loadingError, setLoadingError] = useState(false);

  // fetch stats from api
  const fetchStats = async () => {
    try {
      if (!loading) {
        setReloading(true);
      }
      const results = await fetch(`/api/stats?team=${props.team}&stat=${props.statName}`);
      if (!results.ok) {
        setLoadingError(true);
      }

      const json = await results.json();
      setStats(json.frontendStatArray as FrontendStatArray);
    } catch (error) {
      setLoadingError(true);
    } finally {
      setLoading(false);
      setReloading(false);
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
    <div  className="relative" style={{ marginTop: 5 }}>
      <h2 className="p-2">{STAT_DISPLAY_NAME_MAP[props.statName]}</h2>
      {reloading &&
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/10 w-full h-full rounded-lg p-5">
          <Spinner size="lg" label="Loading" labelColor="primary"></Spinner>
        </div>
      }
      {loading ? (
        // When loading is TRUE
        <Spinner></Spinner>
      ) : (
        // When loading is FALSE
        getChart()
      )}
    </div>
  );
}